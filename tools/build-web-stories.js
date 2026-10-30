#!/usr/bin/env node
/* Build-time generator for self-contained, valid-AMP Web Stories. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = 'https://bitesparks.com/';
const stories = JSON.parse(fs.readFileSync(path.join(root, 'data/web-stories.json'), 'utf8'));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const readAllRecipes = () => {
  const files = fs.readdirSync(path.join(root, 'data')).filter(name => /^recipes(?:-batch-\d+)?\.json$/.test(name));
  return files.flatMap(name => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8')));
};
const publishedIds = new Set(['monster-face-pie', 'pizza-skulls', 'mummy-pizza']);
const recipes = new Map(readAllRecipes().filter(recipe => recipe.status !== 'draft' || publishedIds.has(recipe.id)).map(recipe => [recipe.id, recipe]));
const storyUrl = id => `${base}stories/${id}/`;
const recipeUrl = id => `${base}recipes/${id}/`;
const storyPage = (story, recipe) => {
  const canonical = storyUrl(story.id);
  const poster = new URL(story.poster, base).href;
  const logo = new URL(stories.publisherLogo, base).href;
  const schema = JSON.stringify({ '@context':'https://schema.org', '@type':'WebPage', name:story.title, description:story.description, url:canonical, isPartOf:{'@type':'WebSite', name:stories.publisher, url:base}, about:{'@type':'Recipe', name:recipe.title, url:recipeUrl(recipe.id)} }).replace(/</g, '\\u003c');
  const pages = story.slides.map((slide, index) => {
    const tag = index === 0 ? 'h1' : 'h2';
    const action = slide.cta ? `<a class="story-card__cta" href="${esc(recipeUrl(recipe.id))}" title="${esc(slide.cta)}">${esc(slide.cta)}</a>` : '';
    return `<amp-story-page id="page-${index + 1}"><amp-story-grid-layer template="fill"><amp-img src="${esc(poster)}" width="1086" height="1448" layout="responsive" alt="${esc(recipe.title)}"></amp-img></amp-story-grid-layer><amp-story-grid-layer template="vertical" class="story-card${index === 0 ? ' story-card--cover' : ''}">${index === 0 ? `<p class="story-card__brand">BiteSparks</p>` : ''}<p class="story-card__eyebrow">${esc(slide.eyebrow)}</p><${tag}>${esc(slide.headline)}</${tag}><p>${esc(slide.body)}</p>${action}</amp-story-grid-layer></amp-story-page>`;
  }).join('');
  return `<!doctype html><html amp lang="en"><head><meta charset="utf-8"><script async src="https://cdn.ampproject.org/v0.js"></script><script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script><title>${esc(story.title)} | BiteSparks</title><link rel="canonical" href="${esc(canonical)}"><meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1"><meta name="description" content="${esc(story.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article"><meta property="og:title" content="${esc(story.title)} | BiteSparks"><meta property="og:description" content="${esc(story.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(poster)}"><meta name="twitter:card" content="summary_large_image"><style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript><style amp-custom>${fs.readFileSync(path.join(root, 'assets/css/web-stories.css'), 'utf8')}</style><script type="application/ld+json">${schema}</script></head><body><amp-story standalone title="${esc(story.title)}" publisher="${esc(stories.publisher)}" publisher-logo-src="${esc(logo)}" poster-portrait-src="${esc(poster)}">${pages}</amp-story></body></html>`;
};
const landing = () => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Short, visual recipe stories from BiteSparks."><meta name="robots" content="index,follow"><link rel="canonical" href="${base}stories/"><link rel="stylesheet" href="../assets/css/style.css?v=7"><link rel="stylesheet" href="../assets/css/web-stories.css"><title>Recipe Stories | BiteSparks</title></head><body><main class="stories-landing"><p class="eyebrow">BITE-SPARKS STORIES</p><h1>Short recipe stories</h1><p>Visual, self-contained recipe guides with practical cooking cues and a link to each full recipe.</p><div class="stories-grid">${stories.stories.map(story => `<a href="${story.id}/"><img src="../${esc(story.poster)}" width="1086" height="1448" alt="${esc(story.title)}"><h2>${esc(story.title)}</h2><p>${esc(story.description)}</p></a>`).join('')}</div></main></body></html>`;
for (const story of stories.stories) {
  const recipe = recipes.get(story.recipeId);
  if (!recipe) throw new Error(`Missing recipe for story: ${story.id}`);
  if (!Array.isArray(story.slides) || story.slides.length < 5) throw new Error(`Story must have at least five slides: ${story.id}`);
  const out = path.join(root, 'stories', story.id);
  fs.mkdirSync(out, { recursive:true });
  fs.writeFileSync(path.join(out, 'index.html'), storyPage(story, recipe));
}
fs.mkdirSync(path.join(root, 'stories'), { recursive:true });
fs.writeFileSync(path.join(root, 'stories', 'index.html'), landing());
console.log(`WEB STORIES OK: generated ${stories.stories.length} self-contained AMP stories.`);
