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
          { adminId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
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
  const { title, background } = await request.json();
  try {
    const board = await prisma.board.create({
      data: {
        title,
        description: "",
        adminId: session.user.id,
        background,
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
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        lists: true,
        admin: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
