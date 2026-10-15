"""Extract the graph from Mermaid SVG metadata, without a second graph to maintain."""
from pathlib import Path
from html import unescape
import re
import xml.etree.ElementTree as ET


def text(element):
    return " ".join(" ".join(element.itertext()).split())


def load_architecture(folder: Path):
    candidates = []
    for path in sorted(folder.glob("*"), key=lambda p: p.name.casefold()):
        if not path.is_file() or path.suffix.lower() != ".svg" or path.is_symlink():
            continue
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError:
            continue
        if any(e.get("data-node") == "true" for e in root.iter()):
            candidates.append(("background" in root.get("style", ""), path, root))
    if not candidates:
        return None
    _, path, root = sorted(candidates, key=lambda c: (c[0], c[1].name.casefold()))[0]
    groups = []
    for element in root.iter():
        if element.get("class") != "cluster":
            continue
        rect = next((e for e in element if e.tag.endswith("}rect")), None)
        if rect is not None:
            groups.append({"id": element.get("data-id"), "label": text(element),
                           **{k: float(rect.get(k, "0")) for k in ("x", "y", "width", "height")}})
    nodes = []
    for element in root.iter():
        if element.get("data-node") != "true":
            continue
        label = next((e for e in element.iter() if e.tag.endswith("}p")), element)
        lines = re.sub(r"<(?:\w+:)?br\b[^>]*/?>", "\n", ET.tostring(label, encoding="unicode"))
        lines = re.sub(r"<[^>]+>", "", lines)
        lines = [" ".join(unescape(line).split()) for line in lines.splitlines() if line.strip()]
        position = re.search(r"translate\(([-\d.]+)[ ,]+([-\d.]+)\)", element.get("transform", ""))
        x, y = map(float, position.groups()) if position else (0, 0)
        memberships = [g["id"] for g in groups if g["x"] <= x <= g["x"] + g["width"]
                       and g["y"] <= y <= g["y"] + g["height"]]
        nodes.append({"id": element.get("data-id"), "label": lines[0] if lines else text(element),
                      "notes": " · ".join(lines[1:]), "groups": memberships})
    ids = {node["id"] for node in nodes}
    labels = {e.get("data-id"): text(e) for e in root.iter()
              if e.get("class") == "label" and e.get("data-id", "").startswith("L_")}
    edges = []
    for element in root.iter():
        if element.get("data-edge") != "true":
            continue
        edge_id = element.get("data-id", "")
        endpoints = [(a, b) for a in ids for b in ids
                     if re.fullmatch(r"L_" + re.escape(a) + "_" + re.escape(b) + r"_\d+", edge_id)]
        if len(endpoints) != 1:
            raise ValueError(f"Cannot resolve Mermaid edge: {edge_id}")
        a, b = endpoints[0]
        label = labels.get(edge_id, "")
        edges.append({"id": edge_id, "source": a, "target": b, "label": label,
                      "dotted": "edge-pattern-dotted" in element.get("class", ""),
                      "unverified": bool(re.search(r"verify|not reverified", label, re.I))})
    return {"source": path.name, "nodes": nodes, "edges": edges,
            "groups": [{"id": g["id"], "label": g["label"]} for g in groups]}
