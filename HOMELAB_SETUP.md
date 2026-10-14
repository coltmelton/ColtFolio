# Homelab status API setup

The portfolio is hosted exclusively at `https://coltmelton.dev` by the
Cloudflare Worker `coltfolio`. Its `homelab-api-url` meta tag points to
`https://status.coltmelton.dev/api/homelab-status`. The browser reads host,
status, timestamp, hardware, metrics, and services from that endpoint.
The current monitored services are Node Exporter and cAdvisor; GPU
utilization is not implemented.

The Ubuntu API already supplies these metrics, so frontend deployment does
not require changing it. The configuration below documents the local
`Main.py` server; it is a separate implementation with an older response
format and is not the production endpoint used by the portfolio.

## 1. Configure the Ubuntu server

Install Node Exporter and make sure Prometheus scrapes it. The default PromQL
expects Node Exporter metrics such as `node_cpu_seconds_total` and
`node_memory_MemAvailable_bytes`, and a Prometheus scrape job whose name
contains `node`.

Set the endpoint values in the environment where `Main.py` runs. For a
single-server setup, an environment file can look like:

```dotenv
PORT=8000
PROMETHEUS_URL=http://127.0.0.1:9090
GRAFANA_HEALTH_URL=http://127.0.0.1:3000/api/health
HOMEPAGE_HEALTH_URL=http://127.0.0.1:3001/
NEXTCLOUD_HEALTH_URL=http://127.0.0.1/status.php
CLOUDFLARE_HEALTH_URL=

HOMELAB_HOST=Ubuntu homelab
HOMELAB_CPU=Intel i7-2600
HOMELAB_MEMORY=8 GB
HOMELAB_STORAGE=2x2 TB RAID1 + 1 TB OS
HOMELAB_OS=Ubuntu Server
HOMELAB_RUNTIME=8+ years
```

Use the actual local ports/URLs for your services. Unconfigured services
appear as **Unknown**. Prometheus health is
checked at `PROMETHEUS_URL/-/ready`. If Prometheus requires authentication,
set `PROMETHEUS_BEARER_TOKEN` in the server environment; never put it in
`index.html` or browser JavaScript.

To run it manually on Ubuntu:

```bash
cd /opt/coltfolio
set -a
. /etc/coltfolio-homelab.env
set +a
python3 Main.py
```

No Node.js build step is required. The Python server serves the existing
website files directly from the project directory.

For a persistent setup, run it under systemd and put the variables in a
root-readable `/etc/coltfolio-homelab.env`:

```ini
# /etc/systemd/system/coltfolio.service
[Unit]
Description=ColtFolio site and homelab status API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/coltfolio
EnvironmentFile=/etc/coltfolio-homelab.env
ExecStart=/usr/bin/python3 /opt/coltfolio/Main.py
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Restrict that environment file because it may contain a Prometheus token:

```bash
sudo chown root:root /etc/coltfolio-homelab.env
sudo chmod 600 /etc/coltfolio-homelab.env
```

Then enable and verify it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now coltfolio
curl http://127.0.0.1:8000/api/homelab-status
```

## 2. Make the status API reachable from the public website

The portfolio Worker at `https://coltmelton.dev` calls the existing Ubuntu
API at `https://status.coltmelton.dev/api/homelab-status`. Keep that public
status route connected to the existing API through Cloudflare. Do not point
visitors at `127.0.0.1` or expose Prometheus's port `9090` to the internet.

The API must allow the exact portfolio origin. For the local `Main.py`
implementation, the corresponding environment setting is:

```dotenv
CORS_ORIGIN=https://coltmelton.dev
```

Only restart this local service if its environment values were changed:

```bash
sudo systemctl restart coltfolio
```

The frontend fetches the endpoint on page load and displays CPU, memory,
root-disk utilization, uptime, host status, hardware, service state, and the
last sample time. Redeploy `coltfolio` on Cloudflare to publish frontend
changes at `https://coltmelton.dev`.

## Optional Prometheus query overrides

If your Prometheus job labels, exporter setup, or multi-host layout differ
from the defaults, set `PROMETHEUS_QUERY_CPU`, `PROMETHEUS_QUERY_MEMORY`,
`PROMETHEUS_QUERY_DISK`, or `PROMETHEUS_QUERY_NODE_EXPORTER` to PromQL
expressions that return one instant-vector value. The values are sent to the
browser as display strings only.
