import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const { boardId } = await params;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        user: true,
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 });
    }
    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
