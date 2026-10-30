#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const base = 'https://bitesparks.com/';
const config = JSON.parse(fs.readFileSync(path.join(root, 'data/web-stories.json'), 'utf8'));
const fail = message => { throw new Error(message); };
if (!config.stories?.length) fail('At least one Web Story is required.');
if (!fs.existsSync(path.join(root, config.publisherLogo))) fail('Publisher logo is missing.');
const urls = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const story of config.stories) {
  const page = path.join(root, 'stories', story.id, 'index.html');
  const text = fs.readFileSync(page, 'utf8');
  const canonical = `${base}stories/${story.id}/`;
  if (!text.includes('<html amp')) fail(`${story.id}: missing AMP HTML marker`);
  if (!text.includes('custom-element="amp-story"')) fail(`${story.id}: missing amp-story extension`);
  if (!text.includes(`<link rel="canonical" href="${canonical}">`)) fail(`${story.id}: wrong self-canonical`);
  if (!text.includes('publisher-logo-src=') || !text.includes('poster-portrait-src=')) fail(`${story.id}: missing required story metadata`);
  if (!text.includes(`<a class="story-card__cta" href="${base}recipes/${story.recipeId}/"`)) fail(`${story.id}: missing canonical recipe CTA`);
  if ((text.match(/<amp-story-page /g) || []).length < 5) fail(`${story.id}: fewer than five story pages`);
  if (!urls.includes(canonical)) fail(`${story.id}: missing from sitemap`);
  if (!fs.existsSync(path.join(root, story.poster))) fail(`${story.id}: missing poster`);
}
if (!fs.existsSync(path.join(root, 'stories', 'index.html'))) fail('Stories landing page is missing.');
console.log(`WEB STORIES VALIDATION OK: ${config.stories.length} AMP story pages, self-canonicals, metadata, CTAs, local assets and sitemap entries PASS.`);
