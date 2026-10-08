import json
import hashlib
import pathlib
import re
import subprocess
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

root = pathlib.Path(__file__).resolve().parents[1]
base = "https://bitesparks.com/"

# The committed static output must always be rebuilt from the exact runtime
# catalog before a publish. This is a build-time check only; no server or data
# service is involved.
def output_fingerprint():
    files = [root / "sitemap.xml"]
    for directory in (root / "recipes", root / "categories"):
        if directory.exists(): files.extend(path for path in directory.rglob("*") if path.is_file())
    return {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(files)}

before = output_fingerprint()
result = subprocess.run(["node", "tools/build-static-seo-pages.js"], cwd=root, capture_output=True, text=True)
assert result.returncode == 0, f"Static SEO build failed:\n{result.stdout}\n{result.stderr}"
after = output_fingerprint()
if before != after:
    print("STATIC SEO DIFF FILES:")
    for key in sorted(set(before) | set(after)):
        if before.get(key) != after.get(key): print(key)
    p = root / "recipes/index.html"
    if p.is_file():
        generated = p.read_text(encoding="utf-8")
        print("RECIPES_INDEX_LEN", len(generated))
        old_bytes = p.read_bytes()
        # before output was fingerprinted before build; recover expected current file from git is not available here, so print structural anchors from generated output.
        for marker in ["Browse 181 BiteSparks recipes","Browse 182 BiteSparks recipes","181 recipes","182 recipes","maple-chicken","caesar-salad"]:
            print("ANCHOR", marker, generated.find(marker))
        print("TAIL", generated[-1800:])
    raise AssertionError("Static SEO output was stale. Run: node tools/build-static-seo-pages.js and commit the generated files.")

loader = (root / "assets/js/recipe-batch-loader.js").read_text(encoding="utf-8")
block = re.search(r"const publishedBatchCategories\s*=\s*\{(.*?)\};", loader, re.S)
assert block, "Could not locate published batch mapping"
published_batch_ids = set(re.findall(r"['\"]([a-z0-9-]+)['\"]\s*:", block.group(1)))

recipes = []
for source in [root / "data/recipes.json", *sorted(root.glob("data/recipes-batch-*.json"))]:
    recipes.extend(json.loads(source.read_text(encoding="utf-8")))
runtime_recipes = [recipe for recipe in recipes if recipe.get("status") != "draft" or recipe.get("id") in published_batch_ids]
assert runtime_recipes and len({recipe["id"] for recipe in runtime_recipes}) == len(runtime_recipes), "Runtime recipe IDs must be unique"

class RecipePageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.h1 = ""
        self.canonical = ""
        self.description = ""
        self.scripts = []
        self.capture = None
        self.parts = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "link" and data.get("rel") == "canonical": self.canonical = data.get("href", "")
        if tag == "meta" and data.get("name") == "description": self.description = data.get("content", "")
        if tag == "title": self.capture = "title"; self.parts = []
        if tag == "h1": self.capture = "h1"; self.parts = []
        if tag == "script" and data.get("type") == "application/ld+json": self.capture = "schema"; self.parts = []

    def handle_data(self, data):
        if self.capture: self.parts.append(data)

    def handle_endtag(self, tag):
        if self.capture == "title" and tag == "title": self.title = "".join(self.parts).strip(); self.capture = None
        elif self.capture == "h1" and tag == "h1": self.h1 = "".join(self.parts).strip(); self.capture = None
        elif self.capture == "schema" and tag == "script": self.scripts.append("".join(self.parts)); self.capture = None

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"href", "src"} and value: self.refs.append(value)

for recipe in runtime_recipes:
    page = root / "recipes" / recipe["id"] / "index.html"
    assert page.is_file(), f"Missing static recipe page: {recipe['id']}"
    parser = RecipePageParser(); parser.feed(page.read_text(encoding="utf-8"))
    expected_url = f"{base}recipes/{recipe['id']}/"
    assert parser.canonical == expected_url, f"Wrong canonical for {recipe['id']}"
    assert recipe["title"] in parser.title and recipe["title"] == parser.h1, f"Missing unique title/H1 for {recipe['id']}"
    assert parser.description == recipe.get("description", ""), f"Wrong static description for {recipe['id']}"
    assert parser.scripts, f"Missing static JSON-LD for {recipe['id']}"
    schema = json.loads(parser.scripts[0])
    assert schema.get("@type") == "Recipe" and schema.get("name") == recipe["title"], f"Wrong Recipe schema for {recipe['id']}"
    assert schema.get("recipeIngredient") and schema.get("recipeInstructions"), f"Incomplete Recipe schema for {recipe['id']}"
    assert schema.get("video", {}).get("embedUrl", "").startswith("https://www.youtube.com/embed/"), f"Missing VideoObject for {recipe['id']}"

taxonomy = json.loads((root / "data/category-taxonomy.json").read_text(encoding="utf-8"))
for category in taxonomy["categories"]:
    slug = re.sub(r"^-|-?$", "", re.sub(r"[^a-z0-9]+", "-", category.lower().replace("&", " and ")))
    assert (root / "categories" / slug / "index.html").is_file(), f"Missing static category page: {category}"

sitemap = ET.parse(root / "sitemap.xml").getroot()
urls = {element.text for element in sitemap.iter() if element.tag.endswith("}loc")}
assert base + "recipes/" in urls, "Static all-recipes page missing from sitemap"
for recipe in runtime_recipes:
    assert f"{base}recipes/{recipe['id']}/" in urls, f"Static recipe missing from sitemap: {recipe['id']}"
for category in taxonomy["categories"]:
    slug = re.sub(r"^-|-?$", "", re.sub(r"[^a-z0-9]+", "-", category.lower().replace("&", " and ")))
    assert f"{base}categories/{slug}/" in urls, f"Static category missing from sitemap: {category}"

legacy_recipe = (root / "recipe.html").read_text(encoding="utf-8")
legacy_category = (root / "category.html").read_text(encoding="utf-8")
assert 'name="robots" content="noindex,follow"' in legacy_recipe and "location.replace" in legacy_recipe, "Legacy recipe URL must safely redirect and remain noindex"
assert 'name="robots" content="noindex,follow"' in legacy_category and "location.replace" in legacy_category, "Legacy category URL must safely redirect and remain noindex"

# Generated pages must not contain a broken local navigation, asset, or recipe link.
for page in [*root.joinpath("recipes").rglob("index.html"), *root.joinpath("categories").rglob("index.html")]:
    parser = LinkParser(); parser.feed(page.read_text(encoding="utf-8"))
    for ref in parser.refs:
        if ref.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "data:")): continue
        local_path = ref.split("?", 1)[0].split("#", 1)[0]
        if not local_path: continue
        target = (page.parent / local_path).resolve()
        assert (target.exists() and root in target.parents) or target == root, f"Broken generated reference in {page.relative_to(root)}: {ref}"

print(f"STATIC SEO OK: {len(runtime_recipes)} static recipe pages, {len(taxonomy['categories'])} static category pages, static sitemap, canonical metadata, Recipe JSON-LD, and safe legacy redirects PASS.")
