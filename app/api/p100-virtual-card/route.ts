import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mockFlag = searchParams.get('mock') === '1' || process.env.PAYMENTS_TEST_MODE === 'true'
    const body = await request.json()

    if (mockFlag) {
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const yy = String((now.getFullYear() + 3) % 100).padStart(2, '0')
      const data = {
        cardId: `test_card_${Date.now()}`,
        cardNumber: '4111 1111 1111 1111',
        cvv: '123',
        exp: `${mm}/${yy}`,
        ...body,
      }
      return NextResponse.json(data, { status: 200 })
    }

    const apiKey = process.env.P100_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing P100_API_KEY' }, { status: 500 })
    }

    // Expecting: externalUserId, label, pin
    const apiUrl = 'https://partner-api-stage.p100.io/v1/card/virtual'

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to create virtual card', details: data }, { status: res.status })
    }

    // Normalize response to expected shape
    const cardId = data.cardId || data.id || data.card_id
    const cardNumber = data.cardNumber || data.card_number
    const cvv = data.cvv || data.cvc
    const exp = data.exp || data.expiry || data.expiration

    return NextResponse.json({ ...data, cardId, cardNumber, cvv, exp }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create virtual card', details: err?.message || err }, { status: 500 })
  }
}
