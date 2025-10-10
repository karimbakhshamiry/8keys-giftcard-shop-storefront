import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const externalUserId = searchParams.get('externalUserId')
  const mockFlag = searchParams.get('mock') === '1' || process.env.PAYMENTS_TEST_MODE === 'true'
  if (!externalUserId) {
    return NextResponse.json({ error: 'Missing externalUserId' }, { status: 400 })
  }

  if (mockFlag) {
    // Return a deterministic mock balance including a USDC wallet for testing
    const data = {
      cryptoBalances: [
        {
          name: 'usdc',
          amount: 1000, // plenty for tests
          wallet: 'UQDTESTMOCKWALLETADDRESSUSDC1234567890',
          network: 'TON',
        },
      ],
      fiatBalances: [
        { currency: 'eur', amount: 5000 },
      ],
      userId: externalUserId,
    }
    return NextResponse.json(data, { status: 200 })
  }

  const apiKey = process.env.P100_API_KEY // Or use a server-only env var
  const apiUrl = `https://partner-api-stage.p100.io/v1/user/${externalUserId}/balances`
  try {
    const res = await fetch(apiUrl, {
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch from P100', details: err?.message || err }, { status: 500 })
  }
} 