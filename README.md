# Recipe Hub

A fast, responsive, SEO-focused recipe website designed for a US-first international English-speaking audience.

## Stack
- Static HTML/CSS/JavaScript
- GitHub Pages
- Structured recipe content in `data/recipes.json`
- JSON-LD structured data for recipes and website search
- GitHub Actions validation

## Content workflow
1. Edit or create recipe data in `data/recipes.json`.
2. Keep each `id` and `slug` unique and URL-safe.
3. Use `status: published` only for content ready for public display.
4. Use the local `admin/` helper to generate draft JSON.
5. Commit changes to `main`.

## SEO checklist
- Maintain unique titles and descriptions.
- Use descriptive recipe slugs.
- Provide optimized, relevant images with useful alt text in the UI.
- Keep `sitemap.xml` current as public URLs grow.
- Verify the deployed site in Google Search Console after launch.

## Monetization readiness
Ad slots, affiliate content, analytics, and newsletter integrations should be added only after their providers and consent requirements are configured. Do not put provider secrets or API keys in this static site.

## Deployment
GitHub Pages can serve the repository directly. After enabling Pages, use the deployed URL as the canonical site URL and submit the sitemap in Search Console.
