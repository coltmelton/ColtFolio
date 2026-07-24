# Colt Melton

Kimball, MI | (810) 479-6235 | coltmeltonwork@gmail.com  
[LinkedIn](https://linkedin.com/in/coltmelton) | [GitHub](https://github.com/coltmelton) | [Portfolio](https://coltmelton.netlify.app/)

## Education

**Kettering University**, Flint, MI  
Bachelor of Science, Computer Science | **Expected January 2027**

**Ajou University**, Suwon, South Korea  
Exchange Program, Software Engineering | February 2025 – July 2025

## Technical Skills

**Languages:** Python, C#, SQL, JavaScript  
**Systems and APIs:** CAN bus, OPC UA, REST APIs, WebSockets, Kafka, PostgreSQL  
**ML and data:** PyTorch, SciPy, lmfit, statsmodels, signal processing, object detection, multi-object tracking  
**Infrastructure and testing:** Linux, Docker Compose, VMware, Bamboo, Robot Framework, Prometheus, Grafana, Git

Only restore C, C++, Java, AWS, Azure, Redis, or other technologies when a bullet or project can show how they were used.

## Experience

**Research & Development Engineer / Scientist Intern**  
Endress+Hauser, Ann Arbor, MI | October 2025 – Present

- Developed a spectroscopy monitoring platform combining OPC UA telemetry, live spectral visualization, and analyzer diagnostics across 30+ industrial analyzers.
- Automated deployment and validation workflows with Bamboo, VMware, and Robot Framework, eliminating approximately four hours of manual work per release cycle across multiple analyzer configurations.
- Partnered with lead spectroscopy scientists to build software for Raman analyzer validation, analytical-method development, diagnostics, and customer-support investigations.

**Automation Software and Calibration Engineer Intern**  
Bosch International Engineering, Farmington Hills, MI | October 2023 – July 2025

- Built automation software with proprietary engineering APIs to analyze ASCET-generated control software, enabling calibration engineers to trace parameter dependencies and investigate system behavior.
- Investigated prototype and production braking-system behavior through CAN telemetry, CANoe/CANalyzer/ETAS analysis, and vehicle testing.
- Traced interactions among calibration parameters, embedded control logic, ECU interventions, and vehicle dynamics during validation and performance investigations.
- Supported prototype vehicle integration through CAN diagnostics, instrumentation, wiring-harness fabrication, connector termination, and electrical troubleshooting.

**IT Security & Analytics Work-Study**  
Kettering University, Flint, MI | July 2025 – Present

- Analyzed simulated-phishing campaign data to identify user-risk trends and security-awareness gaps, then translated click, report, and repeat-risk rates into department-level training priorities.
- Built executive reporting that summarized campaign performance, highlighted recurring weaknesses, and converted security-event data into actionable recommendations.

## Selected Engineering Work

**Machine-Learning-Guided Raman Spectral Decomposition** | Python, PyTorch, SciPy

- Designed and evaluated a 2.9M-parameter 1D U-Net that decomposes Raman spectra into baseline and overlapping peak components across 512-point windows using a sample-grouped 70/20/10 train/validation/test split.
- Built an analysis pipeline for peak detection, isolation, physics-aware fitting, matching, residual analysis, and downstream calibration.
- Evaluated 602 spectra and 19,753 pure-peak matches; reconstruction R² exceeded 0.95 and ethane/propane calibration reached up to 0.98 R².
- **Required before submission:** document the train/validation/test split and confirm whether `>0.95` is a held-out result.

**Distributed Telemetry Pipeline** | Python, FastAPI, Kafka, PostgreSQL, Prometheus, Grafana

- Built a Docker Compose-based telemetry MVP with FastAPI ingestion, Kafka buffering, asynchronous validation, PostgreSQL persistence, and a React operations dashboard.
- Injected duplicate, late, malformed, and failed device events; routed invalid workloads through dead-letter handling and exposed processing health through Prometheus and Grafana.
- **Required before submission:** add measured throughput, latency, recovery behavior, integration tests, and CI.

**UAV Object Detection and Tracking** | Python, YOLOv8, WebSockets

- Built an experimental aerial-video pipeline that accepts webcam, IP-stream, and DJI-oriented input, performs object detection and multi-object tracking, and emits approximate local coordinates.
- Added tunable frame rate, resolution, and JPEG quality controls for live streaming and inspection.
- **Required before submission:** add a recorded DJI demo, evaluation data, latency/FPS measurements, coordinate-transform assumptions, and track-loss limitations.

## Leadership

**Mentor, Kagle Leadership Initiative** | [Dates needed]  
Supported early-college and high-school students with academic and leadership development.

**President, Cliff Hangers Rock Climbing Club** | [Dates needed]  
Managed scheduling, events, and budget.

## Certifications

CompTIA IT Fundamentals (ITF+)
