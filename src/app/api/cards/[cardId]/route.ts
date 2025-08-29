import prisma from "@/lib/prisma";
import { Card } from "@/generated/prisma";
import { handleApiError } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
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
  try {
    const { cardId } = await params;

    const cardToDelete = await prisma.card.findUnique({
      where: { id: cardId },
      select: { listId: true, position: true },
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
