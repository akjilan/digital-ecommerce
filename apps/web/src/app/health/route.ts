import { type NextRequest, NextResponse } from "next/server";

export function GET(_req: NextRequest) {
    return NextResponse.json({ ok: true, service: "web" });
}
