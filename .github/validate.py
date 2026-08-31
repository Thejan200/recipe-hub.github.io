import json
import pathlib
import re
import xml.etree.ElementTree as ET

root = pathlib.Path(__file__).resolve().parents[1]
recipes = json.loads((root / "data/recipes.json").read_text(encoding="utf-8"))
assert isinstance(recipes, list) and recipes, "recipes.json must contain recipes"
ids = set()
for recipe in recipes:
    for field in ("id", "slug", "title", "category", "description", "ingredients", "instructions"):
        assert recipe.get(field), f"Missing {field} in {recipe.get('id')}"
    assert recipe["id"] not in ids, f"Duplicate recipe id: {recipe['id']}"
    ids.add(recipe["id"])
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", recipe["slug"]), f"Invalid slug: {recipe['slug']}"

sitemap = ET.parse(root / "sitemap.xml").getroot()
urls = [e.text for e in sitemap if e.text]
assert urls, "sitemap.xml contains no URLs"
base = "https://thejan200.github.io/recipe-hub.github.io/"
assert all(u.startswith(base) for u in urls), "Sitemap contains an unexpected URL"

required = ["index.html", "recipes.html", "recipe.html", "category.html", "favorites.html", "about.html", "contact.html", "privacy.html", "404.html", "robots.txt", "sitemap.xml", "data/recipes.json", "assets/css/style.css", "assets/js/app.js"]
for path in required:
    assert (root / path).is_file(), f"Missing required file: {path}"

print(f"OK: {len(recipes)} recipes, {len(urls)} sitemap URLs, {len(required)} required files.")
