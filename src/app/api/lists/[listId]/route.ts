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

      // If only title update was requested, return early
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
      
      // If position hasn't changed, no need to update
      if (currentPosition === newPosition) {
        return NextResponse.json(
          { message: "Position unchanged", updatedPosition: newPosition },
          { status: 200 }
        );
      }

      // Create temporary positions to avoid unique constraint violations
      const tempPosition = -1; // Use a temporary position outside normal range

      // First move the list to a temporary position
      await prisma.list.update({
        where: { id: listId },
        data: { position: tempPosition },
      });

      // Update other lists' positions
      if (newPosition < currentPosition) {
        // Moving up - increment positions of lists between newPosition and currentPosition
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
        // Moving down - decrement positions of lists between currentPosition and newPosition
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

      // Finally, move the list to its new position
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