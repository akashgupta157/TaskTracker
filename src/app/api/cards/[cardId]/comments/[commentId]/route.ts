import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; commentId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Comment content is required" },
        { status: 400 }
      );
    }

    const existing = await db.comment.findUnique({ where: { id: commentId } });
    if (!existing) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    const updated = await db.comment.update({
      where: { id: commentId },
      data: { content: content.trim(), isEdited: true },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string; commentId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId, commentId } = await params;

    const existing = await db.comment.findUnique({
      where: { id: commentId },
      include: { card: { select: { boardId: true, board: { select: { adminId: true } } } } },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    const isOwner = existing.userId === session.user.id;
    const isAdmin = existing.card?.board?.adminId === session.user.id;
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Not allowed to delete this comment" },
        { status: 403 }
      );
    }

    await db.comment.delete({ where: { id: commentId } });

    await logActivity({
      type: "COMMENT_DELETED",
      boardId: existing.card.boardId,
      userId: session.user.id,
      cardId,
    });

    return NextResponse.json({ deletedCommentId: commentId });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
