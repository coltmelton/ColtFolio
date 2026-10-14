from __future__ import annotations

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


ServiceStatus = Literal["online", "degraded", "offline", "unknown"]
ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))
PROMETHEUS_URL = os.environ.get("PROMETHEUS_URL", "").rstrip("/")
PROMETHEUS_BEARER_TOKEN = os.environ.get("PROMETHEUS_BEARER_TOKEN", "")
HEALTH_TIMEOUT_SECONDS = 2


def safe_health_url(url: str | None) -> str | None:
    if not url:
        return None

    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password:
        return None

    return url


def check_service(name: str, url: str | None, description: str) -> dict[str, object]:
    url = safe_health_url(url)
    if not url:
        return {
            "name": name,
            "status": "unknown",
            "description": f"{description}; live health not configured",
        }

    start = time.perf_counter()
    request = Request(url, method="GET", headers={"User-Agent": "ColtFolio-Homelab-Status/1.0"})

    try:
        with urlopen(request, timeout=HEALTH_TIMEOUT_SECONDS) as response:
            latency_ms = round((time.perf_counter() - start) * 1000)
            status: ServiceStatus = "online" if 200 <= response.status < 300 else "degraded"
            return {
                "name": name,
                "status": status,
                "latencyMs": latency_ms,
                "description": description,
            }
    except HTTPError:
        latency_ms = round((time.perf_counter() - start) * 1000)
        return {
            "name": name,
            "status": "degraded",
            "latencyMs": latency_ms,
            "description": description,
        }
    except (TimeoutError, URLError, OSError):
        return {
            "name": name,
            "status": "offline",
            "description": description,
        }


def prometheus_query(query: str) -> float | None:
    base_url = safe_health_url(PROMETHEUS_URL)
    if not base_url:
        return None

    request = Request(
        f"{base_url}/api/v1/query?{urlencode({'query': query})}",
        headers={"Accept": "application/json", "User-Agent": "ColtFolio-Homelab-Status/1.0"},
    )
    if PROMETHEUS_BEARER_TOKEN:
        request.add_header("Authorization", "Bearer " + PROMETHEUS_BEARER_TOKEN)

    try:
        with urlopen(request, timeout=HEALTH_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read(65536))
    except (HTTPError, TimeoutError, URLError, OSError, json.JSONDecodeError):
        return None

    if not isinstance(payload, dict) or payload.get("status") != "success":
        return None
    data = payload.get("data")
    results = data.get("result", []) if isinstance(data, dict) else []
    if not isinstance(results, list):
        return None
    if not results:
        return None
    try:
        return float(results[0]["value"][1])
    except (KeyError, IndexError, TypeError, ValueError):
        return None


def prometheus_metrics() -> tuple[list[dict[str, str]], ServiceStatus]:
    if not safe_health_url(PROMETHEUS_URL):
        return [], "unknown"

    queries = {
        "CPU": os.environ.get(
            "PROMETHEUS_QUERY_CPU",
            '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])))',
        ),
        "Memory": os.environ.get(
            "PROMETHEUS_QUERY_MEMORY",
            "100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)",
        ),
        "Root filesystem": os.environ.get(
            "PROMETHEUS_QUERY_DISK",
            '100 * (1 - sum(node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay"}) / sum(node_filesystem_size_bytes{mountpoint="/",fstype!~"tmpfs|overlay"}))',
        ),
        "Node Exporter": os.environ.get(
            "PROMETHEUS_QUERY_NODE_EXPORTER",
            'max(up{job=~".*node.*"})',
        ),
    }
    with ThreadPoolExecutor(max_workers=len(queries)) as executor:
        results = dict(zip(queries, executor.map(prometheus_query, queries.values())))

    metrics = [
        {"label": label, "value": f"{value:.1f}%" if value is not None else "Unavailable"}
        for label, value in results.items()
        if label != "Node Exporter"
    ]
    exporter_value = results["Node Exporter"]
    exporter_status: ServiceStatus = (
        "unknown" if exporter_value is None else "online" if exporter_value > 0 else "offline"
    )
    return metrics, exporter_status


def homelab_status_payload() -> dict[str, object]:
    metrics, node_exporter_status = prometheus_metrics()
    health_checks = [
        ("Nextcloud", os.environ.get("NEXTCLOUD_HEALTH_URL"), "Personal cloud storage"),
        ("Grafana", os.environ.get("GRAFANA_HEALTH_URL"), "Monitoring dashboards"),
        ("Homepage", os.environ.get("HOMEPAGE_HEALTH_URL"), "Homelab service dashboard"),
        (
            "Prometheus",
            f"{PROMETHEUS_URL}/-/ready" if PROMETHEUS_URL else None,
            "Metrics collection and queries",
        ),
        ("Cloudflare", os.environ.get("CLOUDFLARE_HEALTH_URL"), "DNS / tunnel / edge routing"),
    ]
    with ThreadPoolExecutor(max_workers=len(health_checks)) as executor:
        services = list(executor.map(lambda check: check_service(*check), health_checks))
    services.insert(
        4,
        {
            "name": "Node Exporter",
            "status": node_exporter_status,
            "description": (
                "Ubuntu host metrics collected by Prometheus"
                if node_exporter_status != "unknown"
                else "No Node Exporter result; check Prometheus queries and scrape target"
            ),
        },
    )

    return {
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "services": services,
        "metrics": metrics,
        "infrastructure": {
            "host": os.environ.get("HOMELAB_HOST", "Ubuntu homelab"),
            "cpu": os.environ.get("HOMELAB_CPU", ""),
            "memory": os.environ.get("HOMELAB_MEMORY", ""),
            "storage": os.environ.get("HOMELAB_STORAGE", ""),
            "os": os.environ.get("HOMELAB_OS", "Ubuntu Server"),
            "runtime": os.environ.get("HOMELAB_RUNTIME", ""),
        },
    }


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0].rstrip("/") == "/api/homelab-status":
            self.send_homelab_status()
            return
        super().do_GET()

    def do_OPTIONS(self) -> None:
        if self.path.split("?", 1)[0].rstrip("/") != "/api/homelab-status":
            self.send_error(404)
            return
        self.send_response(204)
        self.send_status_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Accept")
        self.end_headers()

    def send_status_cors_headers(self) -> None:
        allowed_origin = os.environ.get("CORS_ORIGIN", "").strip()
        request_origin = self.headers.get("Origin", "")
        if allowed_origin and request_origin == allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
            self.send_header("Vary", "Origin")

    def send_homelab_status(self) -> None:
        body = json.dumps(homelab_status_payload()).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.send_status_cors_headers()
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), PortfolioHandler)
    print(f"Serving ColtFolio from {ROOT} on local port {PORT}")
    print("Homelab API available at /api/homelab-status")
    server.serve_forever()


if __name__ == "__main__":
    main()
