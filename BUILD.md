# Static portfolio build

The source is plain HTML, CSS, JavaScript, and Python. No frontend bundler or
local Cloudflare deployment configuration existed before this build step.

Run `python build.py` (or `python3 build.py`) from the repository root.
The generated static website is in `dist/`; source files are unchanged.
The build uses the Python standard library and replaces only `dist/`.

For the existing Cloudflare deployment, run this build before deploying
static assets and point its existing asset upload at `dist/` instead of the
repository root. In a build dashboard, use `python3 build.py` as the build
command. Keep the existing Worker name, domain, routing, and monitoring API
configuration. No Worker configuration files are added or replaced here.
Deploying the unbuilt source still shows the clean placeholder, but does not
discover new media; the build must run for automatic discovery.

## Wintermute media

Put actual images directly in `assets/projects/wintermute/`. Use any filename;
do not create subfolders. The folder is initially empty apart from `.gitkeep`,
which simply makes Git retain it and is omitted from the build output.

Each build discovers JPG, JPEG, PNG, WebP, SVG, GIF, AVIF, APNG, BMP, ICO, and
JFIF files, including uppercase extensions. Browser support for individual
formats still applies. Hidden files, symlinks, non-images, and subfolders are
ignored. Discovery uses extensions; it does not convert or validate image
contents. No manifest is maintained and no screenshots are generated.

Images are sorted by filename, ignoring case. The first discovered image is
used for the homepage card. All discovered images appear in the responsive
case-study gallery. Captions use the filename without its extension, with
underscores and hyphens replaced by spaces; descriptive names are optional.
Spaces, punctuation, and Unicode names are supported and safely encoded.

Select an image to enlarge it. Close with Escape, the Close button, or a click
on the backdrop. Without JavaScript, gallery links open the original images.
With no images, the card retains its text placeholder and the gallery has no
image items. Removed files disappear from the next build.

## Interactive architecture

All viewer-related source files live directly in `assets/projects/wintermute/`:
`architecture-viewer.js`, `architecture-viewer.css`, and `architecture_source.py`.
There are no new runtime libraries, CDN imports, React, or Mermaid dependencies.

The supplied Mermaid SVG export is the graph source. At build time the parser
reads its node IDs, labels, notes, cluster boundaries, edge IDs, dotted styles,
and connection labels. It embeds inert graph data in the case-study HTML;
the viewer renders native SVG nodes, text, and connections in the site's
dark palette. No component or connection is added by the viewer.

The transparent export is preferred when both background variants are present.
The original diagrams remain untouched in the gallery, where a white backdrop
makes their dark labels readable. The two screenshots are discovered by the
same media build step. SVGs remain vector graphics when enlarged.

Overview, Networking, Applications, Monitoring, and Hardware select subsets
of the source graph and lay them out afresh. Full architecture restores all
source nodes and edges. A component's detail panel lists every source
connection, including those outside the selected view; following one reveals
the full graph and focuses the destination. Explicit verification notes are
preserved, highlighted in amber, and never presented as live health checks.

Drag to pan; use Ctrl/Command + wheel or pinch to zoom. Ordinary wheel/trackpad
scrolling pans the canvas. Buttons provide zoom, Fit, Reset, and expanded
viewing. Find component focuses any node. On the focused canvas, arrow keys
pan, plus/minus zoom, zero fits, R resets, and F expands. On a node, Enter or
Space selects it and arrow keys move between components. Escape clears
selection or closes expanded viewing. Expanded viewing traps keyboard focus
and restores it when closed. Reduced-motion preferences disable animations.

New Mermaid exports can retain any filename. Rebuild after replacing the
export to refresh the graph. Other SVG art does not become graph data unless
it contains Mermaid's `data-node` and `data-edge` metadata. If several
different architecture exports are retained, selection is deterministic:
transparent first, then filename order. Remove obsolete architecture exports
when updating the graph. Raw `.mmd` text was not included with these assets;
the viewer uses the semantic metadata in the supplied SVG rather than
reconstructing unverified links from the screenshots.

## Validation and preview

Run `python -m unittest discover -s tests`, then `python build.py`.
Preview the built output with `python -m http.server 8080 --directory dist`.
Live metrics still use `https://status.coltmelton.dev/api/homelab-status`;
the browser's CORS policy may prevent live requests from a local origin.
