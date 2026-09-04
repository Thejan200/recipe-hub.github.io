import json
import pathlib
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

root = pathlib.Path(__file__).resolve().parents[1]
base = "https://thejan200.github.io/recipe-hub.github.io/"

# Reconstruct the catalog that the browser publishes through recipe-batch-loader.js.
recipe_files = [root / "data/recipes.json"] + sorted(root.glob("data/recipes-batch-*.json"))
video_files = [root / "data/videos.json"] + sorted(root.glob("data/videos-batch-*.json"))
recipes = []
for path in recipe_files:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(data, list), f"Expected recipe list in {path.relative_to(root)}"
    recipes.extend(data)
videos = {}
for path in video_files:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(data, dict), f"Expected video object in {path.relative_to(root)}"
    videos.update(data)

loader = (root / "assets/js/recipe-batch-loader.js").read_text(encoding="utf-8")
block = re.search(r"const publishedBatchCategories\s*=\s*\{(.*?)\};", loader, re.S)
assert block, "Could not locate publishedBatchCategories in batch loader"
published_batch_ids = set(re.findall(r"['\"]([a-z0-9-]+)['\"]\s*:", block.group(1)))
runtime_published = [r for r in recipes if r.get("status") != "draft" or r.get("id") in published_batch_ids]
runtime_ids = {r.get("id") for r in runtime_published}
assert len(runtime_ids) == len(runtime_published), "Runtime published recipe IDs must be unique"

for recipe in runtime_published:
    rid = recipe["id"]
    video = {**videos.get(rid, {}), **(recipe.get("video") or {})}
    for field in ("youtubeId", "title", "channel", "channelUrl", "url", "language"):
        assert video.get(field), f"Runtime published recipe {rid} missing video field {field}"
    assert video["language"].lower() == "en", f"Runtime published recipe {rid} must use an English video"

# Sitemap must cover all runtime-published recipe URLs and all user-facing category collections.
sitemap = ET.parse(root / "sitemap.xml").getroot()
urls = {e.text for e in sitemap.iter() if e.tag.endswith("}loc") and e.text}
for rid in runtime_ids:
    assert base + "recipe.html?id=" + rid in urls, f"Runtime published recipe missing from sitemap: {rid}"
assert base + "categories.html" in urls, "Categories landing page missing from sitemap"
for category in ("Breakfast", "Dinner", "Beef", "Pork", "Seafood", "Soup", "Dessert", "Healthy", "Chicken", "Vegetarian", "Quick%20%26%20Easy"):
    assert base + "category.html?category=" + category in urls, f"Category missing from sitemap: {category}"
assert base + "category.html?category=Vegan" not in urls, "Stale Vegan collection URL should not be in sitemap"

# Catch the historic veggie-soup date mapping regression and require an audited fallback.
app = (root / "assets/js/app.js").read_text(encoding="utf-8")
site = (root / "assets/js/site.js").read_text(encoding="utf-8")
assert ("'veggie-soup':'2026-08-31'" in app or "result.id==='veggie-soup'" in site), "veggie-soup needs datePublished mapping"

# Core indexable static pages should carry canonical URLs.
for name in ("index.html", "recipes.html", "categories.html", "category.html", "recipe.html", "about.html", "contact.html", "privacy.html", "terms.html", "disclaimer.html", "cookie-policy.html"):
    text = (root / name).read_text(encoding="utf-8")
    assert 'rel="canonical"' in text, f"Missing canonical link in {name}"

# Legal/contact navigation must remain usable on mobile and expose the standard site navigation.
expected_nav = ["index.html", "recipes.html", "categories.html", "category.html?category=Healthy", "category.html?category=Quick%20%26%20Easy", "about.html", "contact.html"]
for name in ("privacy.html", "terms.html", "disclaimer.html", "cookie-policy.html", "contact.html"):
    text = (root / name).read_text(encoding="utf-8")
    assert 'class="menu-toggle"' in text and 'type="button"' in text, f"Mobile menu button incomplete in {name}"
    for href in expected_nav:
        assert f'href="{href}"' in text, f"Standard navigation link {href} missing in {name}"
    assert 'href="favorites.html"' in text, f"Saved link missing in {name}"

# Validate inline JavaScript too; this would have caught the earlier recipes pagination regression.
class ScriptParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.capture = False; self.kind = ""; self.parts = []; self.scripts = []
    def handle_starttag(self, tag, attrs):
        if tag != "script": return
        attrs = dict(attrs)
        if attrs.get("src"): return
        self.kind = attrs.get("type", "").lower()
        if self.kind in ("application/ld+json", "application/json"): return
        self.capture = True; self.parts = []
    def handle_data(self, data):
        if self.capture: self.parts.append(data)
    def handle_endtag(self, tag):
        if tag == "script" and self.capture:
            self.scripts.append("".join(self.parts)); self.capture = False; self.parts = []

for html in list(root.glob("*.html")) + list((root / "admin").glob("*.html")):
    parser = ScriptParser(); parser.feed(html.read_text(encoding="utf-8"))
    for index, script in enumerate(parser.scripts, 1):
        if not script.strip(): continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as f:
            f.write(script); temp = pathlib.Path(f.name)
        try:
            result = subprocess.run(["node", "--check", str(temp)], capture_output=True, text=True)
            assert result.returncode == 0, f"Inline JavaScript syntax error in {html.relative_to(root)} script {index}: {result.stderr.strip()}"
        finally:
            temp.unlink(missing_ok=True)

# Validate remaining WebP assets are actually WebP files.
for path in root.rglob("*.webp"):
    raw = path.read_bytes()
    assert len(raw) >= 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", f"Invalid WebP asset: {path.relative_to(root)}"

print(f"EXTENDED OK: {len(runtime_published)} runtime-published recipes, complete video coverage, sitemap coverage, canonical/navigation checks, inline JavaScript syntax, and image-file integrity PASS.")
