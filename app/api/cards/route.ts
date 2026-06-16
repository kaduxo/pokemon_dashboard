import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getPokemonApiKey(): string | undefined {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (t.startsWith('POKEMON_TCG_API_KEY=')) return t.slice('POKEMON_TCG_API_KEY='.length).trim()
    }
  } catch {}
  return process.env.POKEMON_TCG_API_KEY
}

const POKEMON_API = 'https://api.pokemontcg.io/v2'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '20'
  const endpoint = searchParams.get('endpoint') || 'cards'

  const apiKey = getPokemonApiKey()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  try {
    let url = `${POKEMON_API}/${endpoint}?page=${page}&pageSize=${pageSize}`
    if (query) {
      // Pokemon TCG API uses Lucene syntax — wrap plain name queries
      const formattedQuery = query.includes(':') ? query : `name:*${query}*`
      url += `&q=${encodeURIComponent(formattedQuery)}`
    }

    const res = await fetch(url, { headers, next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`Pokemon API error: ${res.status}`)

    const data = await res.json()
    return NextResponse.json({ success: true, ...data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
