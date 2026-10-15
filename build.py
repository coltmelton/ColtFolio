"""Build the static portfolio and discover project and personal media."""
from __future__ import annotations

import html
import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil
import stat
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("wintermute_architecture", ROOT / "assets/projects/wintermute/architecture_source.py")
_architecture = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_architecture)
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif", ".apng", ".bmp", ".ico", ".jfif"}
MAX_ASSET_BYTES = 25 * 1024 * 1024


def validate_asset_sizes(directory: Path) -> None:
    oversized = [p for p in directory.rglob("*") if p.is_file() and p.stat().st_size > MAX_ASSET_BYTES]
    if oversized:
        details = ", ".join(f"{p.relative_to(directory)} ({p.stat().st_size / 1024 / 1024:.2f} MiB)" for p in oversized)
        raise ValueError("Cloudflare's 25 MiB asset limit exceeded: " + details)


def discover_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return sorted(
        (p for p in folder.iterdir() if p.is_file() and not p.is_symlink()
         and not p.name.startswith(".") and p.suffix.lower() in IMAGE_SUFFIXES),
        key=lambda p: (p.name.casefold(), p.name),
    )


def caption_for(image: Path) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[_-]+", " ", image.stem)).strip() or "Wintermute project image"


def image_markup(image: Path, prefix: str, *, cover: bool = False) -> str:
    url = html.escape(prefix + quote(image.name, safe=""), quote=True)
    caption = html.escape(caption_for(image), quote=True)
    if cover:
        return f'<img src="{url}" alt="{caption}" loading="lazy" decoding="async">'
    diagram = image.suffix.lower() == ".svg"
    background = ' data-image-background="light"' if diagram else ''
    classes = 'case-gallery__item case-gallery__item--diagram' if diagram else 'case-gallery__item'
    return (
        f'<figure class="{classes}">'
        f'<a href="{url}" data-gallery-image{background} aria-label="Enlarge: {caption}">'
        f'<img src="{url}" alt="{caption}" loading="lazy" decoding="async"></a>'
        f'<figcaption class="case-gallery__caption">{caption}</figcaption></figure>'
    )


def replace_region(document: str, region: str, content: str) -> str:
    start = f"<!-- {region}:start -->"
    end = f"<!-- {region}:end -->"
    if document.count(start) != 1 or document.count(end) != 1:
        raise ValueError(f"Expected one build region: {region}")
    before, rest = document.split(start, 1)
    _, after = rest.split(end, 1)
    return before + start + "\n" + content + "\n" + end + after


def personal_image_markup(image: Path, index: int) -> str:
    url = html.escape("assets/outside-the-lab/" + quote(image.name, safe=""), quote=True)
    description = html.escape(caption_for(image), quote=True)
    return (
        '<figure class="outside-lab__photo reveal">'
        f'<a href="{url}" target="_blank" rel="noopener" aria-label="Open personal photo {index} at full size">'
        f'<img src="{url}" alt="{description}" loading="lazy" decoding="async">'
        '<span class="outside-lab__enlarge" aria-hidden="true">View photo ↗</span>'
        '</a></figure>'
    )


def build(source: Path = ROOT, *, sync_source: bool = False) -> Path:
    source = source.resolve()
    output = source / "dist"
    # Only ever replace this project's resolved build directory, never source files.
    if output.is_symlink() or output.resolve() != source / "dist":
        raise ValueError("Build output must be the project's own dist directory")
    images = discover_images(source / "assets/projects/wintermute")
    homepage = (source / "index.html").read_text(encoding="utf-8")
    personal_images = discover_images(source / "assets/outside-the-lab")
    homepage = replace_region(homepage, "outside-lab-gallery", "\n".join(
        personal_image_markup(image, index) for index, image in enumerate(personal_images, 1)
    ))
    project = (source / "works/wintermute/index.html").read_text(encoding="utf-8")
    placeholder = '<span class="work-card__placeholder"><span class="work-card__placeholder-name">Wintermute</span><span class="work-card__placeholder-detail">Self-hosted infrastructure<br>Automation &amp; live monitoring</span></span>'
    homepage = replace_region(homepage, "wintermute-cover", image_markup(images[0], "assets/projects/wintermute/", cover=True) if images else placeholder)
    project = replace_region(project, "wintermute-empty", '' if images else '<p class="case-media__empty">Screenshots and photographs will be added here.</p>')
    project = replace_region(project, "wintermute-gallery", "\n".join(
        image_markup(image, "../../assets/projects/wintermute/") for image in images
    ))
    architecture = _architecture.load_architecture(source / "assets/projects/wintermute")
    architecture_markup = ''
    if architecture:
        data = json.dumps(architecture, ensure_ascii=False).replace("<", "\\u003c")
        architecture_markup = '<script type="application/json" id="wintermute-architecture-data">' + data + '</script>'
    project = replace_region(project, "wintermute-architecture", architecture_markup)
    if output.exists():
        def remove_readonly(function, path, _error):
            # Windows/OneDrive may preserve read-only attributes on copied assets.
            Path(path).chmod(stat.S_IWRITE | stat.S_IREAD | stat.S_IEXEC)
            function(path)
        shutil.rmtree(output, onerror=remove_readonly)
    output.mkdir()
    for name in ("index.html", "info.html", "contact.html", "styles.css", "script.js", "favicon.ico", ".assetsignore"):
        path = source / name
        if path.is_file():
            shutil.copy2(path, output / name)
    for name in ("assets", "works", "fonts"):
        path = source / name
        if path.is_dir():
            shutil.copytree(path, output / name, ignore=shutil.ignore_patterns(".DS_Store", ".gitkeep", "__pycache__"))
    (output / "index.html").write_text(homepage, encoding="utf-8")
    (output / "works/wintermute/index.html").write_text(project, encoding="utf-8")
    validate_asset_sizes(output)
    if sync_source:
        (source / 'index.html').write_text(homepage, encoding='utf-8')
        (source / 'works/wintermute/index.html').write_text(project, encoding='utf-8')
    print(f"Built {output}: {len(images)} Wintermute image(s), {len(personal_images)} personal photo(s)")
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sync-source', action='store_true', help='Refresh generated HTML regions for deployments that publish the repository root')
    build(sync_source=parser.parse_args().sync_source)
