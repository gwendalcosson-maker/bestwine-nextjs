import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

async function executeSql(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const text = await res.text()
    // rpc endpoint may not exist, try alternative
    return null
  }
  return await res.json()
}

// Split SQL into individual statements and execute via pg_query if available
async function run() {
  const sqlFile = path.join(projectRoot, 'supabase', 'full-setup.sql')
  const fullSql = fs.readFileSync(sqlFile, 'utf-8')

  // Split by semicolons, keeping only non-empty statements
  const statements = fullSql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Total statements: ${statements.length}`)

  // Try using the Supabase Management API
  const projectRef = 'tmwxushartfhwgawixqz'

  // First, try to execute via the SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: fullSql }),
  })

  console.log('pg/query status:', res.status)
  if (res.ok) {
    const data = await res.json()
    console.log('Success!', data)
    return
  }

  const errorText = await res.text()
  console.log('pg/query response:', errorText.substring(0, 200))

  // Try sql endpoint
  const res2 = await fetch(`${SUPABASE_URL}/sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: fullSql }),
  })

  console.log('sql status:', res2.status)
  const text2 = await res2.text()
  console.log('sql response:', text2.substring(0, 200))
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
