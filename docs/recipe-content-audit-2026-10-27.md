# BiteSparks recipe-content audit — 27 October 2026

## Scope and method

This is a read-only evidence audit of all 213 recipe records currently published by BiteSparks. It checks the structured recipe data and the generated static pages for completeness, exact repeated wording, time outliers, nutrition-data coverage, and technical publication integrity. It does **not** claim that a recipe was personally cooked, taste-tested, or medically verified.

## Baseline that passed

- 213 published recipe records were found.
- Every record has a title, description, ingredients, instructions, tips, common mistakes, substitutions, and storage guidance.
- No exact duplicate recipe titles, slugs, descriptions, or effective recipe images were found.
- Static recipe pages, canonical URLs, Recipe JSON-LD, sitemap coverage, navigation, image integrity, English-video checks, and automated repository validation passed.

## Findings requiring editorial work

### 1. Repeated instruction template — high priority

The following six recipes share the same eight instruction steps verbatim. This is a material boilerplate risk because the directions are not specific enough to the named dish:

- Lamb Curry
- Bubble and Squeak
- Kedgeree
- Fish and Chips
- Bread Pudding
- Sticky Toffee Pudding

Each of these pages needs an individual rewrite based on its own ingredients, method, timing, texture cues, and food-safety requirements. Do not solve this merely by swapping words or adding a generic note.

### 2. Nutrition-data coverage — review required

43 recipes have a displayed calorie estimate but no structured `nutrition` object in their source record:

`honey-glazed-chicken-breast`, `classic-family-meatloaf`, `baked-mac-and-cheese`, `easy-lasagna`, `air-fryer-chicken-wings`, `golden-baked-pork-chops`, `old-fashioned-beef-stew`, `ground-beef-tacos`, `spaghetti-and-meatballs`, `fluffy-buttermilk-pancakes`, `classic-banana-bread`, `easy-sugar-cookies`, `awesome-slow-cooker-pot-roast`, `classic-chicken-pot-pie`, `classic-chocolate-chip-cookies`, `southern-fried-chicken`, `buffalo-chicken-dip`, `chicken-alfredo`, `chicken-parmesan`, `chicken-enchiladas`, `chicken-fajitas`, `chicken-fried-rice`, `chicken-caesar-salad`, `chicken-noodle-soup`, `cornish-pasty`, `sausage-and-mash`, `bangers-and-mash`, `toad-in-the-hole`, `beef-roast-dinner`, `sunday-roast-chicken`, `yorkshire-pudding`, `beef-stew`, `irish-style-stew`, `chicken-korma`, `maple-glazed-ham`, `salmon-cakes`, `salmon-chowder`, `seafood-chowder`, `french-canadian-pea-soup`, `canadian-chicken-pot-pie`, `tourtiere-meat-pie`, `canadian-roast-beef`, `canadian-meatloaf`.

Before adding structured nutrition, calculate and review serving sizes and ingredient quantities. Until then, retain the visible statement that nutrition values are estimates. Do not invent precise values.

### 3. Time outliers — editorial review required

The following total durations need a recipe-specific sanity check. A long duration is not automatically incorrect; slow-cooker, curing, chilling, resting, and marinating time must be clearly explained where included.

| Recipe | Current total |
| --- | --- |
| Berry Parfait | 8 minutes |
| Awesome Slow Cooker Pot Roast | 8 hr 10 min |
| Pulled Pork | 8 hr 20 min |
| Slow Cooker Chicken | 6 hr 20 min |
| Slow Cooker Chili | 6 hr 20 min |
| Slow Cooker Pulled Pork | 8 hr 15 min |
| Mince Pies | 14 hr |
| Montreal Smoked Meat Sandwich | 72 hr 45 min |
| Slow Cooker Lamb | 5 hr 20 min |

### 4. Short descriptions — secondary review

28 recipe descriptions contain fewer than 12 words. This is not automatically a quality failure, but these pages should be reviewed after the high-priority instruction issue. The goal is a useful, recipe-specific summary, not padding.

## Recommended fix order

1. Replace the six repeated instruction sets with individually verified directions.
2. Audit the nine duration outliers and correct only demonstrably incorrect totals.
3. Review the 43 nutrition records; either add properly calculated structured values or keep the existing estimate disclosure without false precision.
4. Improve the 28 short descriptions where an additional factual detail would help a cook decide whether to make the recipe.
5. Run the full validation suite and inspect each changed public page before merging.

## Integrity rules for the fix work

- No fabricated personal stories, testing claims, ratings, photographs, nutrition values, or citations.
- No mass synonym replacement intended merely to disguise automated text.
- Keep only English-speaking recipe tutorials and preserve the permanent RecipeTin Eats exclusion.
- Keep canonical URLs unchanged. A report or correction-only update creates no new recipe URL for GSC.

## What this audit does not establish

Automated checks cannot establish that a person cooked every recipe, that every ingredient quantity is correct, or that every result meets a reader's taste expectations. Those claims must not be made unless supported by actual evidence.
