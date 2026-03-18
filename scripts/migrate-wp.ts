#!/usr/bin/env npx tsx
/**
 * WordPress -> Supabase migration generator for bestwine.online
 *
 * Generates supabase/migration.sql from known WordPress URL structure.
 * Run: npx tsx scripts/migrate-wp.ts
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Category {
  slug: string;
  parent: string | null;
  sort: number;
}

const categories: Category[] = [
  // Top-level (parent_id = NULL)
  { slug: 'whisky', parent: null, sort: 1 },
  { slug: 'vin-rouge', parent: null, sort: 2 },
  { slug: 'vin-blanc', parent: null, sort: 3 },
  { slug: 'vin-rose', parent: null, sort: 4 },
  { slug: 'vin-jaune', parent: null, sort: 5 },
  { slug: 'vin-orange', parent: null, sort: 6 },
  { slug: 'champagne', parent: null, sort: 7 },
  { slug: 'prosecco', parent: null, sort: 8 },
  { slug: 'cremant', parent: null, sort: 9 },
  { slug: 'cava', parent: null, sort: 10 },
  { slug: 'blanquettes-de-limoux', parent: null, sort: 11 },
  { slug: 'clairette-de-die', parent: null, sort: 12 },
  { slug: 'mousseux', parent: null, sort: 13 },
  { slug: 'rhum', parent: null, sort: 14 },
  { slug: 'vodka', parent: null, sort: 15 },
  { slug: 'cognac', parent: null, sort: 16 },
  { slug: 'armagnac', parent: null, sort: 17 },
  { slug: 'calvados', parent: null, sort: 18 },
  { slug: 'brandy', parent: null, sort: 19 },
  { slug: 'eau-de-vie', parent: null, sort: 20 },
  { slug: 'grappa', parent: null, sort: 21 },
  { slug: 'kirsch', parent: null, sort: 22 },
  { slug: 'pisco', parent: null, sort: 23 },
  { slug: 'cachaca', parent: null, sort: 24 },
  { slug: 'lambig', parent: null, sort: 25 },
  { slug: 'liqueurs', parent: null, sort: 26 },
  { slug: 'gin', parent: null, sort: 27 },
  { slug: 'tequila', parent: null, sort: 28 },
  { slug: 'mezcal', parent: null, sort: 29 },
  { slug: 'sake', parent: null, sort: 30 },
  { slug: 'pastis', parent: null, sort: 31 },
  { slug: 'vermouth', parent: null, sort: 32 },
  { slug: 'porto', parent: null, sort: 33 },
  { slug: 'pineau-des-charentes', parent: null, sort: 34 },
  { slug: 'marsala', parent: null, sort: 35 },
  { slug: 'arak', parent: null, sort: 36 },
  { slug: 'raki', parent: null, sort: 37 },
  { slug: 'ouzo', parent: null, sort: 38 },
  { slug: 'schnaps', parent: null, sort: 39 },
  { slug: 'aquavit', parent: null, sort: 40 },
  { slug: 'sambuca', parent: null, sort: 41 },
  { slug: 'amaretto', parent: null, sort: 42 },
  { slug: 'triple-sec', parent: null, sort: 43 },
  { slug: 'marasquin', parent: null, sort: 44 },
  { slug: 'manzana', parent: null, sort: 45 },
  { slug: 'chartreuse', parent: null, sort: 46 },
  { slug: 'genepi', parent: null, sort: 47 },
  { slug: 'genievre', parent: null, sort: 48 },
  { slug: 'bitter', parent: null, sort: 49 },
  { slug: 'digestif', parent: null, sort: 50 },
  { slug: 'patxaran', parent: null, sort: 51 },
  { slug: 'chouchen', parent: null, sort: 52 },
  { slug: 'hydromel', parent: null, sort: 53 },
  { slug: 'creme-cassis', parent: null, sort: 54 },
  { slug: 'biere', parent: null, sort: 55 },
  { slug: 'cidre', parent: null, sort: 56 },
  { slug: 'vins-spiritueux-dessert', parent: null, sort: 57 },

  // Subcategories — whisky
  { slug: 'bourbon', parent: 'whisky', sort: 1 },
  { slug: 'canadien', parent: 'whisky', sort: 2 },
  { slug: 'francais', parent: 'whisky', sort: 3 },
  { slug: 'indien', parent: 'whisky', sort: 4 },
  { slug: 'irlandais', parent: 'whisky', sort: 5 },
  { slug: 'japonais', parent: 'whisky', sort: 6 },
  { slug: 'scotch', parent: 'whisky', sort: 7 },

  // Subcategories — rhum
  { slug: 'agricole', parent: 'rhum', sort: 1 },
  { slug: 'ambre', parent: 'rhum', sort: 2 },
  { slug: 'arrange', parent: 'rhum', sort: 3 },
  { slug: 'blanc', parent: 'rhum', sort: 4 },
  { slug: 'cubain', parent: 'rhum', sort: 5 },
  { slug: 'martiniquais', parent: 'rhum', sort: 6 },
  { slug: 'vieux', parent: 'rhum', sort: 7 },

  // Subcategories — vodka
  { slug: 'francaise', parent: 'vodka', sort: 1 },
  { slug: 'pologne', parent: 'vodka', sort: 2 },
  { slug: 'russie', parent: 'vodka', sort: 3 },

  // Subcategories — champagne
  { slug: 'rose', parent: 'champagne', sort: 1 },

  // Subcategories — cremant
  { slug: 'alsace', parent: 'cremant', sort: 1 },
  { slug: 'bourgogne', parent: 'cremant', sort: 2 },
  { slug: 'jura', parent: 'cremant', sort: 3 },
  { slug: 'loire', parent: 'cremant', sort: 4 },
  { slug: 'cremant-rose', parent: 'cremant', sort: 5 },
  { slug: 'savoie', parent: 'cremant', sort: 6 },

  // Subcategories — mousseux
  { slug: 'saumur', parent: 'mousseux', sort: 1 },
  { slug: 'vouvray', parent: 'mousseux', sort: 2 },

  // Subcategories — liqueurs (level 2)
  { slug: 'cafe', parent: 'liqueurs', sort: 1 },
  { slug: 'chocolat', parent: 'liqueurs', sort: 2 },
  { slug: 'herbes', parent: 'liqueurs', sort: 3 },
  { slug: 'limoncello', parent: 'liqueurs', sort: 4 },
  { slug: 'liqueur-whisky', parent: 'liqueurs', sort: 5 },
  { slug: 'fruits', parent: 'liqueurs', sort: 6 },
  { slug: 'plantes', parent: 'liqueurs', sort: 7 },

  // Subcategories — liqueurs/fruits (level 3)
  { slug: 'amande', parent: 'fruits', sort: 1 },
  { slug: 'cassis', parent: 'fruits', sort: 2 },
  { slug: 'cerise', parent: 'fruits', sort: 3 },
  { slug: 'citron', parent: 'fruits', sort: 4 },
  { slug: 'framboise', parent: 'fruits', sort: 5 },
  { slug: 'litchi', parent: 'fruits', sort: 6 },
  { slug: 'noix-de-coco', parent: 'fruits', sort: 7 },
  { slug: 'noix', parent: 'fruits', sort: 8 },
  { slug: 'orange', parent: 'fruits', sort: 9 },
  { slug: 'peche', parent: 'fruits', sort: 10 },
  { slug: 'pomme', parent: 'fruits', sort: 11 },

  // Subcategories — liqueurs/plantes (level 3)
  { slug: 'anis', parent: 'plantes', sort: 1 },
  { slug: 'menthe', parent: 'plantes', sort: 2 },
];

// ---------------------------------------------------------------------------
// French names
// ---------------------------------------------------------------------------

const frNames: Record<string, string> = {
  'whisky': 'Whisky',
  'vin-rouge': 'Vin rouge',
  'vin-blanc': 'Vin blanc',
  'vin-rose': 'Vin rosé',
  'vin-jaune': 'Vin jaune',
  'vin-orange': 'Vin orange',
  'champagne': 'Champagne',
  'prosecco': 'Prosecco',
  'cremant': 'Crémant',
  'cava': 'Cava',
  'blanquettes-de-limoux': 'Blanquette de Limoux',
  'clairette-de-die': 'Clairette de Die',
  'mousseux': 'Mousseux',
  'rhum': 'Rhum',
  'vodka': 'Vodka',
  'cognac': 'Cognac',
  'armagnac': 'Armagnac',
  'calvados': 'Calvados',
  'brandy': 'Brandy',
  'eau-de-vie': 'Eau-de-vie',
  'grappa': 'Grappa',
  'kirsch': 'Kirsch',
  'pisco': 'Pisco',
  'cachaca': 'Cachaça',
  'lambig': 'Lambig',
  'liqueurs': 'Liqueurs',
  'gin': 'Gin',
  'tequila': 'Tequila',
  'mezcal': 'Mezcal',
  'sake': 'Saké',
  'pastis': 'Pastis',
  'vermouth': 'Vermouth',
  'porto': 'Porto',
  'pineau-des-charentes': 'Pineau des Charentes',
  'marsala': 'Marsala',
  'arak': 'Arak',
  'raki': 'Raki',
  'ouzo': 'Ouzo',
  'schnaps': 'Schnaps',
  'aquavit': 'Aquavit',
  'sambuca': 'Sambuca',
  'amaretto': 'Amaretto',
  'triple-sec': 'Triple sec',
  'marasquin': 'Marasquin',
  'manzana': 'Manzana',
  'chartreuse': 'Chartreuse',
  'genepi': 'Génépi',
  'genievre': 'Genièvre',
  'bitter': 'Bitter',
  'digestif': 'Digestif',
  'patxaran': 'Patxaran',
  'chouchen': 'Chouchen',
  'hydromel': 'Hydromel',
  'creme-cassis': 'Crème de Cassis',
  'biere': 'Bière',
  'cidre': 'Cidre',
  'vins-spiritueux-dessert': 'Vins & Spiritueux de dessert',
  // whisky subs
  'bourbon': 'Bourbon',
  'canadien': 'Whisky canadien',
  'francais': 'Whisky français',
  'indien': 'Whisky indien',
  'irlandais': 'Whisky irlandais',
  'japonais': 'Whisky japonais',
  'scotch': 'Scotch whisky',
  // rhum subs
  'agricole': 'Rhum agricole',
  'ambre': 'Rhum ambré',
  'arrange': 'Rhum arrangé',
  'blanc': 'Rhum blanc',
  'cubain': 'Rhum cubain',
  'martiniquais': 'Rhum martiniquais',
  'vieux': 'Rhum vieux',
  // vodka subs
  'francaise': 'Vodka française',
  'pologne': 'Vodka de Pologne',
  'russie': 'Vodka de Russie',
  // champagne subs
  'rose': 'Champagne rosé',
  // cremant subs
  'alsace': 'Crémant d\'Alsace',
  'bourgogne': 'Crémant de Bourgogne',
  'jura': 'Crémant du Jura',
  'loire': 'Crémant de Loire',
  'cremant-rose': 'Crémant rosé',
  'savoie': 'Crémant de Savoie',
  // mousseux subs
  'saumur': 'Saumur mousseux',
  'vouvray': 'Vouvray mousseux',
  // liqueurs subs
  'cafe': 'Liqueur de café',
  'chocolat': 'Liqueur de chocolat',
  'herbes': 'Liqueur aux herbes',
  'limoncello': 'Limoncello',
  'liqueur-whisky': 'Liqueur de whisky',
  'fruits': 'Liqueurs de fruits',
  'plantes': 'Liqueurs de plantes',
  // liqueurs/fruits subs
  'amande': 'Liqueur d\'amande',
  'cassis': 'Liqueur de cassis',
  'cerise': 'Liqueur de cerise',
  'citron': 'Liqueur de citron',
  'framboise': 'Liqueur de framboise',
  'litchi': 'Liqueur de litchi',
  'noix-de-coco': 'Liqueur de noix de coco',
  'noix': 'Liqueur de noix',
  'orange': 'Liqueur d\'orange',
  'peche': 'Liqueur de pêche',
  'pomme': 'Liqueur de pomme',
  // liqueurs/plantes subs
  'anis': 'Liqueur d\'anis',
  'menthe': 'Liqueur de menthe',
};

// ---------------------------------------------------------------------------
// English names (en-us)
// ---------------------------------------------------------------------------

const enNames: Record<string, string> = {
  'whisky': 'Whisky',
  'vin-rouge': 'Red Wine',
  'vin-blanc': 'White Wine',
  'vin-rose': 'Rosé Wine',
  'vin-jaune': 'Yellow Wine',
  'vin-orange': 'Orange Wine',
  'champagne': 'Champagne',
  'prosecco': 'Prosecco',
  'cremant': 'Crémant',
  'cava': 'Cava',
  'blanquettes-de-limoux': 'Blanquette de Limoux',
  'clairette-de-die': 'Clairette de Die',
  'mousseux': 'Sparkling Wine',
  'rhum': 'Rum',
  'vodka': 'Vodka',
  'cognac': 'Cognac',
  'armagnac': 'Armagnac',
  'calvados': 'Calvados',
  'brandy': 'Brandy',
  'eau-de-vie': 'Eau-de-vie',
  'grappa': 'Grappa',
  'kirsch': 'Kirsch',
  'pisco': 'Pisco',
  'cachaca': 'Cachaça',
  'lambig': 'Lambig',
  'liqueurs': 'Liqueurs',
  'gin': 'Gin',
  'tequila': 'Tequila',
  'mezcal': 'Mezcal',
  'sake': 'Sake',
  'pastis': 'Pastis',
  'vermouth': 'Vermouth',
  'porto': 'Port Wine',
  'pineau-des-charentes': 'Pineau des Charentes',
  'marsala': 'Marsala',
  'arak': 'Arak',
  'raki': 'Raki',
  'ouzo': 'Ouzo',
  'schnaps': 'Schnapps',
  'aquavit': 'Aquavit',
  'sambuca': 'Sambuca',
  'amaretto': 'Amaretto',
  'triple-sec': 'Triple Sec',
  'marasquin': 'Maraschino',
  'manzana': 'Manzana',
  'chartreuse': 'Chartreuse',
  'genepi': 'Génépi',
  'genievre': 'Genever',
  'bitter': 'Bitters',
  'digestif': 'Digestif',
  'patxaran': 'Patxaran',
  'chouchen': 'Chouchen',
  'hydromel': 'Mead',
  'creme-cassis': 'Crème de Cassis',
  'biere': 'Beer',
  'cidre': 'Cider',
  'vins-spiritueux-dessert': 'Dessert Wines & Spirits',
  // whisky subs
  'bourbon': 'Bourbon',
  'canadien': 'Canadian Whisky',
  'francais': 'French Whisky',
  'indien': 'Indian Whisky',
  'irlandais': 'Irish Whiskey',
  'japonais': 'Japanese Whisky',
  'scotch': 'Scotch Whisky',
  // rhum subs
  'agricole': 'Agricole Rum',
  'ambre': 'Amber Rum',
  'arrange': 'Infused Rum',
  'blanc': 'White Rum',
  'cubain': 'Cuban Rum',
  'martiniquais': 'Martinique Rum',
  'vieux': 'Aged Rum',
  // vodka subs
  'francaise': 'French Vodka',
  'pologne': 'Polish Vodka',
  'russie': 'Russian Vodka',
  // champagne subs
  'rose': 'Rosé Champagne',
  // cremant subs
  'alsace': 'Crémant d\'Alsace',
  'bourgogne': 'Crémant de Bourgogne',
  'jura': 'Crémant du Jura',
  'loire': 'Crémant de Loire',
  'cremant-rose': 'Rosé Crémant',
  'savoie': 'Crémant de Savoie',
  // mousseux subs
  'saumur': 'Saumur Sparkling',
  'vouvray': 'Vouvray Sparkling',
  // liqueurs subs
  'cafe': 'Coffee Liqueur',
  'chocolat': 'Chocolate Liqueur',
  'herbes': 'Herbal Liqueur',
  'limoncello': 'Limoncello',
  'liqueur-whisky': 'Whisky Liqueur',
  'fruits': 'Fruit Liqueurs',
  'plantes': 'Botanical Liqueurs',
  // liqueurs/fruits subs
  'amande': 'Almond Liqueur',
  'cassis': 'Blackcurrant Liqueur',
  'cerise': 'Cherry Liqueur',
  'citron': 'Lemon Liqueur',
  'framboise': 'Raspberry Liqueur',
  'litchi': 'Lychee Liqueur',
  'noix-de-coco': 'Coconut Liqueur',
  'noix': 'Walnut Liqueur',
  'orange': 'Orange Liqueur',
  'peche': 'Peach Liqueur',
  'pomme': 'Apple Liqueur',
  // liqueurs/plantes subs
  'anis': 'Anise Liqueur',
  'menthe': 'Mint Liqueur',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape single quotes for SQL */
function esc(s: string): string {
  return s.replace(/'/g, "''");
}

/** Generate FR meta_title */
function frMetaTitle(name: string): string {
  return `${name} : les meilleures bouteilles à la carte des restaurants étoilés`;
}

/** Generate FR meta_description */
function frMetaDesc(name: string): string {
  // Use the lowercase name for the sentence middle
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  return `Découvrez les meilleurs ${lower} référencés à la carte des grands restaurants gastronomiques étoilés Michelin.`;
}

/** Generate EN meta_title */
function enMetaTitle(name: string): string {
  return `${name}: the best bottles on Michelin-starred restaurant menus`;
}

/** Generate EN meta_description */
function enMetaDesc(name: string): string {
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  return `Discover the finest ${lower} featured on Michelin-starred gastronomic restaurant wine lists.`;
}

// ---------------------------------------------------------------------------
// Build the WordPress URL path for a category (for redirects)
// ---------------------------------------------------------------------------

function wpPath(cat: Category): string {
  // For subcategories, the WP URL was /{parent}/{slug}/ or /{grandparent}/{parent}/{slug}/
  const parts: string[] = [cat.slug];
  let current = cat;
  while (current.parent) {
    parts.unshift(current.parent);
    const parentCat = categories.find(c => c.slug === current.parent);
    if (!parentCat) break;
    current = parentCat;
  }
  return `/${parts.join('/')}/`;
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

function generateMigrationSQL(): string {
  const lines: string[] = [];

  lines.push('-- supabase/migration.sql');
  lines.push('-- Generated by scripts/migrate-wp.ts');
  lines.push(`-- Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('--');
  lines.push('-- WordPress -> Supabase category migration for bestwine.online');
  lines.push(`-- ${categories.length} categories, FR + EN-US translations, 301 redirects`);
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  // ------------------------------------------------------------------
  // 1. Clean existing seed data (avoid conflicts)
  // ------------------------------------------------------------------
  lines.push('-- =====================================================');
  lines.push('-- 1. Clean existing seed data');
  lines.push('-- =====================================================');
  lines.push('DELETE FROM category_translations;');
  lines.push('DELETE FROM redirects;');
  lines.push('DELETE FROM wine_list_entries;');
  lines.push('DELETE FROM drink_translations;');
  lines.push('DELETE FROM drinks;');
  lines.push('DELETE FROM categories;');
  lines.push('');

  // ------------------------------------------------------------------
  // 2. Insert categories (parents first, then children, then grandchildren)
  // ------------------------------------------------------------------
  lines.push('-- =====================================================');
  lines.push('-- 2. Insert categories');
  lines.push('-- =====================================================');
  lines.push('');

  // Level 0: top-level
  const topLevel = categories.filter(c => c.parent === null);
  lines.push('-- Level 0: top-level categories');
  lines.push('INSERT INTO categories (slug, parent_id, sort_order) VALUES');
  const topValues = topLevel.map(c => `  ('${esc(c.slug)}', NULL, ${c.sort})`);
  lines.push(topValues.join(',\n'));
  lines.push('ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order;');
  lines.push('');

  // Level 1: direct children of top-level
  const level1 = categories.filter(c => c.parent !== null && topLevel.some(t => t.slug === c.parent));
  lines.push('-- Level 1: subcategories');
  for (const cat of level1) {
    lines.push(
      `INSERT INTO categories (slug, parent_id, sort_order) VALUES ('${esc(cat.slug)}', (SELECT id FROM categories WHERE slug = '${esc(cat.parent!)}'), ${cat.sort}) ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order;`
    );
  }
  lines.push('');

  // Level 2: children of level-1 categories (e.g. liqueurs/fruits/amande)
  const level1Slugs = new Set(level1.map(c => c.slug));
  const level2 = categories.filter(c => c.parent !== null && level1Slugs.has(c.parent));
  if (level2.length > 0) {
    lines.push('-- Level 2: sub-subcategories (e.g. liqueurs/fruits/amande)');
    for (const cat of level2) {
      lines.push(
        `INSERT INTO categories (slug, parent_id, sort_order) VALUES ('${esc(cat.slug)}', (SELECT id FROM categories WHERE slug = '${esc(cat.parent!)}'), ${cat.sort}) ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order;`
      );
    }
    lines.push('');
  }

  // ------------------------------------------------------------------
  // 3. Category translations — FR
  // ------------------------------------------------------------------
  lines.push('-- =====================================================');
  lines.push('-- 3. Category translations — FR');
  lines.push('-- =====================================================');
  lines.push('');

  for (const cat of categories) {
    const name = frNames[cat.slug];
    if (!name) {
      console.warn(`WARNING: Missing FR name for slug '${cat.slug}'`);
      continue;
    }
    const mt = esc(frMetaTitle(name));
    const md = esc(frMetaDesc(name));
    lines.push(
      `INSERT INTO category_translations (category_id, locale, name, meta_title, meta_description) ` +
      `SELECT id, 'fr', '${esc(name)}', '${mt}', '${md}' ` +
      `FROM categories WHERE slug = '${esc(cat.slug)}' ` +
      `ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description;`
    );
  }
  lines.push('');

  // ------------------------------------------------------------------
  // 4. Category translations — EN-US
  // ------------------------------------------------------------------
  lines.push('-- =====================================================');
  lines.push('-- 4. Category translations — EN-US');
  lines.push('-- =====================================================');
  lines.push('');

  for (const cat of categories) {
    const name = enNames[cat.slug];
    if (!name) {
      console.warn(`WARNING: Missing EN name for slug '${cat.slug}'`);
      continue;
    }
    const mt = esc(enMetaTitle(name));
    const md = esc(enMetaDesc(name));
    lines.push(
      `INSERT INTO category_translations (category_id, locale, name, meta_title, meta_description) ` +
      `SELECT id, 'en-us', '${esc(name)}', '${mt}', '${md}' ` +
      `FROM categories WHERE slug = '${esc(cat.slug)}' ` +
      `ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description;`
    );
  }
  lines.push('');

  // ------------------------------------------------------------------
  // 5. Redirects
  // ------------------------------------------------------------------
  lines.push('-- =====================================================');
  lines.push('-- 5. 301 Redirects');
  lines.push('-- =====================================================');
  lines.push('');

  // 5a. Root URLs without locale prefix -> /fr/{path}
  lines.push('-- 5a. Root URLs (no locale prefix) -> /fr/...');
  for (const cat of categories) {
    const path = wpPath(cat);
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('${esc(path)}', '/fr${esc(path)}', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
  }
  lines.push('');

  // 5b. Abandoned categories: verres, carafes -> /fr/
  lines.push('-- 5b. Abandoned categories -> /fr/');
  const abandoned = ['verres', 'carafes'];
  for (const slug of abandoned) {
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${slug}/', '/fr/', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
    // Also with locale prefixes
    const allLocales = ['fr', 'en-us', 'en-gb', 'en-ca', 'en-au', 'en-za', 'es', 'es-me', 'pt', 'pt-br', 'it'];
    for (const locale of allLocales) {
      lines.push(
        `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${locale}/${slug}/', '/fr/', 301) ON CONFLICT (from_path) DO NOTHING;`
      );
    }
  }
  lines.push('');

  // 5c. Consolidated locales
  lines.push('-- 5c. Consolidated locale redirects');
  lines.push('-- en-ca, en-au, en-za -> en-us | es-me -> es | pt-br -> pt');
  const localeRedirects: Record<string, string> = {
    'en-ca': 'en-us',
    'en-au': 'en-us',
    'en-za': 'en-us',
    'en-gb': 'en-us',
    'es-me': 'es',
    'pt-br': 'pt',
  };

  for (const [oldLocale, newLocale] of Object.entries(localeRedirects)) {
    // Redirect the locale root
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${oldLocale}/', '/${newLocale}/', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
    // Redirect each category under the old locale
    for (const cat of categories) {
      const path = wpPath(cat);
      lines.push(
        `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${oldLocale}${esc(path)}', '/${newLocale}${esc(path)}', 301) ON CONFLICT (from_path) DO NOTHING;`
      );
    }
  }
  lines.push('');

  lines.push('COMMIT;');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(projectRoot, 'supabase', 'migration.sql');

const sql = generateMigrationSQL();
writeFileSync(outPath, sql, 'utf-8');

const lineCount = sql.split('\n').length;
const categoryCount = categories.length;
const redirectCount = (sql.match(/INSERT INTO redirects/g) || []).length;

console.log(`Migration SQL generated: ${outPath}`);
console.log(`  ${lineCount} lines`);
console.log(`  ${categoryCount} categories`);
console.log(`  ${categoryCount * 2} translations (FR + EN-US)`);
console.log(`  ${redirectCount} redirect statements`);
