import { NextRequest, NextResponse } from 'next/server'
import { readCollection, writeCollection } from '@/lib/storage'
import { CollectionCard } from '@/lib/types'

export async function GET() {
  try {
    const collection = await readCollection()
    return NextResponse.json({ success: true, data: collection })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read collection' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const collection = await readCollection()
    const newCard: CollectionCard = {
      ...body,
      uid: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      addedAt: new Date().toISOString(),
      currentPrice: body.currentPrice || body.purchasePrice || 0,
    }
    collection.push(newCard)
    await writeCollection(collection)
    return NextResponse.json({ success: true, data: newCard })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to add card' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { uid, ...updates } = body
    const collection = await readCollection()
    const idx = collection.findIndex((c) => c.uid === uid)
    if (idx === -1) return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 })
    collection[idx] = { ...collection[idx], ...updates }
    await writeCollection(collection)
    return NextResponse.json({ success: true, data: collection[idx] })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update card' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    const collection = await readCollection()
    const filtered = collection.filter((c) => c.uid !== id)
    await writeCollection(filtered)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete card' }, { status: 500 })
  }
}
