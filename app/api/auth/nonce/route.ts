import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { address } = body;
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const nonce = Math.floor(Math.random() * 1000000).toString();
        const issuedAt = new Date().toISOString();
        const message = `puff-market.com wants you to sign in with your Ethereum account:\n${address}\n\nSign in to PUFF Marketplace.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 31337\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

        return NextResponse.json({ message, nonce });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}