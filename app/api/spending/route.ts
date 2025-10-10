import { NextResponse } from "next/server";

export async function GET() {
    console.log("🌀 /api/spending called");

    const customerId = "cus_01K6NCARB3XGMTJ1KZY087PQWY";
    const WEBHOOK_BASE_URL =
        process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL || "https://webhook.88808880.xyz";

    try {
        const res = await fetch(`${WEBHOOK_BASE_URL}/customer/${customerId}/spending`);
        console.log("🌐 Webhook response:", res.status, res.statusText);

        // If webhook is down or sends HTML, handle it gracefully
        const contentType = res.headers.get("content-type") || "";

        if (!res.ok) {
            const text = await res.text();
            console.error("❌ Non-200 webhook response:", text);
            return NextResponse.json(
                {
                    error: "Webhook server error",
                    status: res.status,
                    details: text.slice(0, 200), // trim long HTML
                },
                { status: res.status }
            );
        }

        if (!contentType.includes("application/json")) {
            const text = await res.text();
            console.error("⚠️ Webhook returned non-JSON:", text.slice(0, 200));
            return NextResponse.json({
                error: "Expected JSON but got HTML/text",
                details: text.slice(0, 200),
            });
        }

        // ✅ Safe to parse JSON now
        const data = await res.json();
        console.log("✅ Webhook data:", data);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("💥 Fetch error:", error);
        return NextResponse.json(
            { error: "Failed to reach webhook", details: error.message },
            { status: 500 }
        );
    }
}
