# Evidence Needed Before an Anduril Application

These inputs are required to strengthen the application without inventing facts.

## Blocking résumé inputs

- Confirmation that October 2026 on the current résumé is a planned end date; the website currently uses “Present.”
- Dates for the Kagle Leadership Initiative and rock-climbing club presidency.

## Research evidence

- Exact definition of reconstruction R².
- Confirm whether grouping by sample also prevented related concentration-series or acquisition-run leakage across the 70/20/10 split.
- Held-out reconstruction result and distribution, not only the mean.
- Confirmation that `>0.95` is supportable on held-out data.
- Baseline model or method used for comparison.
- Worst-performing and representative failure cases.
- Explanation of the 19,753 “pure-peak matches” and how matching quality was validated.
- Written permission boundary for public plots and metrics under the NDA.

## UAV evidence and assets

- One representative DJI input clip that is safe to publish.
- One screen recording showing live input, detections, track IDs, and coordinate output.
- Detector classes and model version.
- Tracker algorithm/library and configuration.
- Measured FPS and end-to-end latency on named hardware.
- Small hand-labeled evaluation set or another defensible evaluation method.
- Coordinate-mapping assumptions, reference frames, and known error sources.
- At least three documented failure cases: camera motion, occlusion, scale change, false detection, or track loss.

## Metringest evidence

- Load-test results with hardware specifications and test configuration.
- Ingest throughput and latency percentiles.
- Delivery semantics and deduplication guarantees.
- Behavior when Kafka, the worker, or PostgreSQL is unavailable.
- Dead-letter replay procedure.
- Schema-versioning decision.
- Integration tests and CI.
- A 60–90 second failure-injection demonstration.

## Employment impact evidence

- Number of users who actively used the spectroscopy platform, not merely supported analyzer count.
- Frequency of releases and therefore annualized time saved, if defensible.
- Before/after description of the manual validation workflow.
- Evidence of adoption: team, customer-support workflow, or recurring operational use.
- Bosch automation time saved, investigations accelerated, or manual steps eliminated.
- One sanitized example of a difficult vehicle-system problem you personally drove to resolution.

## Repository cleanup

- Replace the ColtFolio GitHub description “My Portfolio Website Project!!!”.
- Add a concise GitHub profile README focused on physical-system software.
- Add professional READMEs, tests, CI, releases, and demo media to the three featured repositories.
- Remove `.DS_Store` from the portfolio repository and add it to `.gitignore`.
- Keep meaningful engineering history visible through normal iterative commits; do not manufacture commit volume.
