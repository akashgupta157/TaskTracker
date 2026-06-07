import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const patchSchema = z
  .object({
    position: z.number().int().min(0).optional(),
    listId: z.string().min(1).optional(),
    toggleComplete: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.toggleComplete === true ||
      (typeof d.position === "number" && typeof d.listId === "string"),
    { message: "Provide toggleComplete or both position and listId" }
  );

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function normalizeListPositionsTx(tx: Tx, listId: string) {
  const cards = await tx.card.findMany({
    where: { listId },
    orderBy: { position: "asc" },
  });
  await Promise.all(
    cards.map((c, index) =>
      tx.card.update({ where: { id: c.id }, data: { position: index } })
    )
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await requireSession();
    const { cardId } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { position: newPosition, listId: newListId, toggleComplete } =
      parsed.data;

    const cardForAuth = await prisma.card.findUnique({
      where: { id: cardId },
      select: { boardId: true, listId: true, position: true, isCompleted: true },
    });
    if (!cardForAuth) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }
    await assertBoardMembership(session.user.id, cardForAuth.boardId);

    if (toggleComplete) {
      const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: { isCompleted: !cardForAuth.isCompleted },
      });

      await logActivity({
        type: updatedCard.isCompleted ? "CARD_COMPLETED" : "CARD_REOPENED",
        boardId: updatedCard.boardId,
        userId: session.user.id,
        cardId: updatedCard.id,
      });

      return NextResponse.json(updatedCard);
    }

    if (typeof newPosition !== "number" || newPosition < 0 || !newListId) {
      return NextResponse.json(
        { message: "Invalid position or listId" },
        { status: 400 }
      );
    }

    const currentListId = cardForAuth.listId;
    const isSameList = currentListId === newListId;

    const result = await prisma.$transaction(async (tx) => {
      if (!isSameList) {
        await tx.card.updateMany({
          where: {
            listId: currentListId,
            position: { gt: cardForAuth.position },
          },
          data: { position: { decrement: 1 } },
        });
      }

      await tx.card.updateMany({
        where: {
          listId: newListId,
          position: { gte: newPosition },
        },
        data: { position: { increment: 1 } },
      });

      const updatedCard = await tx.card.update({
        where: { id: cardId },
        data: { position: newPosition, listId: newListId },
        include: { list: true },
      });

      // Normalize positions atomically within the same txn
      if (!isSameList) {
        await normalizeListPositionsTx(tx, currentListId);
      }
      await normalizeListPositionsTx(tx, newListId);

      return updatedCard;
    });

    if (!isSameList) {
      const lists = await prisma.list.findMany({
        where: { id: { in: [currentListId, newListId] } },
        select: { id: true, title: true },
      });
      const listTitles: Record<string, string> = {};
      for (const l of lists) listTitles[l.id] = l.title;
      await logActivity({
        type: "CARD_MOVED",
        boardId: result.list.boardId,
        userId: session.user.id,
        cardId: result.id,
        data: {
          fromListId: currentListId,
          toListId: newListId,
          fromListTitle: listTitles[currentListId] ?? null,
          toListTitle: listTitles[newListId] ?? null,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await requireSession();
    const { cardId } = await params;

    const cardToDelete = await prisma.card.findUnique({
      where: { id: cardId },
      select: { listId: true, position: true, title: true, boardId: true },
    });

    if (!cardToDelete) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }
    await assertBoardMembership(session.user.id, cardToDelete.boardId);

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({ where: { id: cardId } });
      await tx.card.updateMany({
        where: {
          listId: cardToDelete.listId,
          position: { gt: cardToDelete.position },
        },
        data: { position: { decrement: 1 } },
      });
    });

    await logActivity({
      type: "CARD_DELETED",
      boardId: cardToDelete.boardId,
      userId: session.user.id,
      cardId: null,
      data: { title: cardToDelete.title, cardId },
    });

    return NextResponse.json(
      {
        message: "Card deleted successfully and positions updated",
        deletedCardId: cardId,
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
