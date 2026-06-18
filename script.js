document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  const reveals = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__links a");
  const cursorEl = document.querySelector("#cursor");

  const engineeringMetrics = [
    { key: "analyzers_monitored", value: "30+", label: "Industrial Analyzers Monitored", category: "Systems Built" },
    { key: "spectra_evaluated", value: "602", label: "Raman Spectra Evaluated", category: "Systems Built" },
    { key: "validated_peak_matches", value: "19,753", label: "Validated Peak Matches", category: "Systems Built" },
    { key: "model_parameters", value: "2.9M", label: "Neural Network Parameters", category: "Systems Built" },
    { key: "engineers_supported", value: "15+", label: "Engineers Supported", category: "Systems Built" },
    { key: "validation_time_saved", value: "~4", suffix: "hrs/cycle", label: "Saved Per Validation Cycle", category: "Systems Built" }
  ];

  const fallbackHomelabStatus = {
    title: "Homelab Status",
    label: "Infrastructure Snapshot",
    subtitle: "Self-hosted infrastructure running personal cloud storage, backups, and system administration experiments.",
    updatedAt: null,
    services: [
      { name: "Nextcloud", status: "online", description: "Personal cloud storage" },
      { name: "Storage", status: "online", description: "RAID1 storage volume" },
      { name: "Cloudflare", status: "online", description: "DNS / tunnel / edge routing" }
    ],
    infrastructure: {
      host: "Dell XPS 8300",
      cpu: "Intel i7-2600",
      memory: "8 GB DDR3",
      storage: "2x2 TB RAID1 + 1 TB OS",
      os: "Ubuntu Server / Linux",
      runtime: "8+ years",
      role: "Personal cloud, backups, storage administration"
    },
    stack: ["Linux", "Nextcloud", "RAID1", "Apache", "MySQL", "Cloudflare", "Storage"],
    description: "Maintained a self-hosted Nextcloud deployment on repurposed workstation hardware with RAID1 storage, Linux administration, networking configuration, storage management, and long-running service maintenance."
  };

  const architectures = [
    {
      id: "raman-ml",
      title: "Raman ML Pipeline",
      shortTitle: "Raman ML",
      accent: "Research",
      description: "Machine-learning-guided Raman spectral decomposition pipeline for separating baseline and overlapping peak components, fitting spectral features, and supporting ethane/propane calibration.",
      tags: ["PyTorch", "1D U-Net", "Scientific ML", "Spectral Decomposition"],
      metrics: ["2.9M parameters", "602 spectra", "19,753 peak matches", "0.9999 R2"],
      nodes: [
        {
          id: "synthetic-windows",
          label: "Synthetic Raman Windows",
          subtitle: "512-point training windows",
          detailTitle: "Synthetic Raman Windows",
          detailDescription: "Generates 512-point synthetic spectra with overlapping peak cases.",
          technologies: ["Python", "NumPy", "Synthetic Data"],
          responsibilities: ["Training data generation", "Overlap simulation", "Peak family variation"]
        },
        {
          id: "unet-model",
          label: "1D U-Net Model",
          subtitle: "Spectral decomposition model",
          detailTitle: "2.9M-Parameter PyTorch 1D U-Net",
          detailDescription: "2.9M-parameter PyTorch model for spectral decomposition.",
          technologies: ["PyTorch", "1D CNN", "U-Net"],
          responsibilities: ["Learn baseline/peak separation", "Predict 4 output channels"]
        },
        {
          id: "component-prediction",
          label: "Baseline + Peak Prediction",
          subtitle: "Component isolation",
          detailTitle: "Baseline + Peak Component Prediction",
          detailDescription: "Predicts baseline and up to 3 overlapping peak components.",
          technologies: ["PyTorch", "Signal Processing"],
          responsibilities: ["Isolate components", "Reduce spectral overlap complexity"]
        },
        {
          id: "peak-fitting",
          label: "Nonlinear Peak Fitting",
          subtitle: "Physics-aware fitting",
          detailTitle: "Nonlinear Peak Fitting",
          detailDescription: "Fits predicted components to physical peak families.",
          technologies: ["SciPy", "lmfit"],
          responsibilities: ["Optimize Gaussian components", "Optimize Lorentzian components", "Evaluate Voigt and pseudo-Voigt fits"]
        },
        {
          id: "pure-peak-matching",
          label: "Pure-Peak Matching",
          subtitle: "Reference validation",
          detailTitle: "Pure-Peak Matching",
          detailDescription: "Validates and matches isolated components against pure references.",
          technologies: ["pandas", "NumPy", "Spectral Matching"],
          responsibilities: ["Compare fitted peaks", "Produce validated peak matches"]
        },
        {
          id: "calibration",
          label: "Concentration Calibration",
          subtitle: "Ethane/propane models",
          detailTitle: "Concentration Calibration",
          detailDescription: "Builds ethane/propane calibration models from extracted spectral features.",
          technologies: ["statsmodels", "MLR", "Regression"],
          responsibilities: ["Concentration prediction", "Model evaluation", "Calibration analysis"]
        }
      ]
    },
    {
      id: "vmware-automation",
      title: "VMware Automation Platform",
      shortTitle: "VMware",
      accent: "Infrastructure",
      description: "Virtualized test automation platform for provisioning, configuring, validating, and managing engineering test environments.",
      tags: ["C#/.NET", "VMware REST API", "Robot Framework", "Bamboo", "JSON Config"],
      metrics: ["VM orchestration", "Automated provisioning", "~4 hrs saved/cycle"],
      nodes: [
        {
          id: "json-config",
          label: "JSON Config",
          subtitle: "Environment definition",
          detailTitle: "JSON Configuration Layer",
          detailDescription: "Defines VM targets, installer paths, validation parameters, and workflow inputs in a repeatable configuration format.",
          technologies: ["JSON", "Configuration Management"],
          responsibilities: ["Stores VM workflow settings", "Standardizes test environment setup", "Reduces manual setup variation"]
        },
        {
          id: "dotnet-cli",
          label: ".NET CLI",
          subtitle: "Automation control layer",
          detailTitle: "C#/.NET Automation CLI",
          detailDescription: "Command-line orchestration layer that reads configuration files and coordinates VMware, installer, and validation workflows.",
          technologies: ["C#", ".NET", "RESTSharp"],
          responsibilities: ["Runs automation commands", "Coordinates lifecycle workflows", "Handles validation orchestration"]
        },
        {
          id: "vmware-api",
          label: "VMware REST API",
          subtitle: "Virtualization interface",
          detailTitle: "VMware REST API Integration",
          detailDescription: "Interfaces with VMware to manage virtual machine lifecycle operations for engineering test environments.",
          technologies: ["VMware", "REST API", "Virtualization"],
          responsibilities: ["Start and stop VMs", "Manage VM lifecycle operations", "Support repeatable test environments"]
        },
        {
          id: "software-install",
          label: "Software Installation",
          subtitle: "Environment preparation",
          detailTitle: "Automated Software Installation",
          detailDescription: "Installs required software into prepared virtual environments before automated validation runs.",
          technologies: ["Windows Automation", "Installers", "PowerShell"],
          responsibilities: ["Prepare test systems", "Reduce manual installation steps", "Keep validation environments repeatable"]
        },
        {
          id: "robot-framework",
          label: "Robot Framework",
          subtitle: "Automated validation",
          detailTitle: "Robot Framework Execution",
          detailDescription: "Executes automated validation suites after environment setup and software installation.",
          technologies: ["Robot Framework", "Bamboo", "Test Automation"],
          responsibilities: ["Run validation tests", "Support automated pass/fail checks", "Reduce manual test execution effort"]
        },
        {
          id: "validation-results",
          label: "Validation Results",
          subtitle: "Engineering feedback",
          detailTitle: "Validation Output",
          detailDescription: "Produces test results and workflow feedback used by engineers to verify software deployment and analyzer behavior.",
          technologies: ["Bamboo", "Logs", "Validation"],
          responsibilities: ["Surface workflow status", "Support release verification", "Improve debugging visibility"]
        }
      ]
    },
    {
      id: "opcua-telemetry",
      title: "OPC UA Spectroscopy Telemetry",
      shortTitle: "OPC UA",
      accent: "Telemetry",
      description: "Real-time industrial telemetry dashboard aggregating live spectroscopy measurements, analyzer health metrics, and diagnostics for internal engineers and external customers.",
      tags: ["Python", "OPC UA", "Spectroscopy", "Telemetry", "Diagnostics"],
      metrics: ["30+ analyzers", "Real-time telemetry", "Internal + external users"],
      nodes: [
        {
          id: "industrial-analyzer",
          label: "Industrial Analyzer",
          subtitle: "Measurement source",
          detailTitle: "Industrial Analyzer",
          detailDescription: "Produces spectroscopy data and analyzer health metrics.",
          technologies: ["Raman Spectroscopy", "Industrial Instrumentation"],
          responsibilities: ["Measurement source", "Analyzer behavior", "System telemetry"]
        },
        {
          id: "opcua-server",
          label: "OPC UA Server",
          subtitle: "Industrial data interface",
          detailTitle: "OPC UA Server",
          detailDescription: "Exposes live analyzer measurements through structured industrial communication.",
          technologies: ["OPC UA", "Industrial Telemetry"],
          responsibilities: ["Publish live values", "Expose analyzer tags", "Enable client connection"]
        },
        {
          id: "python-client",
          label: "Python Client",
          subtitle: "Telemetry ingestion",
          detailTitle: "Python OPC UA Client",
          detailDescription: "Connects to OPC UA server and reads live data streams.",
          technologies: ["Python", "OPC UA Client Libraries"],
          responsibilities: ["Subscribe/read telemetry", "Normalize data", "Handle updates"]
        },
        {
          id: "spectral-stream",
          label: "Live Spectral Stream",
          subtitle: "Real-time visualization",
          detailTitle: "Live Spectral Stream",
          detailDescription: "Displays real-time spectral data for analyzer monitoring.",
          technologies: ["Python", "Plotting", "Visualization"],
          responsibilities: ["Render spectra", "Support real-time inspection", "Improve visibility"]
        },
        {
          id: "health-metrics",
          label: "Analyzer Health Metrics",
          subtitle: "Diagnostics and behavior",
          detailTitle: "Analyzer Health Metrics",
          detailDescription: "Tracks operational and diagnostic indicators.",
          technologies: ["Telemetry", "Diagnostics", "Data Visualization"],
          responsibilities: ["Show system behavior", "Support troubleshooting", "Monitor performance"]
        },
        {
          id: "customer-dashboard",
          label: "Customer Dashboard",
          subtitle: "Unified interface",
          detailTitle: "Customer Dashboard",
          detailDescription: "Provides internal and external users with a unified monitoring interface.",
          technologies: ["GUI Development", "Python"],
          responsibilities: ["Display data clearly", "Support customer-facing analysis", "Simplify monitoring"]
        },
        {
          id: "diagnostics-validation",
          label: "Diagnostics / Validation",
          subtitle: "Support workflows",
          detailTitle: "Diagnostics and Validation Workflows",
          detailDescription: "Supports Raman analyzer validation, diagnostics, and customer support workflows.",
          technologies: ["Spectroscopy", "Validation Workflows"],
          responsibilities: ["Investigate issues", "Support scientists", "Assist customer support"]
        }
      ]
    }
  ];

  const EngineeringMetricsTerminal = (mount, metrics) => {
    if (!mount) return;

    const terminal = document.createElement("article");
    terminal.className = "metrics-terminal";
    terminal.setAttribute("aria-labelledby", "engineering-metrics-title");

    const topBar = document.createElement("div");
    topBar.className = "metrics-terminal__bar";
    topBar.setAttribute("aria-hidden", "true");

    ["close", "minimize", "maximize"].forEach(name => {
      const dot = document.createElement("span");
      dot.className = `metrics-terminal__dot metrics-terminal__dot--${name}`;
      topBar.appendChild(dot);
    });

    const title = document.createElement("h2");
    title.id = "engineering-metrics-title";
    title.className = "metrics-terminal__title";
    title.textContent = "Engineering Metrics";

    const body = document.createElement("div");
    body.className = "metrics-terminal__body";

    const command = document.createElement("p");
    command.className = "metrics-terminal__command";
    command.textContent = "> systems.metrics()";

    const groupTitle = document.createElement("p");
    groupTitle.className = "metrics-terminal__group";
    groupTitle.textContent = "Systems Built";

    const divider = document.createElement("p");
    divider.className = "metrics-terminal__divider";
    divider.setAttribute("aria-hidden", "true");
    divider.textContent = "-------------";

    const list = document.createElement("dl");
    list.className = "metrics-terminal__list";

    metrics.forEach((metric, index) => {
      const row = document.createElement("div");
      row.className = "metrics-terminal__row";
      row.style.setProperty("--line-index", String(index));

      const term = document.createElement("dt");
      term.className = "metrics-terminal__key";
      term.textContent = metric.key;

      const value = document.createElement("dd");
      value.className = "metrics-terminal__value";

      const valueText = document.createElement("span");
      valueText.textContent = metric.value;
      value.appendChild(valueText);

      if (metric.suffix) {
        const suffix = document.createElement("span");
        suffix.className = "metrics-terminal__suffix";
        suffix.textContent = ` ${metric.suffix}`;
        value.appendChild(suffix);
      }

      const label = document.createElement("span");
      label.className = "metrics-terminal__label";
      label.textContent = metric.label;
      value.appendChild(label);

      row.append(term, value);
      list.appendChild(row);
    });

    const cursor = document.createElement("span");
    cursor.className = "metrics-terminal__cursor";
    cursor.setAttribute("aria-hidden", "true");

    body.append(command, groupTitle, divider, list, cursor);
    terminal.append(topBar, title, body);
    mount.replaceChildren(terminal);
  };

  EngineeringMetricsTerminal(
    document.querySelector("#engineering-metrics-terminal"),
    engineeringMetrics
  );

  const TechTag = tag => {
    const item = document.createElement("li");
    item.className = "architecture-gallery__tag";
    item.textContent = tag;
    return item;
  };

  const MetricChip = metric => {
    const item = document.createElement("li");
    item.className = "architecture-gallery__metric";
    item.textContent = metric;
    return item;
  };

  const ArchitectureNode = (architecture, node, index, isActive) => {
    const item = document.createElement("li");
    item.className = "architecture-gallery__node";
    item.style.setProperty("--node-index", String(index));

    const button = document.createElement("button");
    button.className = "architecture-gallery__node-button";
    button.type = "button";
    button.dataset.nodeId = node.id;
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-label", `${architecture.title} component: ${node.label}`);

    const count = document.createElement("span");
    count.className = "architecture-gallery__node-index";
    count.textContent = String(index + 1).padStart(2, "0");

    const label = document.createElement("span");
    label.className = "architecture-gallery__node-label";
    label.textContent = node.label;

    const subtitle = document.createElement("span");
    subtitle.className = "architecture-gallery__node-subtitle";
    subtitle.textContent = node.subtitle;

    button.append(count, label, subtitle);
    item.appendChild(button);
    return item;
  };

  const ArchitectureFlow = (architecture, activeNodeId) => {
    const flow = document.createElement("ol");
    flow.className = "architecture-gallery__flow";
    flow.setAttribute("aria-label", `${architecture.title} architecture flow`);
    architecture.nodes.forEach((node, index) => {
      flow.appendChild(ArchitectureNode(architecture, node, index, node.id === activeNodeId));
    });
    return flow;
  };

  const ArchitectureDetailPanel = node => {
    const panel = document.createElement("aside");
    panel.className = "architecture-gallery__component";
    panel.setAttribute("aria-live", "polite");

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Component Details";

    const title = document.createElement("h4");
    title.textContent = node.detailTitle;

    const description = document.createElement("p");
    description.textContent = node.detailDescription;

    const techTitle = document.createElement("strong");
    techTitle.textContent = "Technologies";

    const tech = document.createElement("ul");
    tech.className = "architecture-gallery__component-tags";
    node.technologies.forEach(item => tech.appendChild(TechTag(item)));

    const respTitle = document.createElement("strong");
    respTitle.textContent = "Responsibilities";

    const responsibilities = document.createElement("ul");
    responsibilities.className = "architecture-gallery__responsibilities";
    node.responsibilities.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      responsibilities.appendChild(li);
    });

    panel.append(eyebrow, title, description, techTitle, tech, respTitle, responsibilities);
    return panel;
  };

  const ArchitectureCard = (architecture, isActive) => {
    const card = document.createElement("button");
    card.className = "architecture-gallery__card";
    card.type = "button";
    card.dataset.architectureId = architecture.id;
    card.setAttribute("aria-pressed", String(isActive));

    const accent = document.createElement("span");
    accent.className = "architecture-gallery__card-accent";
    accent.textContent = architecture.accent;

    const title = document.createElement("strong");
    title.textContent = architecture.shortTitle;

    const summary = document.createElement("span");
    summary.textContent = architecture.tags.slice(0, 3).join(" / ");

    card.append(accent, title, summary);
    return card;
  };

  const ArchitectureGallery = (mount, items) => {
    if (!mount || !items.length) return;
    let activeId = items[0].id;
    let selectedNodeId = items[0].nodes[0].id;

    const render = () => {
      const active = items.find(item => item.id === activeId) || items[0];
      const activeNode = active.nodes.find(node => node.id === selectedNodeId) || active.nodes[0];
      selectedNodeId = activeNode.id;
      const gallery = document.createElement("div");
      gallery.className = "architecture-gallery";

      const cards = document.createElement("div");
      cards.className = "architecture-gallery__cards";
      cards.setAttribute("role", "tablist");
      cards.setAttribute("aria-label", "Architecture systems");

      items.forEach(item => {
        const card = ArchitectureCard(item, item.id === active.id);
        card.setAttribute("role", "tab");
        card.setAttribute("aria-selected", String(item.id === active.id));
        card.addEventListener("click", () => {
          activeId = item.id;
          selectedNodeId = item.nodes[0].id;
          render();
        });
        card.addEventListener("keydown", event => {
          const index = items.findIndex(candidate => candidate.id === item.id);
          const direction = event.key === "ArrowRight" || event.key === "ArrowDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowUp"
              ? -1
              : 0;
          if (!direction) return;
          event.preventDefault();
          activeId = items[(index + direction + items.length) % items.length].id;
          selectedNodeId = items[(index + direction + items.length) % items.length].nodes[0].id;
          render();
          mount.querySelector(`[data-architecture-id="${activeId}"]`)?.focus();
        });
        cards.appendChild(card);
      });

      const detail = document.createElement("article");
      detail.className = "architecture-gallery__detail";
      detail.setAttribute("role", "tabpanel");

      const header = document.createElement("div");
      header.className = "architecture-gallery__detail-header";

      const titleGroup = document.createElement("div");
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = active.accent;

      const title = document.createElement("h3");
      title.textContent = active.title;

      const description = document.createElement("p");
      description.textContent = active.description;

      titleGroup.append(eyebrow, title, description);

      const tags = document.createElement("ul");
      tags.className = "architecture-gallery__tags";
      tags.setAttribute("aria-label", `${active.title} technology tags`);
      active.tags.forEach(tag => tags.appendChild(TechTag(tag)));

      header.append(titleGroup, tags);

      const metrics = document.createElement("ul");
      metrics.className = "architecture-gallery__metrics";
      metrics.setAttribute("aria-label", `${active.title} metrics`);
      active.metrics.forEach(metric => metrics.appendChild(MetricChip(metric)));

      const flow = ArchitectureFlow(active, selectedNodeId);
      flow.querySelectorAll(".architecture-gallery__node-button").forEach(button => {
        button.addEventListener("click", () => {
          selectedNodeId = button.dataset.nodeId;
          render();
        });
        button.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          selectedNodeId = button.dataset.nodeId;
          render();
          mount.querySelector(`[data-node-id="${selectedNodeId}"]`)?.focus();
        });
      });

      const flowAndDetail = document.createElement("div");
      flowAndDetail.className = "architecture-gallery__explorer";
      flowAndDetail.append(flow, ArchitectureDetailPanel(activeNode));

      detail.append(header, flowAndDetail, metrics);
      gallery.append(cards, detail);
      mount.replaceChildren(gallery);
    };

    render();
  };

  ArchitectureGallery(
    document.querySelector("#architecture-gallery"),
    architectures
  );

  const statusLabels = {
    online: "Online",
    degraded: "Degraded",
    offline: "Offline",
    unknown: "Unknown"
  };

  const getOverallStatus = services => {
    const statuses = services.map(service => service.status);
    if (statuses.includes("offline")) return "offline";
    if (statuses.includes("degraded")) return "degraded";
    if (statuses.includes("unknown")) return "unknown";
    return "online";
  };

  const formatLastChecked = updatedAt => {
    if (!updatedAt) return null;
    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return null;
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(0, Math.round(diffMs / 60000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const normalizeHomelabStatus = data => {
    const allowedStatuses = new Set(["online", "degraded", "offline", "unknown"]);
    const infrastructure = data?.infrastructure;
    const services = Array.isArray(data?.services) ? data.services : null;

    if (!infrastructure || !services || !services.length) {
      return null;
    }

    const updatedAt = typeof data?.updatedAt === "string" ? data.updatedAt : "";
    if (!updatedAt || Number.isNaN(new Date(updatedAt).getTime())) {
      return null;
    }

    const normalizedServices = services
      .map(service => {
        const name = typeof service?.name === "string" ? service.name.trim() : "";
        const status = typeof service?.status === "string" && allowedStatuses.has(service.status)
          ? service.status
          : "unknown";
        const description = typeof service?.description === "string" ? service.description.trim() : "";
        const latencyMs = Number.isFinite(service?.latencyMs) ? Math.max(0, Math.round(service.latencyMs)) : null;
        if (!name) return null;
        return { name, status, description, latencyMs };
      })
      .filter(Boolean);

    if (!normalizedServices.length) {
      return null;
    }

    const textField = key => typeof infrastructure?.[key] === "string" ? infrastructure[key].trim() : "";
    const normalizedInfrastructure = {
      host: textField("host"),
      cpu: textField("cpu"),
      memory: textField("memory"),
      storage: textField("storage"),
      os: textField("os"),
      runtime: textField("runtime"),
      role: "Personal cloud, backups, storage administration"
    };

    if (!normalizedInfrastructure.host || !normalizedInfrastructure.os) {
      return null;
    }

    return {
      ...fallbackHomelabStatus,
      label: "Last checked",
      updatedAt,
      services: normalizedServices,
      infrastructure: normalizedInfrastructure
    };
  };

  const fetchHomelabStatus = async (timeoutMs = 1800) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("/api/homelab-status", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) return null;
      return normalizeHomelabStatus(await response.json());
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const InfrastructureStatusStrip = (mount, data) => {
    if (!mount) return;

    const overallStatus = getOverallStatus(data.services);
    const lastChecked = formatLastChecked(data.updatedAt);
    const summaryText = overallStatus === "online"
      ? "Systems Online"
      : overallStatus === "degraded"
        ? "Systems Degraded"
        : overallStatus === "offline"
          ? "Systems Attention"
          : "Systems Snapshot";
    const infrastructureDetails = [
      { label: "Host", value: data.infrastructure.host },
      { label: "CPU", value: data.infrastructure.cpu },
      { label: "Memory", value: data.infrastructure.memory },
      { label: "Storage", value: data.infrastructure.storage },
      { label: "OS", value: data.infrastructure.os },
      { label: "Runtime", value: data.infrastructure.runtime },
      { label: "Role", value: data.infrastructure.role }
    ].filter(item => item.value);

    const strip = document.createElement("article");
    strip.className = "infrastructure-strip";
    strip.setAttribute("aria-labelledby", "infrastructure-status-title");

    const details = document.createElement("details");
    details.className = "infrastructure-strip__details";

    const summary = document.createElement("summary");
    summary.className = "infrastructure-strip__summary";

    const status = document.createElement("span");
    status.className = `infrastructure-strip__status infrastructure-strip__status--${overallStatus}`;
    status.setAttribute("aria-label", `Infrastructure status: ${overallStatus}`);
    status.innerHTML = `<span aria-hidden="true"></span>${summaryText}`;

    const titleGroup = document.createElement("span");
    titleGroup.className = "infrastructure-strip__copy";

    const title = document.createElement("span");
    title.id = "infrastructure-status-title";
    title.className = "infrastructure-strip__title";
    title.textContent = "Self-hosted Nextcloud, RAID1 storage, and Linux infrastructure";

    const servicesInline = document.createElement("span");
    servicesInline.className = "infrastructure-strip__inline";
    servicesInline.textContent = "Nextcloud / Storage / Cloudflare / Linux";

    titleGroup.append(title, servicesInline);

    const checked = document.createElement("span");
    checked.className = "infrastructure-strip__checked";
    checked.textContent = lastChecked ? `Last checked: ${lastChecked}` : data.label;

    summary.append(status, titleGroup, checked);

    const services = document.createElement("ul");
    services.className = "infrastructure-strip__services";
    services.setAttribute("aria-label", "Service statuses");

    data.services.forEach(service => {
      const item = document.createElement("li");
      item.className = "infrastructure-strip__service";

      const name = document.createElement("strong");
      name.textContent = service.name;

      const serviceStatus = document.createElement("span");
      serviceStatus.className = `infrastructure-strip__service-status infrastructure-strip__service-status--${service.status}`;
      serviceStatus.setAttribute("aria-label", `${service.name} status: ${service.status}`);
      serviceStatus.innerHTML = `<span aria-hidden="true"></span>${statusLabels[service.status]}`;

      const description = document.createElement("p");
      const latency = service.latencyMs !== null && service.latencyMs !== undefined
        ? ` / ${service.latencyMs} ms`
        : "";
      description.textContent = `${service.description || "Service health check"}${latency}`;

      item.append(name, serviceStatus, description);
      services.appendChild(item);
    });

    const list = document.createElement("dl");
    list.className = "infrastructure-strip__grid";

    infrastructureDetails.forEach(item => {
      const entry = document.createElement("div");
      entry.className = "infrastructure-strip__item";

      const term = document.createElement("dt");
      term.textContent = item.label;

      const value = document.createElement("dd");
      value.textContent = item.value;

      entry.append(term, value);
      list.appendChild(entry);
    });

    const stack = document.createElement("ul");
    stack.className = "infrastructure-strip__stack";
    stack.setAttribute("aria-label", "Infrastructure stack");

    data.stack.forEach(item => {
      const chip = document.createElement("li");
      chip.textContent = item;
      stack.appendChild(chip);
    });

    const description = document.createElement("p");
    description.className = "infrastructure-strip__description";
    description.textContent = data.description;

    const expanded = document.createElement("div");
    expanded.className = "infrastructure-strip__expanded";
    expanded.append(services, list, stack, description);

    details.append(summary, expanded);
    strip.appendChild(details);
    mount.replaceChildren(strip);
  };

  const infrastructureMount = document.querySelector("#infrastructure-status-strip");
  InfrastructureStatusStrip(infrastructureMount, fallbackHomelabStatus);
  fetchHomelabStatus().then(apiStatus => {
    if (apiStatus) {
      InfrastructureStatusStrip(infrastructureMount, apiStatus);
    }
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => revealObserver.observe(el));

  const navObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav__links a[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => navObserver.observe(section));
  const navCta = document.querySelector(".nav__cta");

  // Custom cursor
  if (cursorEl) {
    const resetImageCursor = () => {
      cursorEl.classList.remove("is-image-arrow", "is-left", "is-right");
    };

    const moveCursor = e => {
      cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      cursorEl.style.opacity = 1;
      const imageTarget = e.target.closest(".project__image[data-images]");
      if (!imageTarget) {
        resetImageCursor();
        return;
      }

      const rect = imageTarget.getBoundingClientRect();
      const isLeftHalf = e.clientX - rect.left < rect.width / 2;
      cursorEl.classList.add("is-image-arrow");
      cursorEl.classList.toggle("is-left", isLeftHalf);
      cursorEl.classList.toggle("is-right", !isLeftHalf);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseleave", resetImageCursor);
  }

  // Click-driven image flip: left half goes backward, right half goes forward.
  document.querySelectorAll(".project__image").forEach(wrapper => {
    const img = wrapper.querySelector("img");
    if (!img) return;
    const images = (wrapper.dataset.images || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (!images.length) return;

    let index = 0;

    const showImage = newIndex => {
      index = (newIndex + images.length) % images.length;
      img.src = images[index];
    };

    wrapper.addEventListener("click", e => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      if (ratio < 0.5) {
        showImage(index - 1);
      } else {
        showImage(index + 1);
      }
    });
  });

  // Archive: left titles, right 3x3 thumbs
  const archiveItems = document.querySelectorAll(".archive__item");
  const archiveThumbs = document.querySelectorAll(".archive__thumb");

  const highlightById = id => {
    archiveItems.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.archiveId === id);
    });
  };

  archiveThumbs.forEach(thumb => {
    const img = thumb.querySelector("img");
    const thumbId = thumb.dataset.archiveId;
    let idx = 1;
    let timer = null;

    const getImages = () =>
      (thumb.dataset.images || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      const images = getImages();
      if (images.length && img) {
        img.src = images[0];
        idx = 1;
      }
      if (thumbId) highlightById(null);
    };

    const start = () => {
      const images = getImages();
      if (!img || !images.length) return;
      stop();
      if (thumbId) highlightById(thumbId);
      timer = setInterval(() => {
        img.src = images[idx % images.length];
        idx += 1;
      }, 180);
    };

    thumb.addEventListener("mouseenter", start);
    thumb.addEventListener("mouseleave", stop);
    thumb.addEventListener("focus", start);
    thumb.addEventListener("blur", stop);
  });

  const introSection = document.querySelector(".intro");
  const introInner = document.querySelector(".intro__inner");

  const updateIntroFade = () => {
    if (!introSection || !introInner) return;
    const start = introSection.offsetTop;
    const height = introSection.offsetHeight || 1;
    const progress = Math.min(Math.max((window.scrollY - start) / (height * 0.6), 0), 1);
    introInner.style.opacity = String(1 - progress);
    introInner.style.transform = `translateY(${(-10 * progress).toFixed(2)}px)`;
    if (progress < 0.05) {
      introInner.classList.remove("is-fading");
    } else {
      introInner.classList.add("is-fading");
    }
  };

  const onScroll = () => {
    updateIntroFade();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateIntroFade();

  // Mobile archive: cycle images as user scrolls (no rotation).
  const applyMobileArchiveScrollCycle = () => {
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    if (!isMobile) return;
    const thumbs = document.querySelectorAll(".archive__thumb");
    if (!thumbs.length) return;

    const step = 80; // pixels per frame change

    const handleScroll = () => {
      const scroll = Math.max(window.scrollY, 0);
      thumbs.forEach((thumb, idx) => {
        const img = thumb.querySelector("img");
        if (!img) return;
        const images = (thumb.dataset.images || "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
        if (images.length <= 1) {
          img.style.transform = "";
          return;
        }
        const offset = idx * 30;
        const frame = Math.floor((scroll + offset) / step) % images.length;
        const current = img.dataset.activeIndex;
        if (current !== String(frame)) {
          img.dataset.activeIndex = String(frame);
          img.src = images[frame];
          img.style.transform = "";
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  };

  applyMobileArchiveScrollCycle();
});
