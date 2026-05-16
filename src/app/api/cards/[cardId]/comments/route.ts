import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const comments = await db.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return NextResponse.json(comments);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Comment content is required" },
        { status: 400 }
      );
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { boardId: true },
    });
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        cardId,
        userId: session.user.id,
      },
      include: { user: true },
    });

    await logActivity({
      type: "COMMENT_ADDED",
      boardId: card.boardId,
      userId: session.user.id,
      cardId,
      data: { commentId: comment.id, preview: content.trim().slice(0, 120) },
    });

    return NextResponse.json(comment);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
