from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

import build


class ArchitectureSourceTests(unittest.TestCase):
    def setUp(self):
        self.folder = build.ROOT / "assets/projects/wintermute"
        self.graph = build._architecture.load_architecture(self.folder)

    def test_graph_retains_exact_source_nodes_and_connections(self):
        self.assertIsNotNone(self.graph)
        root = ET.parse(self.folder / self.graph["source"]).getroot()
        nodes = {e.get("data-id") for e in root.iter() if e.get("data-node") == "true"}
        edges = {e.get("data-id") for e in root.iter() if e.get("data-edge") == "true"}
        self.assertEqual({n["id"] for n in self.graph["nodes"]}, nodes)
        self.assertEqual({e["id"] for e in self.graph["edges"]}, edges)
        for edge in self.graph["edges"]:
            self.assertIn(edge["source"], nodes)
            self.assertIn(edge["target"], nodes)
        # There is no WebUI-to-Ollama connection in the supplied diagram.
        self.assertFalse(any(e["source"] == "WEBUI" and e["target"] == "OLLAMA" for e in self.graph["edges"]))

    def test_verification_notes_and_source_groups_are_preserved(self):
        labels = [e["label"] for e in self.graph["edges"] if e["unverified"]]
        self.assertTrue(any("not reverified" in label for label in labels))
        self.assertTrue(any("datasource (verify)" in label for label in labels))
        self.assertTrue(any("GPU acceleration availability (verify)" in label for label in labels))
        nodes = {n["id"]: n for n in self.graph["nodes"]}
        self.assertIn("PRIVATE", nodes["CADDY"]["groups"])
        self.assertIn("PUBLIC_API", nodes["PORTAPI"]["groups"])
        self.assertEqual(nodes["PORTAPI"]["notes"], "127.0.0.1:8000 · GET /api/homelab-status only")

    def test_transparent_export_is_preferred(self):
        chosen = ET.parse(self.folder / self.graph["source"]).getroot()
        self.assertNotIn("background", chosen.get("style", ""))

    def test_missing_or_non_mermaid_media_needs_no_graph(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            (path / "photo.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>')
            (path / "broken.svg").write_text("not an SVG")
            self.assertIsNone(build._architecture.load_architecture(path))


if __name__ == "__main__":
    unittest.main()
