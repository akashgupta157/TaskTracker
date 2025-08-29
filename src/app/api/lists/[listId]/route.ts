import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const { boardId, newPosition, title } = await request.json();

    // Handle title update if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return NextResponse.json(
          { message: "Title must be a non-empty string" },
          { status: 400 }
        );
      }

      const updatedList = await prisma.list.update({
        where: { id: listId },
        data: { title },
      });

      if (newPosition === undefined) {
        return NextResponse.json(
          { message: "List title updated successfully", list: updatedList },
          { status: 200 }
        );
      }
    }

    // Handle position update if provided
    if (newPosition !== undefined) {
      if (typeof newPosition !== "number" || newPosition < 0) {
        return NextResponse.json(
          { message: "Invalid position value" },
          { status: 400 }
        );
      }

      const lists = await prisma.list.findMany({
        where: { boardId },
        orderBy: { position: "asc" },
      });

      const listToMove = lists.find((list) => list.id === listId);
      if (!listToMove) {
        return NextResponse.json(
          { message: "List not found" },
          { status: 404 }
        );
      }

      const currentPosition = listToMove.position;

      if (currentPosition === newPosition) {
        return NextResponse.json(
          { message: "Position unchanged", updatedPosition: newPosition },
          { status: 200 }
        );
      }

      const tempPosition = -1;

      await prisma.list.update({
        where: { id: listId },
        data: { position: tempPosition },
      });

      if (newPosition < currentPosition) {
        await prisma.list.updateMany({
          where: {
            boardId,
            position: {
              gte: newPosition,
              lt: currentPosition,
            },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        await prisma.list.updateMany({
          where: {
            boardId,
            position: {
              gt: currentPosition,
              lte: newPosition,
            },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      }

      await prisma.list.update({
        where: { id: listId },
        data: { position: newPosition },
      });
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;

    const listToDelete = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        cards: true,
      },
    });

    if (!listToDelete) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const { boardId, position: deletedPosition } = listToDelete;

    const result = await prisma.$transaction(async (tx) => {
      if (listToDelete.cards.length > 0) {
        await tx.card.deleteMany({
          where: { listId },
        });
      }

      await tx.list.delete({
        where: { id: listId },
      });

      await tx.list.updateMany({
        where: {
          boardId,
          position: {
            gt: deletedPosition,
          },
        },
        data: {
          position: { decrement: 1 },
        },
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
