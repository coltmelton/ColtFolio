from __future__ import annotations

import json
import os
import time
from ipaddress import ip_address
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


ServiceStatus = Literal["online", "degraded", "offline", "unknown"]
ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))


def safe_health_url(url: str | None) -> str | None:
    if not url:
        return None

    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return None

    hostname = parsed.hostname.lower()
    if hostname in {"localhost", "127.0.0.1", "::1"}:
        return None

    try:
        host_ip = ip_address(hostname)
    except ValueError:
        return url

    if host_ip.is_private or host_ip.is_loopback or host_ip.is_link_local:
        return None

    return url


def check_service(name: str, url: str | None, description: str) -> dict[str, object]:
    url = safe_health_url(url)
    if not url:
        return {
            "name": name,
            "status": "online",
            "description": description,
        }

    start = time.perf_counter()
    request = Request(url, method="GET", headers={"User-Agent": "ColtFolio-Homelab-Status/1.0"})

    try:
        with urlopen(request, timeout=2) as response:
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
            "status": "unknown",
            "description": description,
        }


def homelab_status_payload() -> dict[str, object]:
    services = [
        check_service(
            "Nextcloud",
            os.environ.get("NEXTCLOUD_HEALTH_URL"),
            "Personal cloud storage",
        ),
        check_service(
            "Cloudflare",
            os.environ.get("CLOUDFLARE_HEALTH_URL"),
            "DNS / tunnel / edge routing",
        ),
        {
            "name": "Storage",
            "status": "online",
            "description": "RAID1 storage volume",
        },
    ]

    return {
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "services": services,
        "infrastructure": {
            "host": "Dell XPS 8300",
            "cpu": "Intel i7-2600",
            "memory": "8 GB DDR3",
            "storage": "2x2 TB RAID1 + 1 TB OS",
            "os": "Ubuntu Server / Linux",
            "runtime": "8+ years",
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

    def send_homelab_status(self) -> None:
        body = json.dumps(homelab_status_payload()).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), PortfolioHandler)
    print(f"Serving ColtFolio on local port {PORT}")
    print("Homelab API available at /api/homelab-status")
    server.serve_forever()


if __name__ == "__main__":
    main()
