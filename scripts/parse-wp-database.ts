/**
 * parse-wp-database.ts
 *
 * Parses WordPress database SQL exports (posts_raw.txt, terms_raw.txt, yoast_raw.txt)
 * and extracts all page content into a structured JSON file.
 *
 * Usage: npx tsx scripts/parse-wp-database.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const WP_DIR = 'C:/Users/gwend/Desktop/Sauvegardes/bestwine'
const OUTPUT = resolve(__dirname, '../docs/wp-content-full.json')

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a SQL VALUES clause into individual records, handling nested quotes */
function parseSqlRecords(sql: string): string[][] {
  // Find VALUES keyword
  const vIdx = sql.indexOf('VALUES (')
  if (vIdx === -1) return []

  let pos = vIdx + 7 // position of first '('
  const records: string[][] = []

  while (pos < sql.length) {
    if (sql[pos] !== '(') { pos++; continue }

    // Parse one record (id,field,field,...)
    pos++ // skip '('
    const fields: string[] = []
    let current = ''
    let inQuote = false

    while (pos < sql.length) {
      const ch = sql[pos]

      if (inQuote) {
        if (ch === '\\' && pos + 1 < sql.length) {
          // Escaped character
          current += sql[pos + 1]
          pos += 2
          continue
        }
        if (ch === "'") {
          if (pos + 1 < sql.length && sql[pos + 1] === "'") {
            // Doubled single quote = literal quote
            current += "'"
            pos += 2
            continue
          }
          // End of quoted string
          inQuote = false
          pos++
          continue
        }
        current += ch
        pos++
      } else {
        if (ch === "'") {
          inQuote = true
          pos++
          continue
        }
        if (ch === ',' || ch === ')') {
          fields.push(current.trim())
          current = ''
          if (ch === ')') {
            pos++
            break
          }
          pos++
          continue
        }
        current += ch
        pos++
      }
    }

    records.push(fields)
  }

  return records
}

/** Strip Gutenberg block comments, return clean HTML */
function stripBlockComments(html: string): string {
  return html.replace(/<!--\s*\/?wp:[^\s]+(?:\s+\{[^}]*\})?\s*-->/g, '')
}

/** Extract plain text from HTML */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&acirc;/g, 'â')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Extract tables from HTML content */
function extractTables(html: string): Array<{ headers: string[], rows: string[][] }> {
  const tables: Array<{ headers: string[], rows: string[][] }> = []
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi
  let tm

  while ((tm = tableRegex.exec(html)) !== null) {
    const tableHtml = tm[1]
    const headers: string[] = []
    const rows: string[][] = []

    // Extract header row
    const theadMatch = tableHtml.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
    if (theadMatch) {
      const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi
      let thm
      while ((thm = thRegex.exec(theadMatch[1])) !== null) {
        headers.push(htmlToText(thm[1]).trim())
      }
    }

    // Extract body rows
    const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
    const bodyHtml = tbodyMatch ? tbodyMatch[1] : tableHtml
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let trm
    let isFirst = true

    while ((trm = trRegex.exec(bodyHtml)) !== null) {
      // Skip header row in tbody if we already got headers from thead
      if (isFirst && headers.length === 0) {
        // First row might be headers if no thead
        const thCheck = /<th[^>]*>/i.test(trm[1])
        if (thCheck) {
          const thRegex2 = /<th[^>]*>([\s\S]*?)<\/th>/gi
          let thm2
          while ((thm2 = thRegex2.exec(trm[1])) !== null) {
            headers.push(htmlToText(thm2[1]).trim())
          }
          isFirst = false
          continue
        }
      }
      isFirst = false

      const row: string[] = []
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
      let tdm
      while ((tdm = tdRegex.exec(trm[1])) !== null) {
        row.push(htmlToText(tdm[1]).trim())
      }
      if (row.length > 0) {
        rows.push(row)
      }
    }

    if (rows.length > 0 || headers.length > 0) {
      tables.push({ headers, rows })
    }
  }

  return tables
}

/** Detect locale from URL or slug */
function detectLocale(url: string): string {
  const localeMatch = url.match(/bestwine\.online\/([a-z]{2}(?:-[a-z]{2,3})?)\//)
  if (localeMatch) return localeMatch[1]
  return 'fr' // default
}

// ─── Step 1: Parse terms ────────────────────────────────────────────────────

console.log('Step 1: Parsing terms_raw.txt...')
const termsRaw = readFileSync(resolve(WP_DIR, 'terms_raw.txt'), 'utf8')

// Extract terms (id, name, slug, term_group)
const termsSection = termsRaw.substring(termsRaw.lastIndexOf('`mod516_terms` VALUES'))
const termsData: Record<number, { name: string, slug: string }> = {}
{
  const re = /\((\d+),'((?:[^'\\]|\\.|'')*?)','((?:[^'\\]|\\.|'')*?)',(\d+)\)/g
  let m
  while ((m = re.exec(termsSection)) !== null) {
    termsData[+m[1]] = {
      name: m[2].replace(/''/g, "'"),
      slug: m[3].replace(/''/g, "'")
    }
  }
}
console.log(`  Found ${Object.keys(termsData).length} terms`)

// Extract term_taxonomy (term_taxonomy_id, term_id, taxonomy, description, parent, count)
const taxSection = termsRaw.substring(
  termsRaw.indexOf('`mod516_term_taxonomy` VALUES'),
  termsRaw.indexOf('INSERT INTO `mod516_termmeta`') > 0
    ? termsRaw.indexOf('INSERT INTO `mod516_termmeta`')
    : undefined
)
const taxonomies: Array<{ttid: number, termId: number, taxonomy: string, parent: number}> = []
{
  const re = /\((\d+),(\d+),'([^']*)',/g
  let m
  while ((m = re.exec(taxSection)) !== null) {
    // Find the parent field - it's after description (which may be empty or contain text)
    const start = m.index + m[0].length
    // Description is in quotes, then parent number, then count
    let pos = start
    // Skip description field
    if (taxSection[pos] === "'") {
      pos++ // skip opening quote
      while (pos < taxSection.length) {
        if (taxSection[pos] === '\\') { pos += 2; continue }
        if (taxSection[pos] === "'" && taxSection[pos+1] === "'") { pos += 2; continue }
        if (taxSection[pos] === "'") { pos++; break }
        pos++
      }
    }
    // Now we should be at ,parent,count)
    const rest = taxSection.substring(pos, pos + 30)
    const nums = rest.match(/,(\d+),(\d+)\)/)
    if (nums) {
      taxonomies.push({
        ttid: +m[1],
        termId: +m[2],
        taxonomy: m[3],
        parent: +nums[1]
      })
    }
  }
}
console.log(`  Found ${taxonomies.length} taxonomy entries`)

// Extract term_relationships (object_id, term_taxonomy_id, term_order)
const relSection = termsRaw.substring(
  termsRaw.indexOf('`mod516_term_relationships` VALUES'),
  termsRaw.indexOf('INSERT INTO `mod516_term_taxonomy`')
)
const termRelationships: Array<{objectId: number, ttid: number}> = []
{
  const re = /\((\d+),(\d+),(\d+)\)/g
  let m
  while ((m = re.exec(relSection)) !== null) {
    termRelationships.push({ objectId: +m[1], ttid: +m[2] })
  }
}
console.log(`  Found ${termRelationships.length} term relationships`)


// ─── Step 2: Parse Yoast SEO metadata ──────────────────────────────────────

console.log('\nStep 2: Parsing yoast_raw.txt...')
const yoastRaw = readFileSync(resolve(WP_DIR, 'yoast_raw.txt'), 'utf8')

interface YoastMeta {
  url: string
  objectId: number | null
  title: string
  description: string
  breadcrumbTitle: string
}

const yoastByObjectId: Record<number, YoastMeta> = {}
const yoastByUrl: Record<string, YoastMeta> = {}

{
  // Parse yoast records - find page entries
  const vIdx = yoastRaw.indexOf('VALUES (')
  if (vIdx === -1) throw new Error('No VALUES in yoast')

  let pos = vIdx + 7

  while (pos < yoastRaw.length) {
    if (yoastRaw[pos] !== '(') { pos++; continue }

    // Parse one record
    pos++ // skip (
    const fields: string[] = []
    let current = ''
    let inQuote = false
    let depth = 0

    while (pos < yoastRaw.length) {
      const ch = yoastRaw[pos]

      if (inQuote) {
        if (ch === '\\' && pos + 1 < yoastRaw.length) {
          current += ch + yoastRaw[pos + 1]
          pos += 2
          continue
        }
        if (ch === "'") {
          if (pos + 1 < yoastRaw.length && yoastRaw[pos + 1] === "'") {
            current += "'"
            pos += 2
            continue
          }
          inQuote = false
          pos++
          continue
        }
        current += ch
        pos++
      } else {
        if (ch === "'") {
          inQuote = true
          pos++
          continue
        }
        if (ch === ',' || ch === ')') {
          fields.push(current.trim())
          current = ''
          if (ch === ')') {
            pos++
            break
          }
          pos++
          continue
        }
        current += ch
        pos++
      }
    }

    // fields[0]=id, [1]=permalink, [3]=object_id, [4]=object_type, [5]=object_sub_type
    // [8]=title, [9]=description, [10]=breadcrumb_title
    if (fields.length > 10 && fields[4] === 'post' && fields[5] === 'page') {
      const meta: YoastMeta = {
        url: fields[1],
        objectId: fields[3] !== 'NULL' ? parseInt(fields[3]) : null,
        title: fields[8] !== 'NULL' ? fields[8] : '',
        description: fields[9] !== 'NULL' ? fields[9] : '',
        breadcrumbTitle: fields[10] !== 'NULL' ? fields[10] : ''
      }
      if (meta.objectId) {
        yoastByObjectId[meta.objectId] = meta
      }
      yoastByUrl[meta.url] = meta
    }
  }
}
console.log(`  Found ${Object.keys(yoastByObjectId).length} page SEO entries`)


// ─── Step 3: Parse posts_raw.txt ────────────────────────────────────────────

console.log('\nStep 3: Parsing posts_raw.txt (160MB)...')
console.log('  Reading file into memory...')
const postsRaw = readFileSync(resolve(WP_DIR, 'posts_raw.txt'), 'utf8')
console.log(`  File loaded: ${(postsRaw.length / 1024 / 1024).toFixed(1)} MB`)

// WordPress posts table columns (mod516_posts):
// 0: ID, 1: post_author, 2: post_date, 3: post_date_gmt,
// 4: post_content, 5: post_title, 6: post_excerpt, 7: post_status,
// 8: comment_status, 9: ping_status, 10: post_password, 11: post_name (slug),
// 12: to_ping, 13: pinged, 14: post_modified, 15: post_modified_gmt,
// 16: post_content_filtered, 17: post_parent, 18: guid,
// 19: menu_order, 20: post_type, 21: post_mime_type, 22: comment_count

interface WpPost {
  id: number
  content: string
  title: string
  excerpt: string
  status: string
  slug: string
  postParent: number
  postType: string
  guid: string
}

const posts: WpPost[] = []

// Parse records using state machine
console.log('  Parsing SQL records...')
const valuesIdx = postsRaw.indexOf('VALUES (')
if (valuesIdx === -1) throw new Error('No VALUES in posts')

let pos = valuesIdx + 7
let recordCount = 0
let pageCount = 0

while (pos < postsRaw.length) {
  if (postsRaw[pos] !== '(') { pos++; continue }

  pos++ // skip (
  const fields: string[] = []
  let current = ''
  let inQuote = false

  while (pos < postsRaw.length) {
    const ch = postsRaw[pos]

    if (inQuote) {
      if (ch === '\\' && pos + 1 < postsRaw.length) {
        current += postsRaw[pos + 1]
        pos += 2
        continue
      }
      if (ch === "'") {
        if (pos + 1 < postsRaw.length && postsRaw[pos + 1] === "'") {
          current += "'"
          pos += 2
          continue
        }
        inQuote = false
        pos++
        continue
      }
      current += ch
      pos++
    } else {
      if (ch === "'") {
        inQuote = true
        pos++
        continue
      }
      if (ch === ',' || ch === ')') {
        fields.push(current.trim())
        current = ''
        if (ch === ')') {
          pos++
          break
        }
        pos++
        continue
      }
      current += ch
      pos++
    }
  }

  recordCount++

  // Filter: only published pages (and some drafts that have content)
  // fields: 0=ID, 4=content, 5=title, 6=excerpt, 7=status, 11=slug, 17=parent, 18=guid, 20=type
  if (fields.length >= 21) {
    const postType = fields[20]
    const status = fields[7]
    const content = fields[4]

    if (postType === 'page' && (status === 'publish' || status === 'draft') && content.length > 10) {
      posts.push({
        id: parseInt(fields[0]),
        content: fields[4],
        title: fields[5],
        excerpt: fields[6],
        status: fields[7],
        slug: fields[11],
        postParent: parseInt(fields[17]) || 0,
        postType: fields[20],
        guid: fields[18]
      })
      pageCount++
    }
  }

  if (recordCount % 500 === 0) {
    process.stdout.write(`\r  Records parsed: ${recordCount}, pages found: ${pageCount}`)
  }
}

console.log(`\n  Total records: ${recordCount}`)
console.log(`  Pages with content: ${posts.length}`)


// ─── Step 4: Build output ───────────────────────────────────────────────────

console.log('\nStep 4: Building structured output...')

interface PageOutput {
  id: number
  title: string
  slug: string
  locale: string
  url: string
  status: string
  parent_id: number
  content_html: string
  content_text: string
  tables: Array<{ headers: string[], rows: string[][] }>
  meta_title: string
  meta_description: string
  breadcrumb_title: string
  content_length: number
  table_row_count: number
}

const output: Record<string, PageOutput> = {}
let totalTableRows = 0

for (const post of posts) {
  // Find Yoast meta by post ID
  const yoast = yoastByObjectId[post.id]
  const url = yoast?.url || post.guid || ''
  const locale = detectLocale(url)

  // Clean HTML: strip block comments
  const cleanHtml = stripBlockComments(post.content).trim()
  const plainText = htmlToText(cleanHtml)
  const tables = extractTables(post.content)

  const rowCount = tables.reduce((sum, t) => sum + t.rows.length, 0)
  totalTableRows += rowCount

  // Build unique key: locale/slug (or just slug for duplicates)
  let key = post.slug
  if (locale !== 'fr') {
    key = `${locale}/${post.slug}`
  }
  // Handle parent pages for nested URLs
  if (post.postParent > 0) {
    const parent = posts.find(p => p.id === post.postParent)
    if (parent) {
      key = locale !== 'fr'
        ? `${locale}/${parent.slug}/${post.slug}`
        : `${parent.slug}/${post.slug}`
    }
  }

  // Deduplicate: prefer publish over draft, longer content over shorter
  if (output[key]) {
    if (output[key].status === 'publish' && post.status !== 'publish') continue
    if (output[key].content_length >= cleanHtml.length && output[key].status === post.status) continue
  }

  output[key] = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    locale,
    url,
    status: post.status,
    parent_id: post.postParent,
    content_html: cleanHtml,
    content_text: plainText,
    tables,
    meta_title: yoast?.title || '',
    meta_description: yoast?.description || '',
    breadcrumb_title: yoast?.breadcrumbTitle || '',
    content_length: cleanHtml.length,
    table_row_count: rowCount
  }
}

// ─── Build category hierarchy from terms ────────────────────────────────────

const categories: Record<string, { name: string, slug: string, parent: number, children: string[] }> = {}
for (const tax of taxonomies) {
  if (tax.taxonomy === 'category') {
    const term = termsData[tax.termId]
    if (term) {
      categories[tax.termId.toString()] = {
        name: term.name,
        slug: term.slug,
        parent: tax.parent,
        children: []
      }
    }
  }
}
// Build parent-child
for (const [id, cat] of Object.entries(categories)) {
  if (cat.parent > 0 && categories[cat.parent.toString()]) {
    categories[cat.parent.toString()].children.push(cat.slug)
  }
}

// ─── Save output ────────────────────────────────────────────────────────────

const finalOutput = {
  generated_at: new Date().toISOString(),
  stats: {
    total_sql_records: recordCount,
    total_pages_with_content: Object.keys(output).length,
    total_table_rows: totalTableRows,
    locales: [...new Set(Object.values(output).map(p => p.locale))].sort(),
    pages_by_locale: {} as Record<string, number>
  },
  categories,
  pages: output
}

// Count by locale
for (const page of Object.values(output)) {
  finalOutput.stats.pages_by_locale[page.locale] =
    (finalOutput.stats.pages_by_locale[page.locale] || 0) + 1
}

console.log('\nStep 5: Writing output...')
writeFileSync(OUTPUT, JSON.stringify(finalOutput, null, 2), 'utf8')
const fileSizeMB = (Buffer.byteLength(JSON.stringify(finalOutput, null, 2)) / 1024 / 1024).toFixed(1)
console.log(`  Output: ${OUTPUT}`)
console.log(`  File size: ${fileSizeMB} MB`)

// ─── Report ─────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(70))
console.log('EXTRACTION REPORT')
console.log('═'.repeat(70))
console.log(`Total SQL records parsed: ${recordCount}`)
console.log(`Pages with content: ${Object.keys(output).length}`)
console.log(`Total table rows extracted: ${totalTableRows}`)
console.log(`Categories: ${Object.keys(categories).length}`)
console.log('')
console.log('Pages by locale:')
for (const [locale, count] of Object.entries(finalOutput.stats.pages_by_locale).sort()) {
  console.log(`  ${locale}: ${count} pages`)
}
console.log('')
console.log('All pages found:')
const sortedPages = Object.entries(output).sort((a, b) => a[0].localeCompare(b[0]))
for (const [key, page] of sortedPages) {
  const tableInfo = page.table_row_count > 0 ? ` [${page.table_row_count} table rows]` : ''
  console.log(`  ${key.padEnd(50)} ${page.content_length.toString().padStart(8)} chars  ${page.status}${tableInfo}`)
}
