import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
