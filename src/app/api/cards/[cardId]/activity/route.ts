import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const activities = await db.activity.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
      take: 100,
    });
    return NextResponse.json(activities);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
