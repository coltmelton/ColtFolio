(() => {
  'use strict';
  const host = document.querySelector('#wintermute-architecture');
  const source = document.querySelector('#wintermute-architecture-data');
  if (!host || !source) return;
  const graph = JSON.parse(source.textContent);
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const groups = new Map(graph.groups.map(group => [group.id, group.label]));
  const roles = {
    VISITOR: 'Browser clients accessing the public portfolio and telemetry.',
    DOMAIN: 'The public custom domain for the portfolio.',
    WORKER: 'Cloudflare Worker serving the portfolio HTML, CSS, and JavaScript.',
    STATUS: 'The public, read-only HTTPS telemetry endpoint.',
    CFEDGE: 'Cloudflare TLS termination and routing at the public edge.',
    DEVICES: 'Authorized clients on the private Tailscale tailnet.',
    TS: 'Private overlay networking for authorized devices.',
    DNS: 'Private name resolution for the .wintermute zone.',
    CADDY: 'Internal TLS reverse proxy for the private services shown here.',
    TUNNEL: 'Outbound-only Cloudflare Tunnel connector managed by systemd.',
    PORTAPI: 'Restricted Python telemetry service exposing only the read-only status route.',
    PROM: 'Time-series metrics storage and PromQL queries.',
    NODE: 'Host-level metrics exporter.', CAD: 'Container-level metrics exporter.',
    GRAFANA: 'Monitoring dashboard. The diagram marks its Prometheus datasource for verification.',
    WEBUI: 'Browser interface for local AI workflows.', IMMICH: 'Self-hosted photo application.',
    NEXTCLOUD: 'Self-hosted file and cloud application.', VAULT: 'Self-hosted password vault.',
    HOME: 'Private application dashboard.', JELLYFIN: 'Media server with GPU acceleration configured in the diagram.',
    SEERR: 'Media-request application. Its proxy route is explicitly marked as not reverified.',
    RADARR: 'Movie library management application.', SONARR: 'Series library management application.',
    PROWLARR: 'Media indexer management application.', BAZARR: 'Subtitle management application.',
    OLLAMA: 'Local language-model inference runtime. GPU availability is marked for verification.',
    TORR: 'TorrServer application shown in the Docker group.', MOISA: 'Moisa add-on shown in the Docker group.',
    COMFY: 'AI image and video workflow application hosted by systemd.',
    SUN: 'Remote streaming application hosted by systemd.',
    TOOLS: 'Authenticated, private management API for Docker and VM controls; separate from public telemetry.',
    NVME: 'NVMe storage for the operating system, applications, and models; Linux root uses LVM.',
    MEDIA: 'SATA media filesystem at /srv/storage/media.',
    CLOUD: 'SATA application-data filesystem at /srv/storage/data.',
    GPU: 'NVIDIA RTX 4070 SUPER with 12 GB VRAM, as labeled in the supplied diagram.'
  };
  const contains = (node, ids) => node.groups.some(id => ids.includes(id));
  const views = {
    Overview: node => ['STATUS', 'CFEDGE', 'TUNNEL', 'PORTAPI', 'PROM', 'DEVICES', 'TS', 'CADDY'].includes(node.id),
    Networking: node => contains(node, ['PUBLIC', 'PRIVATE', 'PUBLIC_API']),
    Applications: node => contains(node, ['DOCKER', 'HOST']) || node.id === 'CADDY',
    Monitoring: node => ['STATUS', 'CFEDGE', 'TUNNEL', 'PORTAPI', 'PROM', 'GRAFANA', 'NODE', 'CAD'].includes(node.id),
    Hardware: node => contains(node, ['DATA']) || ['JELLYFIN', 'IMMICH', 'NEXTCLOUD', 'COMFY', 'OLLAMA'].includes(node.id),
    'Full architecture': () => true
  };
  host.className = 'wm-viewer';
  host.innerHTML = `
    <div class="wm-views" role="group" aria-label="Architecture views"></div>
    <div class="wm-toolbar" role="group" aria-label="Architecture controls">
      <button type="button" data-action="in" aria-label="Zoom in">+</button>
      <button type="button" data-action="out" aria-label="Zoom out">−</button>
      <button type="button" data-action="fit">Fit</button>
      <button type="button" data-action="reset">Reset</button>
      <button type="button" data-action="expand" aria-pressed="false">Expand</button>
      <output class="wm-zoom" aria-label="Zoom level">100%</output>
      <label class="wm-picker-label">Find component <select class="wm-picker"><option value="">Choose a component…</option></select></label>
    </div>
    <div class="wm-body">
      <div class="wm-stage" tabindex="0" role="group" aria-label="Interactive architecture. Drag to pan, Control or Command and scroll to zoom. Arrow keys pan; plus and minus zoom; zero fits; R resets; F expands.">
        <svg class="wm-canvas" xmlns="http://www.w3.org/2000/svg" aria-label="Wintermute infrastructure connections">
          <defs><marker id="wm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>
          <g class="wm-world"></g>
        </svg>
      </div>
      <aside class="wm-info" aria-label="Component details" tabindex="0"></aside>
    </div>
    <div class="wm-footer"><span class="wm-count" role="status" aria-live="polite"></span><span>Drag to pan · Ctrl/⌘ + scroll or pinch to zoom · Select a component</span><span class="wm-legend">Dashed: source-qualified connection · Amber: verification noted</span></div>
    <p class="wm-source"></p>`;
  const stage = host.querySelector('.wm-stage');
  const svg = host.querySelector('svg');
  const world = host.querySelector('.wm-world');
  const info = host.querySelector('.wm-info');
  const picker = host.querySelector('select');
  const expand = host.querySelector('[data-action="expand"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const sourceLink = document.createElement('a');
  sourceLink.href = '../../assets/projects/wintermute/' + encodeURIComponent(graph.source);
  sourceLink.textContent = 'Original Mermaid diagram ↗'; sourceLink.target = '_blank'; sourceLink.rel = 'noopener';
  host.querySelector('.wm-source').append(sourceLink);
  let view = 'Overview', selected = null, visible = [], edges = [], positions = new Map();
  let extent = {width: 1, height: 1}, camera = {x: 0, y: 0, scale: 1}, animation = 0;
  let expanded = false, previousFocus = null, oldOverflow = '';
  const pointers = new Map();
  let gesture = null, moved = false;
  const NS = 'http://www.w3.org/2000/svg';
  const element = (name, attrs = {}, text = '') => {
    const result = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => result.setAttribute(key, value));
    if (text) result.textContent = text;
    return result;
  };
  const apply = () => {
    world.setAttribute('transform', `translate(${camera.x} ${camera.y}) scale(${camera.scale})`);
    host.querySelector('.wm-zoom').value = `${Math.round(camera.scale * 100)}%`;
  };
  const move = (next, smooth = false) => {
    cancelAnimationFrame(animation);
    if (!smooth || reduce.matches) { camera = next; apply(); return; }
    const from = {...camera}, start = performance.now();
    const frame = now => {
      const progress = Math.min(1, (now - start) / 220), ease = 1 - (1 - progress) ** 3;
      camera = Object.fromEntries(['x', 'y', 'scale'].map(key => [key, from[key] + (next[key] - from[key]) * ease]));
      apply(); if (progress < 1) animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
  };
  const fit = (smooth = true, readable = false) => {
    const fitted = Math.max(0.08, Math.min(1.1, (stage.clientWidth - 40) / extent.width, (stage.clientHeight - 40) / extent.height));
    const scale = readable ? Math.min((stage.clientWidth - 24) / extent.width, Math.max(stage.clientWidth < 620 ? 0.9 : 0.8, fitted)) : fitted;
    move({scale, x: (stage.clientWidth - extent.width * scale) / 2, y: readable ? Math.max(20, (stage.clientHeight - extent.height * scale) / 2) : (stage.clientHeight - extent.height * scale) / 2}, smooth);
  };
  const zoom = (factor, x = stage.clientWidth / 2, y = stage.clientHeight / 2, smooth = true) => {
    const scale = Math.max(0.08, Math.min(5, camera.scale * factor));
    const ratio = scale / camera.scale;
    move({scale, x: x - (x - camera.x) * ratio, y: y - (y - camera.y) * ratio}, smooth);
  };
  const lines = (label, limit = 23) => {
    const words = label.split(/\s+/), result = [''];
    words.forEach(word => {
      if ((result.at(-1) + ' ' + word).trim().length > limit && result.at(-1)) result.push(word);
      else result[result.length - 1] = (result.at(-1) + ' ' + word).trim();
    });
    return result;
  };
  const centerNode = id => {
    const point = positions.get(id);
    if (!point) return;
    const scale = Math.max(camera.scale, 0.95);
    move({scale, x: stage.clientWidth / 2 - (point.x + 96) * scale, y: stage.clientHeight / 2 - (point.y + 48) * scale}, true);
  };
  const paragraph = text => { const p = document.createElement('p'); p.textContent = text; return p; };
  const details = () => {
    info.replaceChildren();
    if (!selected) {
      const heading = document.createElement('h3'); heading.textContent = 'Explore a component';
      info.append(heading, paragraph('Select a node or use Find component. Only connections in the supplied Mermaid diagram are shown.'), paragraph('Select Full architecture to see every component. This diagram documents configuration; it does not verify live connectivity.'));
      if (view === 'Networking') {
        const boundaries = ['PUBLIC', 'PRIVATE', 'PUBLIC_API', 'PROXY_NET', 'MEDIA_NET', 'MONITOR_NET'];
        const title = document.createElement('h4'); title.textContent = 'Network boundaries in the source'; info.append(title);
        boundaries.filter(id => groups.has(id)).forEach(id => info.append(paragraph(groups.get(id))));
      }
      return;
    }
    const node = byId.get(selected), heading = document.createElement('h3'); heading.textContent = node.label;
    info.append(heading, paragraph(roles[node.id] || node.notes || 'Component shown in the supplied architecture.'));
    if (node.notes) info.append(paragraph('Source notes: ' + node.notes));
    const scope = node.groups.filter(id => !['WINTERMUTE', 'DOCKER'].includes(id)).map(id => groups.get(id));
    if (scope.length) info.append(paragraph(scope.join(' · ')));
    const title = document.createElement('h4'); title.textContent = 'Connections in the source'; info.append(title);
    const related = graph.edges.filter(edge => edge.source === selected || edge.target === selected);
    if (!related.length) info.append(paragraph('No explicit connections are drawn for this component.'));
    related.forEach(edge => {
      const other = edge.source === selected ? edge.target : edge.source;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'wm-connection';
      button.textContent = `${edge.source === selected ? '→' : '←'} ${byId.get(other).label}`;
      button.addEventListener('click', () => {
        if (!positions.has(other)) render('Full architecture');
        select(other); centerNode(other);
      });
      info.append(button);
      if (edge.label) {
        const note = paragraph(edge.label); if (edge.unverified) note.className = 'wm-unverified'; info.append(note);
      }
    });
  };
  const select = id => {
    selected = id; picker.value = id || '';
    world.querySelectorAll('[data-node]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.node === id)));
    world.querySelectorAll('[data-edge]').forEach(path => {
      const edge = edges.find(edge => edge.id === path.dataset.edge);
      path.classList.toggle('wm-edge--active', !!id && (edge.source === id || edge.target === id));
    });
    details();
  };
  const renderOverview = () => {
    visible = []; edges = []; selected = null; positions = new Map(); picker.value = '';
    const narrow = stage.clientWidth < 620;
    const tiles = [
      ['Networking', 'Private access & routing', 'Tailscale · DNS · Caddy'],
      ['Applications', 'Private services & AI', 'Containers · systemd apps'],
      ['Monitoring', 'Metrics & public telemetry', 'Prometheus · exporters · API'],
      ['Hardware', 'Compute & persistence', 'CPU · GPU · storage']
    ];
    extent = {width: narrow ? 280 : 584, height: narrow ? 510 : 286};
    world.replaceChildren();
    world.append(element('text', {x: 0, y: 24, class: 'wm-overview-heading'}, 'Wintermute / Ubuntu homelab'));
    tiles.forEach(([name, role, tools], index) => {
      const x = narrow ? 0 : (index % 2) * 304;
      const y = 50 + (narrow ? index : Math.floor(index / 2)) * 116;
      const tile = element('g', {transform: `translate(${x} ${y})`, class: 'wm-overview-tile', 'data-view-node': name, tabindex: 0, role: 'button', 'aria-label': 'Explore ' + name});
      tile.append(element('rect', {width: 280, height: 96, rx: 2}));
      tile.append(element('text', {x: 16, y: 28, class: 'wm-overview-name'}, name + ' ↗'));
      tile.append(element('text', {x: 16, y: 53}, role));
      tile.append(element('text', {x: 16, y: 77, class: 'wm-overview-tools'}, tools));
      tile.addEventListener('click', () => { if (!moved) render(name); });
      tile.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); render(name); }
      });
      world.append(tile);
    });
    host.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === 'Overview')));
    host.querySelector('.wm-count').textContent = 'Illustrative simplified overview, not a complete network topology.';
    fit(false);
  };
  const render = (next = view) => {
    view = next;
    host.classList.toggle('wm-viewer--overview', view === 'Overview');
    if (view === 'Overview') { renderOverview(); return; }
    visible = graph.nodes.filter(views[view]);
    const ids = new Set(visible.map(node => node.id));
    edges = graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target));
    const ranks = new Map(visible.map(node => [node.id, 0]));
    for (let i = 0; i < visible.length; i++) {
      let changed = false;
      edges.forEach(edge => {
        if (ranks.get(edge.target) <= ranks.get(edge.source)) {
          ranks.set(edge.target, Math.min(visible.length, ranks.get(edge.source) + 1)); changed = true;
        }
      });
      if (!changed) break;
    }
    const layers = [...new Set(ranks.values())].sort((a, b) => a - b);
    const narrow = stage.clientWidth < 620;
    positions = new Map(); let offset = 0;
    layers.forEach(rank => {
      const members = visible.filter(node => ranks.get(node.id) === rank);
      members.forEach((node, i) => positions.set(node.id, narrow
        ? {x: (i % 2) * 216, y: offset + Math.floor(i / 2) * 116}
        : {x: offset + Math.floor(i / 6) * 232, y: (i % 6) * 116}));
      offset += narrow ? Math.ceil(members.length / 2) * 116 + 38 : Math.ceil(members.length / 6) * 232 + 20;
    });
    extent = {width: Math.max(...[...positions.values()].map(p => p.x + 192)), height: Math.max(...[...positions.values()].map(p => p.y + 96))};
    world.replaceChildren();
    edges.forEach(edge => {
      const a = positions.get(edge.source), b = positions.get(edge.target);
      const ax = a.x + (narrow ? 96 : 192), ay = a.y + (narrow ? 96 : 48);
      const bx = b.x + (narrow ? 96 : 0), by = b.y + (narrow ? 0 : 48);
      const d = narrow ? `M${ax},${ay} C${ax},${(ay + by) / 2} ${bx},${(ay + by) / 2} ${bx},${by}` : `M${ax},${ay} C${(ax + bx) / 2},${ay} ${(ax + bx) / 2},${by} ${bx},${by}`;
      const path = element('path', {d, class: 'wm-edge' + (edge.dotted || edge.unverified ? ' wm-edge--dashed' : '') + (edge.unverified ? ' wm-edge--unverified' : ''), 'data-edge': edge.id, 'marker-end': 'url(#wm-arrow)'});
      path.append(element('title', {}, `${byId.get(edge.source).label} → ${byId.get(edge.target).label}${edge.label ? ': ' + edge.label : ''}`)); world.append(path);
    });
    visible.forEach(node => {
      const point = positions.get(node.id);
      const group = element('g', {transform: `translate(${point.x} ${point.y})`, class: 'wm-node', 'data-node': node.id, tabindex: '0', role: 'button', 'aria-label': node.label, 'aria-pressed': 'false'});
      group.append(element('rect', {width: 192, height: 96, rx: 2}));
      group.append(element('text', {x: 14, y: 20, class: 'wm-node-id'}, node.id));
      const words = lines(node.label);
      words.slice(0, 3).forEach((line, i) => group.append(element('text', {x: 14, y: 43 + i * 19}, i === 2 && words.length > 3 ? line + '…' : line)));
      group.append(element('title', {}, node.label + (node.notes ? ' — ' + node.notes : '')));
      group.addEventListener('click', () => { if (!moved) select(node.id); });
      group.addEventListener('focus', () => {
        const x = camera.x + point.x * camera.scale, y = camera.y + point.y * camera.scale;
        if (x < 0 || y < 0 || x + 192 * camera.scale > stage.clientWidth || y + 96 * camera.scale > stage.clientHeight) centerNode(node.id);
      });
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node.id); }
        if (event.key.startsWith('Arrow')) {
          event.preventDefault(); event.stopPropagation();
          const sign = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
          const ordered = [...visible].sort((a, b) => positions.get(a.id).y - positions.get(b.id).y || positions.get(a.id).x - positions.get(b.id).x);
          const next = ordered[(ordered.findIndex(n => n.id === node.id) + sign + ordered.length) % ordered.length];
          world.querySelector(`[data-node="${next.id}"]`).focus();
        }
      });
      world.append(group);
    });
    host.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    host.querySelector('.wm-count').textContent = `${view} · ${visible.length} components · ${edges.length} connections`;
    select(ids.has(selected) ? selected : null); fit(false, true);
  };
  Object.keys(views).forEach(name => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = name; button.dataset.view = name;
    button.addEventListener('click', () => render(name)); host.querySelector('.wm-views').append(button);
  });
  [...graph.nodes].sort((a, b) => a.label.localeCompare(b.label)).forEach(node => {
    const option = document.createElement('option'); option.value = node.id; option.textContent = node.label; picker.append(option);
  });
  picker.addEventListener('change', () => {
    const id = picker.value; if (!id) { select(null); return; }
    if (!positions.has(id)) render('Full architecture'); select(id); centerNode(id);
  });
  const toggleExpand = () => {
    expanded = !expanded;
    if (expanded) { previousFocus = document.activeElement; oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = oldOverflow;
    host.classList.toggle('wm-viewer--expanded', expanded);
    host.setAttribute('role', expanded ? 'dialog' : 'group');
    host.setAttribute('aria-label', 'Wintermute architecture explorer');
    if (expanded) host.setAttribute('aria-modal', 'true'); else host.removeAttribute('aria-modal');
    expand.textContent = expanded ? 'Close expanded view' : 'Expand'; expand.setAttribute('aria-pressed', String(expanded));
    requestAnimationFrame(() => { fit(false); if (expanded) expand.focus(); else previousFocus?.focus(); });
  };
  host.querySelector('.wm-toolbar').addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (action === 'in') zoom(1.25); if (action === 'out') zoom(0.8);
    if (action === 'fit') fit(); if (action === 'reset') { select(null); render('Overview'); }
    if (action === 'expand') toggleExpand();
  });
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    const bounds = stage.getBoundingClientRect();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    if (event.ctrlKey || event.metaKey) zoom(Math.exp(-event.deltaY * unit * 0.006), event.clientX - bounds.left, event.clientY - bounds.top, false);
    else move({...camera, x: camera.x - event.deltaX * unit, y: camera.y - event.deltaY * unit});
  }, {passive: false});
  const snapshot = () => {
    const points = [...pointers.values()];
    gesture = {camera: {...camera}, points, distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0};
  };
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(animation); moved = false;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY}); snapshot();
    // Capture the originating node so a simple tap still reaches its click handler.
    event.target.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    const points = [...pointers.values()];
    const dx = points[0].x - gesture.points[0].x, dy = points[0].y - gesture.points[0].y;
    if (Math.hypot(dx, dy) > 4 || points.length > 1) moved = true;
    if (points.length === 1) move({...gesture.camera, x: gesture.camera.x + dx, y: gesture.camera.y + dy});
    else if (gesture.distance > 0) {
      const bounds = stage.getBoundingClientRect();
      const mid = list => ({x: (list[0].x + list[1].x) / 2 - bounds.left, y: (list[0].y + list[1].y) / 2 - bounds.top});
      const start = mid(gesture.points), current = mid(points);
      const scale = Math.max(0.08, Math.min(5, gesture.camera.scale * Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) / gesture.distance));
      const ratio = scale / gesture.camera.scale;
      move({scale, x: current.x - (start.x - gesture.camera.x) * ratio, y: current.y - (start.y - gesture.camera.y) * ratio});
    }
  });
  const finish = event => { pointers.delete(event.pointerId); if (pointers.size) snapshot(); else gesture = null; };
  stage.addEventListener('pointerup', finish); stage.addEventListener('pointercancel', finish);
  stage.addEventListener('keydown', event => {
    if (event.target.closest('[data-node]') && ['Enter', ' '].includes(event.key)) return;
    const pan = {ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60]}[event.key];
    if (pan) { event.preventDefault(); move({...camera, x: camera.x + pan[0], y: camera.y + pan[1]}, true); }
    if (['+', '=', '-', '0', 'r', 'R', 'f', 'F'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '+' || event.key === '=') zoom(1.25);
      if (event.key === '-') zoom(0.8); if (event.key === '0') fit();
      if (event.key.toLowerCase() === 'r') { select(null); render('Overview'); }
      if (event.key.toLowerCase() === 'f') toggleExpand();
    }
  });
  host.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (expanded) toggleExpand(); else select(null); }
    if (expanded && event.key === 'Tab') {
      const items = [...host.querySelectorAll('button, select, a, [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  new ResizeObserver(() => render()).observe(stage);
  render();
})();
