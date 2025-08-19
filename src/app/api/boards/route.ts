import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session;
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { admin: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
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
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  const { title, description } = await request.json();
  try {
    const board = await prisma.board.create({
      data: {
        title,
        description: description || "",
        admin: session.user.id,
        background: "bg-gradient-to-br from-slate-800 to-sky-900",
        lists: {
          create: [
            {
              title: "Todo",
              position: 0,
            },
            {
              title: "Doing",
              position: 1,
            },
            {
              title: "Done",
              position: 2,
            },
          ],
        },
      },
      include: {
        lists: true,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
