# Homelab status API setup

The existing portfolio monitor requests `/api/homelab-status` from the same
origin as the website. `Main.py` serves the unchanged site files from the
project root and provides that API. The server checks configured service
health URLs and queries Prometheus for CPU, memory, root-filesystem, and Node
Exporter status. Prometheus and its credentials stay on the Ubuntu server;
the browser only receives the status response.

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

The site monitor calls the API at the website's own origin. To keep the
frontend unchanged, route the website and API together through Cloudflare
Tunnel to `http://localhost:8000`; do not point visitors at `127.0.0.1` and do
not expose Prometheus's port `9090` to the internet. If the website remains
hosted separately on Netlify, its same-origin API request will not reach this
Ubuntu server without an external reverse-proxy route.

If a reverse proxy calls the API from a different origin, allow that exact
website origin in the Ubuntu environment file:

```dotenv
CORS_ORIGIN=https://coltmelton.netlify.app
```

If you use a custom domain for the portfolio, use that exact origin instead.
Restart the service after changing environment values:

```bash
sudo systemctl restart coltfolio
```

The monitor polls the endpoint and displays service state plus Prometheus
CPU, memory, and disk usage. The returned host details and metrics are public,
so only include information you are comfortable publishing.

## Optional Prometheus query overrides

If your Prometheus job labels, exporter setup, or multi-host layout differ
from the defaults, set `PROMETHEUS_QUERY_CPU`, `PROMETHEUS_QUERY_MEMORY`,
`PROMETHEUS_QUERY_DISK`, or `PROMETHEUS_QUERY_NODE_EXPORTER` to PromQL
expressions that return one instant-vector value. The values are sent to the
browser as display strings only.
