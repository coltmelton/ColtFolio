from pathlib import Path
import shutil
import tempfile
import unittest

import build


class WintermuteBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.source = Path(self.temp.name)
        self.media = self.source / "assets/projects/wintermute"
        self.media.mkdir(parents=True)
        (self.source / "works/wintermute").mkdir(parents=True)
        for name in ("index.html", "works/wintermute/index.html"):
            shutil.copy2(build.ROOT / name, self.source / name)
        self.original_homepage = (self.source / 'index.html').read_text(encoding='utf-8')

    def test_empty_build_keeps_placeholder_and_empty_gallery(self):
        (self.media / ".gitkeep").touch()
        output = build.build(self.source)
        homepage = (output / "index.html").read_text(encoding="utf-8")
        project = (output / "works/wintermute/index.html").read_text(encoding="utf-8")
        self.assertIn("work-card__placeholder", homepage)
        self.assertIn("Screenshots and photographs will be added here.", project)
        self.assertNotIn("data-gallery-image", project)
        self.assertFalse((output / "assets/projects/wintermute/.gitkeep").exists())

    def test_flat_discovery_handles_formats_case_unicode_and_unsafe_names(self):
        names = ["01 server & 'network'.PNG", "écran status.webp", "overview.SVG", "photo.JPEG"]
        for name in names:
            (self.media / name).write_text("test fixture", encoding="utf-8")
        (self.media / ".hidden.png").touch()
        (self.media / "notes.txt").touch()
        (self.media / "nested").mkdir()
        (self.media / "nested/not-discovered.jpg").touch()
        self.assertEqual(len(build.discover_images(self.media)), len(names))
        output = build.build(self.source)
        project = (output / "works/wintermute/index.html").read_text(encoding="utf-8")
        homepage = (output / "index.html").read_text(encoding="utf-8")
        self.assertEqual(project.count("data-gallery-image"), len(names))
        self.assertNotIn("Screenshots and photographs will be added here.", project)
        self.assertIn("01%20server%20%26%20%27network%27.PNG", homepage)
        self.assertIn("%C3%A9cran%20status.webp", project)
        self.assertIn("01 server &amp; &#x27;network&#x27;", project)
        self.assertEqual(self.original_homepage, (self.source / "index.html").read_text(encoding="utf-8"))

    def test_supported_formats_and_removed_media_are_reflected_at_next_build(self):
        for suffix in build.IMAGE_SUFFIXES:
            (self.media / ("image" + suffix)).touch()
        output = build.build(self.source)
        self.assertEqual((output / "works/wintermute/index.html").read_text(encoding="utf-8").count("data-gallery-image"), len(build.IMAGE_SUFFIXES))
        for image in self.media.iterdir():
            image.unlink()
        (output / "obsolete.html").touch()
        build.build(self.source)
        self.assertNotIn("data-gallery-image", (output / "works/wintermute/index.html").read_text(encoding="utf-8"))
        self.assertFalse((output / "obsolete.html").exists())

    def test_bad_build_markers_fail_before_replacing_existing_output(self):
        output = self.source / "dist"
        output.mkdir()
        (output / "keep.txt").write_text("previous valid build")
        (self.source / "works/wintermute/index.html").write_text("missing markers")
        with self.assertRaises(ValueError):
            build.build(self.source)
        self.assertTrue((output / "keep.txt").exists())

    def test_personal_gallery_discovers_photos_and_stays_between_skills_and_contact(self):
        folder = self.source / "assets/outside-the-lab"
        folder.mkdir(parents=True)
        for name in ("Hiking & travel.JPG", "Boxing.PNG", "Music.webp"):
            (folder / name).touch()
        (folder / "notes.txt").touch()
        (folder / ".hidden.jpg").touch()
        output = build.build(self.source)
        page = (output / "index.html").read_text(encoding="utf-8")
        self.assertEqual(page.count('class="outside-lab__photo reveal"'), 3)
        self.assertIn("Hiking%20%26%20travel.JPG", page)
        self.assertIn('alt="Hiking &amp; travel"', page)
        self.assertLess(page.index('id="skills"'), page.index('id="outside-the-lab"'))
        self.assertLess(page.index('id="outside-the-lab"'), page.index('id="contact"'))
        for photo in build.discover_images(folder):
            photo.unlink()
        build.build(self.source)
        self.assertNotIn('class="outside-lab__photo reveal"', (output / "index.html").read_text(encoding="utf-8"))

    def test_oversized_asset_reports_its_name(self):
        photo = self.media / "oversized-photo.jpg"
        with photo.open("wb") as handle:
            handle.truncate(build.MAX_ASSET_BYTES + 1)
        with self.assertRaisesRegex(ValueError, "oversized-photo.jpg"):
            build.validate_asset_sizes(self.source)

    def test_build_excludes_git_metadata_and_copies_upload_exclusions(self):
        (self.source / ".git/objects/pack").mkdir(parents=True)
        (self.source / ".git/objects/pack/history.pack").write_bytes(b"Git metadata")
        (self.source / ".assetsignore").write_text(".git/\n.git/**\n")
        output = build.build(self.source)
        self.assertFalse((output / ".git").exists())
        self.assertIn(".git/**", (output / ".assetsignore").read_text())

    def test_source_sync_renders_media_for_root_deployment_and_removes_stale_images(self):
        personal = self.source / 'assets/outside-the-lab'
        personal.mkdir(parents=True)
        (personal / 'Hiking.jpg').touch()
        (self.media / 'Monitoring.png').touch()
        build.build(self.source, sync_source=True)
        page = (self.source / 'index.html').read_text(encoding='utf-8')
        project = (self.source / 'works/wintermute/index.html').read_text(encoding='utf-8')
        self.assertIn('class="outside-lab__photo reveal"', page)
        self.assertIn('data-gallery-image', project)
        (personal / 'Hiking.jpg').unlink()
        (self.media / 'Monitoring.png').unlink()
        build.build(self.source, sync_source=True)
        self.assertNotIn('class="outside-lab__photo reveal"', (self.source / 'index.html').read_text(encoding='utf-8'))
        self.assertNotIn('data-gallery-image', (self.source / 'works/wintermute/index.html').read_text(encoding='utf-8'))


if __name__ == "__main__":
    unittest.main()
