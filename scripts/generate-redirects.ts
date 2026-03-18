#!/usr/bin/env npx tsx
/**
 * Generate 301 redirects for WordPress -> Next.js migration
 *
 * Outputs a standalone SQL file with only redirect INSERT statements.
 * Run: npx tsx scripts/generate-redirects.ts
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Category structure (slug + parent for URL path reconstruction)
// ---------------------------------------------------------------------------

interface Category {
  slug: string;
  parent: string | null;
}

const categories: Category[] = [
  // Top-level
  { slug: 'whisky', parent: null },
  { slug: 'vin-rouge', parent: null },
  { slug: 'vin-blanc', parent: null },
  { slug: 'vin-rose', parent: null },
  { slug: 'vin-jaune', parent: null },
  { slug: 'vin-orange', parent: null },
  { slug: 'champagne', parent: null },
  { slug: 'prosecco', parent: null },
  { slug: 'cremant', parent: null },
  { slug: 'cava', parent: null },
  { slug: 'blanquettes-de-limoux', parent: null },
  { slug: 'clairette-de-die', parent: null },
  { slug: 'mousseux', parent: null },
  { slug: 'rhum', parent: null },
  { slug: 'vodka', parent: null },
  { slug: 'cognac', parent: null },
  { slug: 'armagnac', parent: null },
  { slug: 'calvados', parent: null },
  { slug: 'brandy', parent: null },
  { slug: 'eau-de-vie', parent: null },
  { slug: 'grappa', parent: null },
  { slug: 'kirsch', parent: null },
  { slug: 'pisco', parent: null },
  { slug: 'cachaca', parent: null },
  { slug: 'lambig', parent: null },
  { slug: 'liqueurs', parent: null },
  { slug: 'gin', parent: null },
  { slug: 'tequila', parent: null },
  { slug: 'mezcal', parent: null },
  { slug: 'sake', parent: null },
  { slug: 'pastis', parent: null },
  { slug: 'vermouth', parent: null },
  { slug: 'porto', parent: null },
  { slug: 'pineau-des-charentes', parent: null },
  { slug: 'marsala', parent: null },
  { slug: 'arak', parent: null },
  { slug: 'raki', parent: null },
  { slug: 'ouzo', parent: null },
  { slug: 'schnaps', parent: null },
  { slug: 'aquavit', parent: null },
  { slug: 'sambuca', parent: null },
  { slug: 'amaretto', parent: null },
  { slug: 'triple-sec', parent: null },
  { slug: 'marasquin', parent: null },
  { slug: 'manzana', parent: null },
  { slug: 'chartreuse', parent: null },
  { slug: 'genepi', parent: null },
  { slug: 'genievre', parent: null },
  { slug: 'bitter', parent: null },
  { slug: 'digestif', parent: null },
  { slug: 'patxaran', parent: null },
  { slug: 'chouchen', parent: null },
  { slug: 'hydromel', parent: null },
  { slug: 'creme-cassis', parent: null },
  { slug: 'biere', parent: null },
  { slug: 'cidre', parent: null },
  { slug: 'vins-spiritueux-dessert', parent: null },
  // whisky subs
  { slug: 'bourbon', parent: 'whisky' },
  { slug: 'canadien', parent: 'whisky' },
  { slug: 'francais', parent: 'whisky' },
  { slug: 'indien', parent: 'whisky' },
  { slug: 'irlandais', parent: 'whisky' },
  { slug: 'japonais', parent: 'whisky' },
  { slug: 'scotch', parent: 'whisky' },
  // rhum subs
  { slug: 'agricole', parent: 'rhum' },
  { slug: 'ambre', parent: 'rhum' },
  { slug: 'arrange', parent: 'rhum' },
  { slug: 'blanc', parent: 'rhum' },
  { slug: 'cubain', parent: 'rhum' },
  { slug: 'martiniquais', parent: 'rhum' },
  { slug: 'vieux', parent: 'rhum' },
  // vodka subs
  { slug: 'francaise', parent: 'vodka' },
  { slug: 'pologne', parent: 'vodka' },
  { slug: 'russie', parent: 'vodka' },
  // champagne subs
  { slug: 'rose', parent: 'champagne' },
  // cremant subs
  { slug: 'alsace', parent: 'cremant' },
  { slug: 'bourgogne', parent: 'cremant' },
  { slug: 'jura', parent: 'cremant' },
  { slug: 'loire', parent: 'cremant' },
  { slug: 'cremant-rose', parent: 'cremant' },
  { slug: 'savoie', parent: 'cremant' },
  // mousseux subs
  { slug: 'saumur', parent: 'mousseux' },
  { slug: 'vouvray', parent: 'mousseux' },
  // liqueurs subs
  { slug: 'cafe', parent: 'liqueurs' },
  { slug: 'chocolat', parent: 'liqueurs' },
  { slug: 'herbes', parent: 'liqueurs' },
  { slug: 'limoncello', parent: 'liqueurs' },
  { slug: 'liqueur-whisky', parent: 'liqueurs' },
  { slug: 'fruits', parent: 'liqueurs' },
  { slug: 'plantes', parent: 'liqueurs' },
  // liqueurs/fruits subs
  { slug: 'amande', parent: 'fruits' },
  { slug: 'cassis', parent: 'fruits' },
  { slug: 'cerise', parent: 'fruits' },
  { slug: 'citron', parent: 'fruits' },
  { slug: 'framboise', parent: 'fruits' },
  { slug: 'litchi', parent: 'fruits' },
  { slug: 'noix-de-coco', parent: 'fruits' },
  { slug: 'noix', parent: 'fruits' },
  { slug: 'orange', parent: 'fruits' },
  { slug: 'peche', parent: 'fruits' },
  { slug: 'pomme', parent: 'fruits' },
  // liqueurs/plantes subs
  { slug: 'anis', parent: 'plantes' },
  { slug: 'menthe', parent: 'plantes' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function wpPath(cat: Category): string {
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
// Generate
// ---------------------------------------------------------------------------

function generateRedirectsSQL(): string {
  const lines: string[] = [];

  lines.push('-- Redirects for WordPress -> Next.js migration');
  lines.push(`-- Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  // 1. Root URLs without locale -> /fr/{path}
  lines.push('-- Root URLs (no locale prefix) -> /fr/...');
  let count = 0;
  for (const cat of categories) {
    const path = wpPath(cat);
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('${esc(path)}', '/fr${esc(path)}', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
    count++;
  }
  lines.push('');

  // 2. Abandoned categories
  lines.push('-- Abandoned categories -> /fr/');
  const abandoned = ['verres', 'carafes'];
  const allLocales = ['fr', 'en-us', 'en-gb', 'en-ca', 'en-au', 'en-za', 'es', 'es-me', 'pt', 'pt-br', 'it'];
  for (const slug of abandoned) {
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${slug}/', '/fr/', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
    count++;
    for (const locale of allLocales) {
      lines.push(
        `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${locale}/${slug}/', '/fr/', 301) ON CONFLICT (from_path) DO NOTHING;`
      );
      count++;
    }
  }
  lines.push('');

  // 3. Consolidated locale redirects
  lines.push('-- Consolidated locale redirects');
  const localeRedirects: Record<string, string> = {
    'en-ca': 'en-us',
    'en-au': 'en-us',
    'en-za': 'en-us',
    'en-gb': 'en-us',
    'es-me': 'es',
    'pt-br': 'pt',
  };

  for (const [oldLocale, newLocale] of Object.entries(localeRedirects)) {
    lines.push(
      `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${oldLocale}/', '/${newLocale}/', 301) ON CONFLICT (from_path) DO NOTHING;`
    );
    count++;
    for (const cat of categories) {
      const path = wpPath(cat);
      lines.push(
        `INSERT INTO redirects (from_path, to_path, status_code) VALUES ('/${oldLocale}${esc(path)}', '/${newLocale}${esc(path)}', 301) ON CONFLICT (from_path) DO NOTHING;`
      );
      count++;
    }
  }
  lines.push('');

  lines.push('COMMIT;');
  lines.push('');

  console.log(`  ${count} redirect statements generated`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(projectRoot, 'supabase', 'redirects.sql');

const sql = generateRedirectsSQL();
writeFileSync(outPath, sql, 'utf-8');

console.log(`Redirects SQL generated: ${outPath}`);
console.log(`  ${sql.split('\n').length} lines`);
