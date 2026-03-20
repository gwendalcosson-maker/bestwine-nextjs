import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Supabase direct connection (transaction mode)
// Use session mode pooler
const password = process.argv[2]
const connectionString = `postgresql://postgres.tmwxushartfhwgawixqz:${encodeURIComponent(password)}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  console.log('Connecting to Supabase PostgreSQL...')
  await client.connect()
  console.log('Connected!')

  const sqlFile = path.join(projectRoot, 'supabase', 'full-setup.sql')
  const sql = fs.readFileSync(sqlFile, 'utf-8')

  console.log(`Executing ${sql.length} characters of SQL...`)
  await client.query(sql)
  console.log('Schema + migration applied successfully!')

  // Verify
  const { rows: tables } = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
  console.log('\nTables created:', tables.map(t => t.tablename).join(', '))

  const { rows: catCount } = await client.query('SELECT COUNT(*) as n FROM categories')
  console.log('Categories:', catCount[0].n)

  const { rows: transCount } = await client.query('SELECT COUNT(*) as n FROM category_translations')
  console.log('Translations:', transCount[0].n)

  const { rows: redirCount } = await client.query('SELECT COUNT(*) as n FROM redirects')
  console.log('Redirects:', redirCount[0].n)

  await client.end()
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
