import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const card = await prisma.card.create({
      data: body,
    });
    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  try {
    const card = await prisma.card.update({
      where: { id: body.id },
      data: body,
    });
    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
