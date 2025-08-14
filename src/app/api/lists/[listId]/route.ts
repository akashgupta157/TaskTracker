import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { listId: string } }
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

      const filteredLists = lists.filter((list) => list.id !== listId);
      filteredLists.splice(newPosition, 0, listToMove);

      const transaction = filteredLists.map((list, index) =>
        prisma.list.update({
          where: { id: list.id },
          data: { position: index },
        })
      );

      await prisma.$transaction(transaction);
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
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
