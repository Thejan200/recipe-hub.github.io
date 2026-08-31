import json
import pathlib
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parents[1]
recipes = json.loads((root / "data/recipes.json").read_text(encoding="utf-8"))
assert isinstance(recipes, list) and recipes, "recipes.json must contain recipes"
ids = set(); slugs = set(); iso = re.compile(r"^PT(?:(\d+)H)?(?:(\d+)M)?$")
for recipe in recipes:
    for field in ("id", "slug", "title", "category", "description", "ingredients", "instructions", "image"):
        assert recipe.get(field), f"Missing {field} in {recipe.get('id')}"
    assert recipe["id"] not in ids, f"Duplicate recipe id: {recipe['id']}"
    assert recipe["slug"] not in slugs, f"Duplicate recipe slug: {recipe['slug']}"
    ids.add(recipe["id"]); slugs.add(recipe["slug"])
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", recipe["slug"]), f"Invalid slug: {recipe['slug']}"
    for field in ("prepTime", "cookTime", "totalTime"):
        assert iso.fullmatch(str(recipe.get(field, ""))), f"Invalid {field} in {recipe['id']}"
    assert isinstance(recipe["ingredients"], list) and recipe["ingredients"], f"Recipe {recipe['id']} needs ingredients"
    instructions = recipe["instructions"]
    assert isinstance(instructions, list) and len(instructions) >= 8, f"Recipe {recipe['id']} needs at least 8 detailed instruction steps"
    assert all(isinstance(step, str) and len(step.strip()) >= 80 for step in instructions), f"Recipe {recipe['id']} contains an instruction step shorter than 80 characters"
    average_length = sum(len(step.strip()) for step in instructions) / len(instructions)
    assert average_length >= 100, f"Recipe {recipe['id']} instructions are too terse; average step length must be at least 100 characters"
    if recipe.get("video"):
        video = recipe["video"]
        for field in ("youtubeId", "title", "channel", "channelUrl", "url"):
            assert video.get(field), f"Video attribution field {field} missing in {recipe['id']}"
        assert "youtube.com" in video["channelUrl"], f"Invalid YouTube channel URL in {recipe['id']}"
        assert "youtube.com/watch" in video["url"] or "youtu.be/" in video["url"], f"Invalid YouTube video URL in {recipe['id']}"

sitemap_root = ET.parse(root / "sitemap.xml").getroot()
urls = [e.text for e in sitemap_root.iter() if e.tag.endswith("}loc") and e.text]
assert urls and len(urls) == len(set(urls)), "sitemap.xml contains missing or duplicate URLs"
base = "https://thejan200.github.io/recipe-hub.github.io/"
assert all(u.startswith(base) for u in urls), "Sitemap contains an unexpected URL"
for recipe in recipes:
    if recipe.get("status") != "draft":
        assert base + "recipe.html?id=" + recipe["id"] in urls, f"Published recipe missing from sitemap: {recipe['id']}"

required = ["index.html", "recipes.html", "recipe.html", "category.html", "favorites.html", "about.html", "contact.html", "privacy.html", "terms.html", "disclaimer.html", "cookie-policy.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "favicon.svg", "data/recipes.json", "assets/css/style.css", "assets/js/app.js", "assets/js/site.js", "assets/js/seo.js"]
for path in required:
    assert (root / path).is_file(), f"Missing required file: {path}"

class RefParser(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for key in ("href", "src"):
            if attrs.get(key): self.refs.append(attrs[key])

html_files = list(root.glob("*.html")) + list((root / "admin").glob("*.html"))
for html in html_files:
    parser=RefParser(); parser.feed(html.read_text(encoding="utf-8"))
    for ref in parser.refs:
        if ref.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "data:")): continue
        target=(html.parent / urlparse(ref).path).resolve()
        assert (target.exists() and root in target.parents) or target == root, f"Broken or escaping local reference in {html.relative_to(root)}: {ref}"

print(f"OK: {len(recipes)} recipes, {len(urls)} sitemap URLs, {len(required)} required files, local HTML references checked. Rich beginner instructions, video attribution, sitemap coverage, and asset checks: PASS.")
