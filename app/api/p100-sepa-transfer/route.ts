import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mockFlag = searchParams.get('mock') === '1' || process.env.PAYMENTS_TEST_MODE === 'true'
    const body = await request.json()

    if (mockFlag) {
      const transferId = `test_sepa_${Date.now()}`
      const data = {
        transferId,
        status: 'PENDING',
        ...body,
      }
      return NextResponse.json(data, { status: 200 })
    }

    const apiKey = process.env.P100_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing P100_API_KEY' }, { status: 500 })
    }

    // Expecting: sourceExternalUserId, currency (eur), amount, receiverFirstName, receiverLastName, receiverType, destinationIban, transferTitle
    const apiUrl = 'https://partner-api-stage.p100.io/v1/bank/sepa-transfer'

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
      return NextResponse.json({ error: 'Failed to create SEPA transfer', details: data }, { status: res.status })
    }

    // Normalize response to include transferId for the client
    const transferId = data.transferId || data.id || data.transfer_id

    return NextResponse.json({ ...data, transferId }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create SEPA transfer', details: err?.message || err }, { status: 500 })
  }
}
