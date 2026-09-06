import pathlib

root = pathlib.Path(__file__).resolve().parents[1]
js_files = sorted((root / "assets/js").glob("*.js"))

forbidden = (
    "rh-saved",
    "rh-theme",
    "rh-cookie-choice",
    "__rh",
    "rhMenuBound",
    "window.RecipeHub",
    "window.RecipeHubSEO",
)

for path in js_files:
    text = path.read_text(encoding="utf-8")
    for token in forbidden:
        assert token not in text, f"Legacy Recipe Hub internal token {token!r} remains in {path.relative_to(root)}"

app = (root / "assets/js/app.js").read_text(encoding="utf-8")
site = (root / "assets/js/site.js").read_text(encoding="utf-8")
for key in ("bs-saved", "bs-theme", "bs-cookie-choice"):
    assert key in app or key in site, f"Expected BiteSparks browser-storage key {key!r} is missing"

site_data = (root / "assets/js/site-data.js").read_text(encoding="utf-8")
seo = (root / "assets/js/seo.js").read_text(encoding="utf-8")
assert "window.BiteSparks=" in site_data, "BiteSparks site-data namespace missing"
assert "window.BiteSparksSEO=" in seo, "BiteSparks SEO namespace missing"

print("BRAND OK: BiteSparks internal namespaces and browser-storage keys are clean.")
