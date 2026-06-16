import { NextRequest, NextResponse } from 'next/server'
import { readAlerts, writeAlerts } from '@/lib/storage'
import { PriceAlert } from '@/lib/types'

export async function GET() {
  try {
    const alerts = await readAlerts()
    return NextResponse.json({ success: true, data: alerts })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read alerts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const alerts = await readAlerts()
    const newAlert: PriceAlert = {
      ...body,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
    }
    alerts.push(newAlert)
    await writeAlerts(alerts)
    return NextResponse.json({ success: true, data: newAlert })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    const alerts = await readAlerts()
    const idx = alerts.findIndex((a) => a.id === id)
    if (idx === -1) return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 })
    alerts[idx] = { ...alerts[idx], ...updates }
    await writeAlerts(alerts)
    return NextResponse.json({ success: true, data: alerts[idx] })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update alert' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    const alerts = await readAlerts()
    await writeAlerts(alerts.filter((a) => a.id !== id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete alert' }, { status: 500 })
  }
}
