import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        console.log('🧪 Mock backend received order:', body)

        // Simulate backend delivery logic
        const fakeKeys = body.products.map((p: any, i: number) => {
            return `MOCKKEY${i + 1}-${p.external_id}`
        })

        const response = {
            success: true,
            message: 'Gift cards delivered successfully (mock mode)',
            keys: fakeKeys,
            giftCardKeys: fakeKeys,
            invoiceUrl: 'https://example.com/invoice/mock',
            customerId: body.customer?.id || 'mock_user_001',
            emailSent: true,
        }

        return NextResponse.json(response)
    } catch (err: any) {
        console.error('Mock backend error:', err)
        return NextResponse.json({ success: false, error: err.message || 'Mock error' }, { status: 500 })
    }
}
