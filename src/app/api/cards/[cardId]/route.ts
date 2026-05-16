import prisma from "@/lib/prisma";
import { Card } from "@/generated/prisma";
import { handleApiError } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  try {
    const { cardId } = await params;
    const {
      position: newPosition,
      listId: newListId,
      toggleComplete,
    } = await request.json();

    if (toggleComplete) {
      const card = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: {
          isCompleted: !card.isCompleted,
        },
      });

      if (session?.user?.id) {
        await logActivity({
          type: updatedCard.isCompleted ? "CARD_COMPLETED" : "CARD_REOPENED",
          boardId: updatedCard.boardId,
          userId: session.user.id,
          cardId: updatedCard.id,
        });
      }

      return NextResponse.json(updatedCard);
    }

    if (typeof newPosition !== "number" || newPosition < 0 || !newListId) {
      return NextResponse.json(
        { message: "Invalid position or listId" },
        { status: 400 }
      );
    }

    const cardToMove = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!cardToMove) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    const currentListId = cardToMove.listId;
    const isSameList = currentListId === newListId;

    const result = await prisma.$transaction(async (tx) => {
      if (!isSameList) {
        await tx.card.updateMany({
          where: {
            listId: currentListId,
            position: { gt: cardToMove.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      }

      await tx.card.updateMany({
        where: {
          listId: newListId,
          position: { gte: newPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });

      const updatedCard = await tx.card.update({
        where: { id: cardId },
        data: {
          position: newPosition,
          listId: newListId,
        },
        include: {
          list: true,
        },
      });

      return updatedCard;
    });

    if (!isSameList) {
      await normalizeListPositions(prisma, currentListId);
    }
    await normalizeListPositions(prisma, newListId);

    if (!isSameList && session?.user?.id) {
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

async function normalizeListPositions(tx: PrismaClient, listId: string) {
  const cards = await tx.card.findMany({
    where: { listId },
    orderBy: { position: "asc" },
  });

  await Promise.all(
    cards.map((card: Card, index: number) =>
      tx.card.update({
        where: { id: card.id },
        data: { position: index },
      })
    )
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  try {
    const { cardId } = await params;

    const cardToDelete = await prisma.card.findUnique({
      where: { id: cardId },
      select: { listId: true, position: true, title: true, boardId: true },
    });

    if (!cardToDelete) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({
        where: { id: cardId },
      });

      await tx.card.updateMany({
        where: {
          listId: cardToDelete.listId,
          position: {
            gt: cardToDelete.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      return { success: true };
    });

    if (session?.user?.id) {
      await logActivity({
        type: "CARD_DELETED",
        boardId: cardToDelete.boardId,
        userId: session.user.id,
        cardId: null,
        data: { title: cardToDelete.title, cardId },
      });
    }

    return NextResponse.json(
      {
        message: "Card deleted successfully and positions updated",
        deletedCardId: cardId,
      },
      { status: 200 }
    );
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
