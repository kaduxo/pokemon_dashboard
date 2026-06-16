import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function loadEnvLocal(): Record<string, string> {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const text = fs.readFileSync(envPath, 'utf8')
    const result: Record<string, string> = {}
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
    return result
  } catch {
    return {}
  }
}

function getEnv(key: string, fallback = ''): string {
  // .env.local takes priority — process.env may be polluted by the shell (e.g. Claude Code)
  const fromFile = loadEnvLocal()[key]
  if (fromFile) return fromFile
  return process.env[key] || fallback
}

const PROMPT = `You are an expert Pokémon TCG card grader and identifier. Analyze this card image and respond ONLY with a valid JSON object (no markdown, no extra text) with this exact structure:

{
  "name": "Full card name",
  "set": "Set name",
  "setCode": "Set code like sv1 or base1",
  "number": "Card number like 025/198",
  "rarity": "Common | Uncommon | Rare | Holo Rare | Ultra Rare | Secret Rare | Special Illustration Rare | Hyper Rare",
  "type": "Fire | Water | Grass | Lightning | Psychic | Fighting | Darkness | Metal | Dragon | Colorless | Trainer | Energy",
  "hp": "HP if applicable or null",
  "year": "Release year",
  "language": "English | Japanese | Other",
  "foil": true or false,
  "estimatedMarketPrice": number in USD,
  "condition": {
    "overall": number from 1 to 10,
    "centering": number from 1 to 10,
    "corners": number from 1 to 10,
    "edges": number from 1 to 10,
    "surface": number from 1 to 10,
    "notes": "Brief condition notes"
  },
  "gradingPotential": "PSA 10 candidate | PSA 9 likely | PSA 8 or lower | Not recommended",
  "identificationConfidence": "high | medium | low",
  "notes": "Any notable features, variants, or observations"
}`

export async function GET() {
  const apiKey = getEnv('ANTHROPIC_API_KEY')
  const baseUrl = getEnv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1')
  const model = getEnv('SCANNER_MODEL', 'moonshotai/Kimi-K2.5')
  return NextResponse.json({
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 10) : null,
    baseUrl,
    model,
  })
}

export async function POST(req: NextRequest) {
  const apiKey = getEnv('ANTHROPIC_API_KEY')
  const baseUrl = getEnv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1')
  const model = getEnv('SCANNER_MODEL', 'moonshotai/Kimi-K2.5')

  console.log('[scanner] apiKey present:', !!apiKey, '| baseUrl:', baseUrl, '| model:', model)

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local and restart the server.' }, { status: 500 })
    }

    const res = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    })

    const responseText = await res.text()

    if (!res.ok) {
      console.error('Scanner API error:', res.status, responseText)
      return NextResponse.json(
        { success: false, error: `API returned ${res.status}: ${responseText}` },
        { status: 500 }
      )
    }

    let responseJson: any
    try {
      responseJson = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ success: false, error: `Invalid JSON from API: ${responseText}` }, { status: 500 })
    }

    const text = responseJson.content?.[0]?.text || ''
    if (!text) {
      return NextResponse.json({ success: false, error: `Empty response from model. Full response: ${JSON.stringify(responseJson)}` }, { status: 500 })
    }

    const clean = text.replace(/```json|```/g, '').trim()
    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ success: false, error: `Model returned non-JSON: ${text}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: any) {
    console.error('Scanner route error:', err)
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 })
  }
}
