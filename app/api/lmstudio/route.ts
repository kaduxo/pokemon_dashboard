import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.LMSTUDIO_BASE_URL || 'http://192.168.1.103:3000'
const MODEL = process.env.LMSTUDIO_MODEL || 'Gemma 4 E4B'

const SCAN_PROMPT = `You are an expert Pokémon TCG card grader and identifier. Analyze this card image and respond ONLY with a valid JSON object (no markdown, no extra text) with this exact structure:

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

// GET — check if LM Studio is reachable and return loaded models
export async function GET() {
  try {
    const res = await fetch(`${BASE}/v1/models`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return NextResponse.json({ online: false })
    const data = await res.json()
    return NextResponse.json({ online: true, model: MODEL, models: data })
  } catch {
    return NextResponse.json({ online: false })
  }
}

// POST — scan a card image using Gemma via LM Studio /api/v1/chat
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType = file.type || 'image/jpeg'

    // Use OpenAI-compatible endpoint — LM Studio's native /api/v1/chat uses a different schema
    const res = await fetch(`${BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
              { type: 'text', text: SCAN_PROMPT },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.2,
        stream: false,
      }),
      signal: AbortSignal.timeout(180000),
    })

    const responseText = await res.text()

    if (!res.ok) {
      throw new Error(`LM Studio error ${res.status}: ${responseText || '(empty response)'}`)
    }

    if (!responseText || responseText.trim() === '') {
      throw new Error('LM Studio returned an empty response. The model may not support vision/image inputs.')
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`LM Studio returned invalid JSON: ${responseText.slice(0, 200)}`)
    }

    const text = data.choices?.[0]?.message?.content || ''
    if (!text) {
      throw new Error(`LM Studio response had no content. Full response: ${JSON.stringify(data)}`)
    }

    const clean = text.replace(/```json|```/g, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      throw new Error(`Model returned non-JSON text: ${text.slice(0, 200)}`)
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
