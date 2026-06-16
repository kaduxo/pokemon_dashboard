import { NextRequest, NextResponse } from 'next/server'
import { readCollection, writeCollection } from '@/lib/storage'
import fs from 'fs'
import path from 'path'

function readEnvLocal(): Record<string, string> {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
    const out: Record<string, string> = {}
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
    }
    return out
  } catch { return {} }
}

function getEnv(key: string): string | undefined {
  const fileVars = readEnvLocal()
  return fileVars[key] || process.env[key] || undefined
}

const POKEMON_API = 'https://api.pokemontcg.io/v2'

async function fetchCardPrice(cardId: string): Promise<number | null> {
  const apiKey = getEnv('POKEMON_TCG_API_KEY')
  const headers: Record<string, string> = {}
  if (apiKey) headers['X-Api-Key'] = apiKey

  try {
    const res = await fetch(`${POKEMON_API}/cards/${cardId}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    const prices = data.data?.tcgplayer?.prices
    if (!prices) return null
    // Priority: holofoil > reverseHolofoil > normal > 1stEditionHolofoil
    const priceObj =
      prices.holofoil ||
      prices['1stEditionHolofoil'] ||
      prices.reverseHolofoil ||
      prices.normal ||
      Object.values(prices)[0] as any
    return priceObj?.market || priceObj?.mid || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cardIds } = await req.json().catch(() => ({ cardIds: null }))
    const collection = await readCollection()

    const toUpdate = cardIds
      ? collection.filter((c) => cardIds.includes(c.uid))
      : collection

    let updated = 0
    for (const card of toUpdate) {
      if (!card.cardId) continue
      const price = await fetchCardPrice(card.cardId)
      if (price !== null) {
        card.currentPrice = price
        card.priceUpdatedAt = new Date().toISOString()
        updated++
      }
      // Rate limit: 1 req per 100ms
      await new Promise((r) => setTimeout(r, 100))
    }

    await writeCollection(collection)
    return NextResponse.json({ success: true, updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
