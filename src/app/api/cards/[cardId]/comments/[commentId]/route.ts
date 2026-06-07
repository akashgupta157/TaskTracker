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

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; commentId: string }> }
) {
  try {
    const session = await requireSession();
    const { commentId } = await params;

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { card: { select: { boardId: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }
    await assertBoardMembership(session.user.id, existing.card.boardId);
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    const parsed = updateCommentSchema.safeParse(await request.json());
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

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content, isEdited: true },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string; commentId: string }> }
) {
  try {
    const session = await requireSession();
    const { cardId, commentId } = await params;

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        card: {
          select: { boardId: true, board: { select: { adminId: true } } },
        },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }
    await assertBoardMembership(session.user.id, existing.card.boardId);

    const isOwner = existing.userId === session.user.id;
    const isAdmin = existing.card.board.adminId === session.user.id;
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Not allowed to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id: commentId } });

    await logActivity({
      type: "COMMENT_DELETED",
      boardId: existing.card.boardId,
      userId: session.user.id,
      cardId,
    });

    return NextResponse.json({ deletedCommentId: commentId });
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
