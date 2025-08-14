import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { title, position, boardId } = await request.json();

  try {
    const list = await prisma.list.create({
      data: {
        title,
        position,
        boardId,
      },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { id, title } = await request.json();

  try {
    const list = await prisma.list.update({
      where: { id },
      data: {
        title,
      },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
