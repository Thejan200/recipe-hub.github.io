import json
import pathlib
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parents[1]
recipes = json.loads((root / "data/recipes.json").read_text(encoding="utf-8"))
videos = json.loads((root / "data/videos.json").read_text(encoding="utf-8"))
assert isinstance(recipes, list) and recipes, "recipes.json must contain recipes"
assert isinstance(videos, dict), "videos.json must contain a recipe-to-video object"
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
    video = {**videos.get(recipe["id"], {}), **(recipe.get("video") or {})}
    assert video, f"Published recipe {recipe['id']} must have an English YouTube video"
    for field in ("youtubeId", "title", "channel", "channelUrl", "url", "language"):
        assert video.get(field), f"Video field {field} missing in {recipe['id']}"
    assert video["language"].lower() == "en", f"Video for {recipe['id']} must be English-only"
    assert re.fullmatch(r"[A-Za-z0-9_-]{11}", video["youtubeId"]), f"Invalid YouTube video ID in {recipe['id']}"
    assert re.match(r"^https://(www\.)?youtube\.com/", video["channelUrl"]), f"Invalid YouTube channel URL in {recipe['id']}"
    assert "youtube.com/watch?v=" in video["url"] or "youtu.be/" in video["url"], f"Invalid YouTube video URL in {recipe['id']}"

assert set(videos).issubset(ids), "videos.json contains a recipe ID that does not exist in recipes.json"
for recipe_id, video in videos.items():
    assert video.get("language", "").lower() == "en", f"Video catalog entry {recipe_id} must be English-only"

# Enforce uniqueness across the core catalog and every recipe batch.
all_recipe_files = [root / "data/recipes.json"] + sorted(root.glob("data/recipes-batch-*.json"))
all_catalog_recipes = []
for path in all_recipe_files:
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(payload, list), f"Recipe catalog file must contain a list: {path.relative_to(root)}"
    all_catalog_recipes.extend(payload)

# These are the same intentional image overrides used by the runtime batch loader.
effective_image_overrides = {
    "easy-lasagna": "https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=82",
    "spaghetti-and-meatballs": "https://images.unsplash.com/photo-1714383611462-f730359f9145?auto=format&fit=crop&w=1200&q=82",
    "awesome-slow-cooker-pot-roast": "https://images.unsplash.com/photo-1603185730021-ddc0c8097059?auto=format&fit=crop&w=1200&q=82",
    "classic-chicken-pot-pie": "https://images.unsplash.com/photo-1650917331384-1fd06afa3230?auto=format&fit=crop&w=1200&q=82"
}

catalog_ids = set(); catalog_slugs = set(); catalog_titles = set(); catalog_images = set()
def normalize_title(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").strip().lower()).strip()
def normalize_image(value):
    return str(value or "").strip().split("?", 1)[0].split("#", 1)[0].lower()

for recipe in all_catalog_recipes:
    source = recipe.get("id") or recipe.get("title") or "unknown"
    assert recipe.get("id") and recipe.get("slug") and recipe.get("title") and recipe.get("image"), f"Missing uniqueness field in {source}"
    recipe_id = str(recipe["id"]).strip().lower()
    slug = str(recipe["slug"]).strip().lower()
    title = normalize_title(recipe["title"])
    image = normalize_image(effective_image_overrides.get(recipe_id, recipe["image"]))
    assert recipe_id not in catalog_ids, f"Duplicate recipe id across catalog/batches: {recipe['id']}"
    assert slug not in catalog_slugs, f"Duplicate recipe slug across catalog/batches: {recipe['slug']}"
    assert title not in catalog_titles, f"Duplicate recipe title across catalog/batches: {recipe['title']}"
    assert image not in catalog_images, f"Duplicate recipe image across catalog/batches: {recipe['title']}"
    catalog_ids.add(recipe_id); catalog_slugs.add(slug); catalog_titles.add(title); catalog_images.add(image)

# Category images are a separate visual layer: they must never reuse a recipe image,
# another category image, or an image already referenced elsewhere on the site.
category_image_path = root / "data/category-images.json"
category_images = json.loads(category_image_path.read_text(encoding="utf-8"))
approved_categories = ["Breakfast", "Dinner", "Beef", "Pork", "Seafood", "Soup", "Dessert", "Healthy", "Chicken", "Vegetarian"]
assert isinstance(category_images, dict), "data/category-images.json must contain an object"
assert set(category_images) == set(approved_categories), "Category image registry must contain exactly the 10 approved categories"
category_image_values = [normalize_image(value) for value in category_images.values()]
assert all(category_image_values), "Every approved category must have a category image"
assert len(category_image_values) == len(set(category_image_values)), "Duplicate category image detected"
for category, image in zip(category_images, category_image_values):
    assert image not in catalog_images, f"Category image reuses a recipe image: {category}"

image_url_pattern = re.compile(r"https://images\.unsplash\.com/[^\"'\s)]+", re.I)
site_image_urls = set()
for path in root.rglob("*"):
    if not path.is_file() or path == category_image_path or ".git" in path.parts:
        continue
    if path.suffix.lower() not in {".html", ".js", ".json", ".css", ".md", ".svg"}:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    site_image_urls.update(normalize_image(value) for value in image_url_pattern.findall(text))
for category, image in zip(category_images, category_image_values):
    assert image not in site_image_urls, f"Category image is duplicated elsewhere on the site: {category}"

sitemap_root = ET.parse(root / "sitemap.xml").getroot()
urls = [e.text for e in sitemap_root.iter() if e.tag.endswith("}loc") and e.text]
assert urls and len(urls) == len(set(urls)), "sitemap.xml contains missing or duplicate URLs"
base = "https://thejan200.github.io/recipe-hub.github.io/"
assert all(u.startswith(base) for u in urls), "Sitemap contains an unexpected URL"
for recipe in recipes:
    if recipe.get("status") != "draft":
        assert base + "recipe.html?id=" + recipe["id"] in urls, f"Published recipe missing from sitemap: {recipe['id']}"

required = ["index.html", "recipes.html", "recipe.html", "category.html", "categories.html", "favorites.html", "about.html", "contact.html", "privacy.html", "terms.html", "disclaimer.html", "cookie-policy.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "favicon.svg", "data/recipes.json", "data/videos.json", "data/category-images.json", "assets/css/style.css", "assets/js/app.js", "assets/js/site.js", "assets/js/seo.js", "assets/js/video-loader.js"]
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

print(f"OK: {len(recipes)} core recipes, {len(all_catalog_recipes)} total catalog/batch recipes, {len(videos)} English YouTube videos, {len(category_images)} unique category images, {len(urls)} sitemap URLs, {len(required)} required files, local HTML references checked. Duplicate recipe IDs/slugs/titles/effective images, category-image separation and uniqueness, rich instructions, video attribution, English-only video policy, sitemap coverage, and asset checks: PASS.")
