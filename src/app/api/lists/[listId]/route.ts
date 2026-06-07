import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const patchListSchema = z
  .object({
    boardId: z.string().min(1).optional(),
    title: z.string().min(1).max(100).optional(),
    newPosition: z.number().int().min(0).optional(),
  })
  .refine((d) => d.title !== undefined || d.newPosition !== undefined, {
    message: "Either title or newPosition is required",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await requireSession();
    const { listId } = await params;
    const parsed = patchListSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title, newPosition } = parsed.data;
    let boardId = parsed.data.boardId;

    // Resolve actual list -> boardId for authorization
    const listForAuth = await prisma.list.findUnique({
      where: { id: listId },
      select: { boardId: true },
    });
    if (!listForAuth) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }
    boardId = listForAuth.boardId;
    await assertBoardMembership(session.user.id, boardId);

    // Title-only update
    if (title !== undefined && newPosition === undefined) {
      const updatedList = await prisma.list.update({
        where: { id: listId },
        data: { title },
      });
      return NextResponse.json(
        { message: "List title updated successfully", list: updatedList },
        { status: 200 }
      );
    }

    // Position update (atomic)
    if (newPosition !== undefined) {
      const result = await prisma.$transaction(async (tx) => {
        const lists = await tx.list.findMany({
          where: { boardId },
          orderBy: { position: "asc" },
        });

        const listToMove = lists.find((l) => l.id === listId);
        if (!listToMove) {
          return { status: 404 as const };
        }
        const currentPosition = listToMove.position;
        if (currentPosition === newPosition) {
          return { status: 200 as const, unchanged: true };
        }

        const tempPosition = -1;

        await tx.list.update({
          where: { id: listId },
          data: { position: tempPosition },
        });

        if (newPosition < currentPosition) {
          await tx.list.updateMany({
            where: {
              boardId,
              position: { gte: newPosition, lt: currentPosition },
            },
            data: { position: { increment: 1 } },
          });
        } else {
          await tx.list.updateMany({
            where: {
              boardId,
              position: { gt: currentPosition, lte: newPosition },
            },
            data: { position: { decrement: 1 } },
          });
        }

        // Also update title in the same txn if provided
        await tx.list.update({
          where: { id: listId },
          data: {
            position: newPosition,
            ...(title !== undefined ? { title } : {}),
          },
        });

        return { status: 200 as const };
      });

      if (result.status === 404) {
        return NextResponse.json(
          { message: "List not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "List updated successfully",
        ...(title !== undefined && { updatedTitle: title }),
        ...(newPosition !== undefined && { updatedPosition: newPosition }),
      },
      { status: 200 }
    );
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await requireSession();
    const { listId } = await params;

    const listToDelete = await prisma.list.findUnique({
      where: { id: listId },
      include: { cards: true },
    });

    if (!listToDelete) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    await assertBoardMembership(session.user.id, listToDelete.boardId);

    const { boardId, position: deletedPosition } = listToDelete;

    const result = await prisma.$transaction(async (tx) => {
      if (listToDelete.cards.length > 0) {
        await tx.card.deleteMany({ where: { listId } });
      }
      await tx.list.delete({ where: { id: listId } });
      await tx.list.updateMany({
        where: { boardId, position: { gt: deletedPosition } },
        data: { position: { decrement: 1 } },
      });
      return {
        deletedListId: listId,
        deletedCardsCount: listToDelete.cards.length,
      };
    });

    return NextResponse.json(
      {
        message: "List and all associated cards deleted successfully",
        deletedListId: result.deletedListId,
      },
      { status: 200 }
    );
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
