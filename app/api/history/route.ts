import { NextRequest, NextResponse } from 'next/server'
import { getPortfolioHistory, appendPortfolioHistory } from '@/lib/storage'

export async function GET() {
  try {
    const history = getPortfolioHistory()
    return NextResponse.json({ success: true, data: history })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read history' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    appendPortfolioHistory({ date: body.date, value: body.value, cost: body.cost })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save history' }, { status: 500 })
  }
}
