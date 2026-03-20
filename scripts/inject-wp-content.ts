/**
 * inject-wp-content.ts
 *
 * Reads docs/wp-content-full.json (WordPress extraction) and injects
 * all drinks, restaurants, wine_list_entries, and category translations
 * into the Supabase database.
 *
 * Strategy: collect everything in memory first, then batch-insert to
 * minimize API calls and avoid Cloudflare rate limits.
 *
 * Run:
 *   NEXT_PUBLIC_SUPABASE_URL=https://tmwxushartfhwgawixqz.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   npx tsx scripts/inject-wp-content.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WPPage {
  id: number
  title: string
  slug: string
  locale: string
  url: string
  content_html: string
  content_text: string
  tables: Array<{
    headers: string[]
    rows: string[][]
  }>
  meta_title: string
  meta_description: string
  content_length: number
  table_row_count: number
}

interface ParsedRestaurant {
  name: string
  stars: number
  country: string
}

// ---------------------------------------------------------------------------
// Locale mapping
// ---------------------------------------------------------------------------

const LOCALE_MAP: Record<string, string> = {
  fr: 'fr',
  'en-us': 'en-us',
  'en-gb': 'en-gb',
  'en-ca': 'en-us',
  'en-au': 'en-us',
  'en-za': 'en-us',
  es: 'es',
  'es-me': 'es',
  pt: 'pt',
  'pt-br': 'pt',
  it: 'it',
}

const LOCALE_PRIORITY: Record<string, number> = {
  fr: 10, 'en-us': 10, 'en-gb': 10, es: 10, pt: 10, it: 10,
  'en-ca': 5, 'en-au': 4, 'en-za': 3, 'es-me': 5, 'pt-br': 5,
}

// ---------------------------------------------------------------------------
// WP slug → category slug mapping
// ---------------------------------------------------------------------------

const WP_SLUG_TO_CATEGORY: Record<string, string> = {
  'champagne-2': 'champagne', 'whisky-2': 'whisky', 'meilleures-vodkas': 'vodka',
  'meilleurs-rhums': 'rhum', 'vin-rouge': 'vin-rouge', 'meilleurs-vins-roses': 'vin-rose',
  'meilleurs-vins-blancs': 'vin-blanc', cognac: 'cognac', bourbon: 'bourbon', gin: 'gin',
  tequila: 'tequila', sake: 'sake', 'meilleurs-armagnacs': 'armagnac',
  'best-brandy': 'brandy', 'meilleurs-calvados': 'calvados',
  'meilleur-scotch-whisky-ecossais': 'scotch-whisky', 'meilleurs-portos': 'porto',
  prosecco: 'prosecco', 'meilleures-liqueurs': 'liqueur', vermouth: 'vermouth',
  pastis: 'pastis', mezcal: 'mezcal', biere: 'biere', cidre: 'cidre', cremant: 'cremant',
  chartreuse: 'chartreuse', cachaca: 'cachaca', rose: 'champagne-rose',
  irlandais: 'whisky-irlandais', japonais: 'whisky-japonais', canadien: 'whisky-canadien',
  indien: 'whisky-indien', 'whisky-francais': 'whisky-francais',
  martiniquais: 'rhum-martiniquais', 'meilleurs-rhums-arranges': 'rhum-arrange',
  ambre: 'rhum-ambre', 'rhum-blanc': 'rhum-blanc', 'meilleur-rhum-vieux': 'rhum-vieux',
  'rhum-agricole': 'rhum-agricole', 'meilleur-rhum-cubain': 'rhum-cubain',
  cava: 'cava', 'vin-jaune': 'vin-jaune', grappa: 'grappa', mousseux: 'mousseux',
  'meilleure-vodka-francaise': 'vodka-francaise', pologne: 'vodka-polonaise',
  'vodka-russie': 'vodka-russe',
  // EN slugs
  'vodka-2': 'vodka', 'gin-2': 'gin', 'vodka-polish': 'vodka-polonaise',
  'whisky-3': 'whisky', 'champagne-3': 'champagne', 'rum-2': 'rhum',
  'cognac-2': 'cognac', 'bourbon-2': 'bourbon', 'tequila-2': 'tequila',
  'sake-2': 'sake', 'brandy-2': 'brandy', 'armagnac-2': 'armagnac',
  'calvados-2': 'calvados', 'scotch-whisky-2': 'scotch-whisky', 'port-wine': 'porto',
  'prosecco-2': 'prosecco', 'vermouth-2': 'vermouth', 'mezcal-2': 'mezcal',
  'beer-2': 'biere', 'cider-2': 'cidre', 'cremant-2': 'cremant',
  'chartreuse-2': 'chartreuse', 'cachaca-2': 'cachaca', 'rose-champagne': 'champagne-rose',
  'irish-whiskey': 'whisky-irlandais', 'japanese-whisky': 'whisky-japonais',
  'canadian-whisky': 'whisky-canadien', 'indian-whisky': 'whisky-indien',
  'french-whisky': 'whisky-francais',
  // ES slugs
  'whisky-8': 'whisky', 'champan-2': 'champagne', 'vodka-8': 'vodka',
  ron: 'rhum', 'cachaca-9': 'cachaca', 'prosecco-3': 'prosecco',
  'brandy-9': 'brandy', 'mezcal-3': 'mezcal', 'tequila-4': 'tequila',
  // Other locale variants (catch-all numeric suffixes)
  'whisky-4': 'whisky', 'whisky-5': 'whisky', 'whisky-6': 'whisky', 'whisky-7': 'whisky',
  'champagne-4': 'champagne', 'champagne-5': 'champagne', 'champagne-6': 'champagne', 'champagne-7': 'champagne',
  'vodka-3': 'vodka', 'vodka-4': 'vodka', 'vodka-5': 'vodka', 'vodka-6': 'vodka', 'vodka-7': 'vodka',
  'gin-3': 'gin', 'gin-4': 'gin', 'gin-5': 'gin', 'gin-6': 'gin',
  'rum-3': 'rhum', 'rum-4': 'rhum', 'rum-5': 'rhum', 'rum-6': 'rhum',
  'cognac-3': 'cognac', 'cognac-4': 'cognac', 'cognac-5': 'cognac', 'cognac-6': 'cognac',
  'bourbon-3': 'bourbon', 'tequila-3': 'tequila', 'sake-3': 'sake',
  'champagne-rose': 'champagne-rose',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/['']/g, '-').replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '').substring(0, 395)
}

function parseOrigin(origin: string | undefined): { country: string | null; region: string | null } {
  if (!origin || origin === '-' || origin === '') return { country: null, region: null }
  const parts = origin.split(/\s*-\s*/)
  return {
    country: parts[0]?.trim() || null,
    region: parts.length > 1 ? parts.slice(1).join(' - ').trim() : null,
  }
}

function parseVintageAge(val: string | undefined): { vintage: number | null; ageSuffix: string | null } {
  if (!val || val === '-' || val === '' || /non mill/i.test(val) || /no\b/i.test(val) || val === 'Non')
    return { vintage: null, ageSuffix: null }
  const yearMatch = val.match(/^(\d{4})$/)
  if (yearMatch) return { vintage: parseInt(yearMatch[1]), ageSuffix: null }
  const ageMatch = val.match(/(\d+)\s*(ans|years?|años|anni|anos)/i)
  if (ageMatch) return { vintage: null, ageSuffix: `${ageMatch[1]} ans` }
  const numMatch = val.match(/^(\d+)$/)
  if (numMatch) {
    const n = parseInt(numMatch[1])
    if (n >= 1800 && n <= 2100) return { vintage: n, ageSuffix: null }
    return { vintage: null, ageSuffix: `${n} ans` }
  }
  return { vintage: null, ageSuffix: null }
}

function parseRestaurants(cell: string | undefined): ParsedRestaurant[] {
  if (!cell || cell === '-' || cell === '') return []
  const results: ParsedRestaurant[] = []
  // Split on newlines, or on 2+ spaces before a star (same-line separator)
  const lines = cell.split(/\n|\s{2,}(?=⭐)|,\s*(?=⭐)|,\s*(?=★)/).filter(l => l.trim())
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let stars = 0, rest = trimmed
    const emojiStarMatch = rest.match(/^(⭐+)/)
    if (emojiStarMatch) {
      stars = emojiStarMatch[1].length; rest = rest.substring(emojiStarMatch[0].length).trim()
    } else {
      const textStarMatch = rest.match(/^(★+)/)
      if (textStarMatch) {
        stars = textStarMatch[1].length; rest = rest.substring(textStarMatch[0].length).trim()
      } else {
        const numStarMatch = rest.match(/^(\d)\s*(?:étoiles?|stars?|estrellas?)/)
        if (numStarMatch) {
          stars = parseInt(numStarMatch[1]); rest = rest.substring(numStarMatch[0].length).trim()
        }
      }
    }
    if (stars === 0) continue
    rest = rest.replace(/^[\s\-–—]+/, '').trim()
    // Use the LAST " - " or " – " as the name/country separator
    const lastSepIdx = rest.lastIndexOf(' - ')
    const lastEmIdx = rest.lastIndexOf(' – ')
    const sepIdx = Math.max(lastSepIdx, lastEmIdx)
    if (sepIdx > 0) {
      const name = rest.substring(0, sepIdx).trim()
      const country = rest.substring(sepIdx + 3).trim()
      if (name) {
        results.push({ name: name.replace(/^Restaurant\s+/i, '').trim() || name, stars: Math.min(stars, 3), country })
      }
    } else if (rest.trim()) {
      results.push({ name: rest.replace(/^Restaurant\s+/i, '').trim(), stars: Math.min(stars, 3), country: '' })
    }
  }
  return results
}

function findCol(headers: string[], pattern: RegExp): number {
  // For restaurant, search from the end (last match)
  if (pattern.source.includes('restaurant')) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (pattern.test(headers[i])) return i
    }
    return -1
  }
  return headers.findIndex(h => pattern.test(h))
}

function resolveCategory(wpSlug: string, catSlugs: Set<string>): string | null {
  if (WP_SLUG_TO_CATEGORY[wpSlug]) return WP_SLUG_TO_CATEGORY[wpSlug]
  if (catSlugs.has(wpSlug)) return wpSlug
  const stripped = wpSlug.replace(/-\d+$/, '')
  if (catSlugs.has(stripped)) return stripped
  if (WP_SLUG_TO_CATEGORY[stripped]) return WP_SLUG_TO_CATEGORY[stripped]
  return null
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function batchUpsertWithRetry(
  supabase: ReturnType<typeof createClient>,
  table: string,
  rows: Record<string, unknown>[],
  conflictCols: string,
  batchSize = 50,
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0
  const errors: string[] = []
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    let retries = 3
    while (retries > 0) {
      const { error } = await supabase.from(table).upsert(batch, { onConflict: conflictCols })
      if (!error) {
        inserted += batch.length
        break
      }
      if (error.message.includes('502') || error.message.includes('rate') || error.code === '429') {
        retries--
        console.log(`  Rate limited on ${table} batch ${i}, retrying in 2s... (${retries} left)`)
        await sleep(2000)
      } else {
        errors.push(`${table} batch ${i}: ${error.message}`)
        break
      }
    }
    // Small pause between batches to avoid rate limits
    if (i + batchSize < rows.length) await sleep(200)
  }
  return { inserted, errors }
}

async function batchUpsertWithSelect(
  supabase: ReturnType<typeof createClient>,
  table: string,
  rows: Record<string, unknown>[],
  conflictCols: string,
  batchSize = 50,
): Promise<{ data: Array<{ id: number; slug: string }>; errors: string[] }> {
  const allData: Array<{ id: number; slug: string }> = []
  const errors: string[] = []
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    let retries = 3
    while (retries > 0) {
      const { data, error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: conflictCols })
        .select('id, slug')
      if (!error && data) {
        allData.push(...data)
        break
      }
      if (error && (error.message.includes('502') || error.message.includes('rate') || error.code === '429')) {
        retries--
        console.log(`  Rate limited on ${table} batch ${i}, retrying in 2s... (${retries} left)`)
        await sleep(2000)
      } else {
        errors.push(`${table} batch ${i}: ${error?.message || 'unknown error'}`)
        break
      }
    }
    if (i + batchSize < rows.length) await sleep(200)
  }
  return { data: allData, errors }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

  const supabase = createClient(url, key)

  // 1. Load JSON
  const jsonPath = resolve(__dirname, '..', 'docs', 'wp-content-full.json')
  console.log(`Loading ${jsonPath}...`)
  const wpData = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const pages: WPPage[] = Object.values(wpData.pages)
  console.log(`Loaded ${pages.length} pages with ${wpData.stats.total_table_rows} table rows\n`)

  // 2. Get existing categories
  const { data: existingCats, error: catErr } = await supabase.from('categories').select('id, slug')
  if (catErr) { console.error('Failed to fetch categories:', catErr.message); process.exit(1) }
  const catMap = new Map<string, number>(existingCats!.map((c: any) => [c.slug, c.id]))
  const catSlugs = new Set(catMap.keys())
  console.log(`Found ${catMap.size} existing categories: ${[...catMap.keys()].join(', ')}\n`)

  // 3. Collect all needed category slugs and create missing ones
  const neededSlugs = new Set<string>()
  for (const page of pages) {
    const catSlug = resolveCategory(page.slug, catSlugs)
    if (catSlug && !catMap.has(catSlug)) neededSlugs.add(catSlug)
  }

  if (neededSlugs.size > 0) {
    console.log(`Creating ${neededSlugs.size} missing categories: ${[...neededSlugs].join(', ')}`)
    let order = catMap.size + 1
    const catRows = [...neededSlugs].map(slug => {
      let parentId: number | null = null
      if (slug.startsWith('whisky-') && catMap.has('whisky')) parentId = catMap.get('whisky')!
      else if (slug.startsWith('rhum-') && catMap.has('rhum')) parentId = catMap.get('rhum')!
      else if (slug.startsWith('vodka-') && catMap.has('vodka')) parentId = catMap.get('vodka')!
      else if (slug.startsWith('champagne-') && catMap.has('champagne')) parentId = catMap.get('champagne')!
      return { slug, parent_id: parentId, sort_order: order++ }
    })

    for (const row of catRows) {
      const { data, error } = await supabase.from('categories')
        .upsert(row, { onConflict: 'slug' }).select('id, slug').single()
      if (error) { console.error(`  Failed: ${row.slug}:`, error.message) }
      else if (data) { catMap.set(data.slug, data.id); catSlugs.add(data.slug) }
    }
    console.log(`Now have ${catMap.size} categories\n`)
  }

  // 4. PHASE 1: Collect all data in memory
  console.log('Phase 1: Parsing all pages...')

  // Deduplicated collections
  const allDrinks = new Map<string, { name: string; category_id: number; vintage: number | null; country: string | null; region: string | null; appellation: string | null; slug: string }>()
  const allRestaurants = new Map<string, { name: string; slug: string; country: string | null; michelin_stars: number }>()
  // wine_list_entries: keyed by "drinkSlug|restSlug" to deduplicate
  const allWLE = new Map<string, { drinkSlug: string; restSlug: string }>()
  // category translations: keyed by "categoryId:locale"
  const allTranslations = new Map<string, { category_id: number; locale: string; name: string; description: string; meta_title: string | null; meta_description: string | null }>()

  const sortedPages = [...pages].sort(
    (a, b) => (LOCALE_PRIORITY[b.locale] || 0) - (LOCALE_PRIORITY[a.locale] || 0),
  )

  let pagesProcessed = 0
  for (const page of sortedPages) {
    const targetLocale = LOCALE_MAP[page.locale]
    if (!targetLocale) continue
    const catSlug = resolveCategory(page.slug, catSlugs)
    const categoryId = catSlug ? catMap.get(catSlug) : undefined

    // Category translation
    if (categoryId && page.content_text) {
      const key = `${categoryId}:${targetLocale}`
      if (!allTranslations.has(key)) {
        allTranslations.set(key, {
          category_id: categoryId,
          locale: targetLocale,
          name: page.title,
          description: page.content_text,
          meta_title: page.meta_title || null,
          meta_description: page.meta_description || null,
        })
      }
    }

    // Product tables
    if (!page.tables?.length || !categoryId) continue

    for (const table of page.tables) {
      const { headers, rows } = table
      if (!rows.length) continue
      // Skip accessory tables
      if (headers[0] && /verre|carafe|flûte|coupe|pinte|Référence du verre|Référence de la|Référence de la carafe/i.test(headers[0])) continue

      const restCol = findCol(headers, /restaurant|restaurante/i)
      const originCol = findCol(headers, /origine|origin|pays|country|r[eé]gion/i)
      const ageCol = findCol(headers, /[âa]ge|mill[eé]sime|vintage/i)
      const typeCol = findCol(headers, /type|cat[eé]gorie|category|c[eé]page/i)

      for (const row of rows) {
        const rawName = (row[0] || '').trim()
        if (!rawName || rawName === '-') continue

        const origin = originCol >= 0 ? parseOrigin(row[originCol]) : { country: null, region: null }
        const { vintage, ageSuffix } = ageCol >= 0 ? parseVintageAge(row[ageCol]) : { vintage: null, ageSuffix: null }

        let drinkName = rawName
        if (ageSuffix && !drinkName.includes(ageSuffix)) drinkName = `${rawName} ${ageSuffix}`

        const appellation = typeCol >= 0 ? (row[typeCol]?.trim() || null) : null
        const drinkSlug = slugify(drinkName + (vintage ? `-${vintage}` : ''))

        if (!allDrinks.has(drinkSlug)) {
          allDrinks.set(drinkSlug, {
            name: drinkName, category_id: categoryId, vintage,
            country: origin.country, region: origin.region,
            appellation: appellation && appellation !== '-' ? appellation : null,
            slug: drinkSlug,
          })
        }

        // Parse restaurants
        const restaurants = restCol >= 0 ? parseRestaurants(row[restCol]) : []
        for (const rest of restaurants) {
          const restSlug = slugify(rest.name)
          if (!restSlug) continue
          if (!allRestaurants.has(restSlug)) {
            allRestaurants.set(restSlug, {
              name: rest.name, slug: restSlug, country: rest.country || null,
              michelin_stars: rest.stars,
            })
          }
          const wleKey = `${drinkSlug}|${restSlug}`
          if (!allWLE.has(wleKey)) {
            allWLE.set(wleKey, { drinkSlug, restSlug })
          }
        }
      }
    }
    pagesProcessed++
  }

  console.log(`Parsed: ${allDrinks.size} unique drinks, ${allRestaurants.size} unique restaurants, ${allWLE.size} unique wine list entries, ${allTranslations.size} translations\n`)

  // 5. PHASE 2: Batch-insert everything

  // 5a. Restaurants
  console.log(`Phase 2a: Upserting ${allRestaurants.size} restaurants...`)
  const restRows = [...allRestaurants.values()]
  const { data: restResults, errors: restErrors } = await batchUpsertWithSelect(supabase, 'restaurants', restRows, 'slug', 50)
  const restIdMap = new Map<string, number>()
  for (const r of restResults) restIdMap.set(r.slug, r.id)
  // Also fetch any that weren't returned (already existed)
  if (restIdMap.size < allRestaurants.size) {
    const { data: allRest } = await supabase.from('restaurants').select('id, slug')
    if (allRest) for (const r of allRest) restIdMap.set(r.slug, r.id)
  }
  console.log(`  Got IDs for ${restIdMap.size} restaurants (${restErrors.length} errors)`)

  // 5b. Drinks
  console.log(`Phase 2b: Upserting ${allDrinks.size} drinks...`)
  const drinkRows = [...allDrinks.values()]
  const { data: drinkResults, errors: drinkErrors } = await batchUpsertWithSelect(supabase, 'drinks', drinkRows, 'slug', 50)
  const drinkIdMap = new Map<string, number>()
  for (const d of drinkResults) drinkIdMap.set(d.slug, d.id)
  // Fetch all if some were missed
  if (drinkIdMap.size < allDrinks.size) {
    // Fetch in pages of 1000
    let offset = 0
    while (true) {
      const { data: batch } = await supabase.from('drinks').select('id, slug').range(offset, offset + 999)
      if (!batch || batch.length === 0) break
      for (const d of batch) drinkIdMap.set(d.slug, d.id)
      if (batch.length < 1000) break
      offset += 1000
    }
  }
  console.log(`  Got IDs for ${drinkIdMap.size} drinks (${drinkErrors.length} errors)`)

  // 5c. Wine list entries
  console.log(`Phase 2c: Upserting ${allWLE.size} wine list entries...`)
  const wleRows: Record<string, unknown>[] = []
  let skippedWLE = 0
  for (const { drinkSlug, restSlug } of allWLE.values()) {
    const drinkId = drinkIdMap.get(drinkSlug)
    const restId = restIdMap.get(restSlug)
    if (!drinkId || !restId) { skippedWLE++; continue }
    wleRows.push({ restaurant_id: restId, drink_id: drinkId, year_on_list: 2024 })
  }
  if (skippedWLE > 0) console.log(`  Skipped ${skippedWLE} WLEs due to missing drink/restaurant IDs`)
  const { inserted: wleInserted, errors: wleErrors } = await batchUpsertWithRetry(supabase, 'wine_list_entries', wleRows, 'restaurant_id,drink_id,year_on_list', 50)
  console.log(`  Upserted ${wleInserted} wine list entries (${wleErrors.length} errors)`)

  // 5d. Category translations
  console.log(`Phase 2d: Upserting ${allTranslations.size} category translations...`)
  const transRows = [...allTranslations.values()]
  const { inserted: transInserted, errors: transErrors } = await batchUpsertWithRetry(supabase, 'category_translations', transRows, 'category_id,locale', 10)
  console.log(`  Upserted ${transInserted} translations (${transErrors.length} errors)`)

  // 6. Report
  const allErrors = [...restErrors, ...drinkErrors, ...wleErrors, ...transErrors]
  console.log('\n' + '='.repeat(60))
  console.log('INJECTION COMPLETE')
  console.log('='.repeat(60))
  console.log(`Drinks upserted:         ${allDrinks.size} unique (${drinkIdMap.size} with IDs)`)
  console.log(`Restaurants upserted:     ${allRestaurants.size} unique (${restIdMap.size} with IDs)`)
  console.log(`Wine list entries:        ${wleInserted} upserted`)
  console.log(`Translations updated:     ${transInserted} upserted`)

  if (allErrors.length > 0) {
    console.log(`\nErrors (${allErrors.length}):`)
    allErrors.slice(0, 20).forEach(e => console.log(`  - ${e}`))
    if (allErrors.length > 20) console.log(`  ... and ${allErrors.length - 20} more`)
  }

  console.log('\nDone.')
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1) })
