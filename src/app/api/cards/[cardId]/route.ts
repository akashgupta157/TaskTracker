import prisma from "@/lib/prisma";
import { Card } from "@/generated/prisma";
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
      const updatedCard = await prisma.$executeRaw`
        UPDATE "Card"
        SET "isCompleted" = NOT "isCompleted"
        WHERE id = ${cardId}
        RETURNING *;
      `;
      return NextResponse.json(updatedCard);
    }

    // Validate position and listId
    if (typeof newPosition !== "number" || newPosition < 0 || !newListId) {
      return NextResponse.json(
        { message: "Invalid position or listId" },
        { status: 400 }
      );
    }

    // Get the card being moved
    const cardToMove = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!cardToMove) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    const currentListId = cardToMove.listId;
    const isSameList = currentListId === newListId;

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Remove card from current list (if moving between lists)
      if (!isSameList) {
        // Update positions in the old list
        await prisma.card.updateMany({
          where: {
            listId: currentListId,
            position: { gt: cardToMove.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      }

      // 2. Make space in the new list
      await prisma.card.updateMany({
        where: {
          listId: newListId,
          position: { gte: newPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });

      // 3. Move the card to its new position
      const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: {
          position: newPosition,
          listId: newListId,
        },
        include: {
          list: true,
        },
      });

      // 4. Normalize positions in both lists
      if (!isSameList) {
        await normalizeListPositions(prisma, currentListId);
      }
      await normalizeListPositions(prisma, newListId);

      return updatedCard;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to normalize positions in a list (0, 1, 2, ...)
async function normalizeListPositions(prisma: PrismaClient, listId: string) {
  const cards = await prisma.card.findMany({
    where: { listId },
    orderBy: { position: "asc" },
  });

  const updates = cards.map((card: Card, index: number) =>
    prisma.card.update({
      where: { id: card.id },
      data: { position: index },
    })
  );

  await prisma.$transaction(updates);
}
