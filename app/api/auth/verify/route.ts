import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { message, signature, address } = body as {
            message: string;
            signature: string;
            address: string;
        };

        if (!message || !signature || !address) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Cryptographically recover address
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
        }

        // Upsert User row in database
        const user = await db.user.upsert({
            where: { address: address.toLowerCase() },
            update: {},
            create: { address: address.toLowerCase() },
        });

        // Create JWT token
        const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_JWT_SECRET || "default_secret";
        const token = jwt.sign(
            { id: user.id, address: user.address },
            jwtSecret,
            { expiresIn: "30d" }
        );

        return NextResponse.json({ success: true, token, user });
    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
