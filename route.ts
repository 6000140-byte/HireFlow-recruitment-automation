import { NextResponse } from "next/server";
import { db } from "@/lib/storage/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");

    let logs = db.getAuditLogs();
    if (entityType) {
      logs = logs.filter((l) => l.entity_type === entityType);
    }

    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
