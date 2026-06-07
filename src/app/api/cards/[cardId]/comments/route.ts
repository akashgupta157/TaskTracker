import { z } from "zod";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await requireSession();
    const { cardId } = await params;
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { boardId: true },
    });
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }
    await assertBoardMembership(session.user.id, card.boardId);

    const comments = await prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return NextResponse.json(comments);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await requireSession();
    const { cardId } = await params;
    const parsed = createCommentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const content = parsed.data.content.trim();
    if (!content) {
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
    await assertBoardMembership(session.user.id, card.boardId);

    const comment = await prisma.comment.create({
      data: {
        content,
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
      data: { commentId: comment.id, preview: content.slice(0, 120) },
    });

    return NextResponse.json(comment);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
