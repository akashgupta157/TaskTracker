import prisma from "@/lib/prisma";
import { BoardMember } from "@/types";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  const body = await request.json();
  try {
    const { assignees = [], ...cardData } = body;
    const card = await prisma.card.create({
      data: {
        ...cardData,
        assignees: {
          create: assignees.map((boardMember: BoardMember) => ({
            boardMemberId: boardMember.id,
            assignedById: session.user.id,
          })),
        },
      },
      include: {
        assignees: {
          include: {
            boardMember: {
              include: { user: true },
            },
          },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  const body = await request.json();
  try {
    const { id, assignees, ...updateData } = body;
    const card = await prisma.card.update({
      where: { id },
      data: {
        ...updateData,
        ...(assignees && {
          assignees: {
            deleteMany: {},
            create: assignees.map((boardMember: BoardMember) => ({
              boardMemberId: boardMember.id,
              assignedById: session.user.id,
            })),
          },
        }),
      },
      include: {
        assignees: {
          include: {
            boardMember: {
              include: { user: true },
            },
          },
        },
      },
    });
    console.log(card);
    return NextResponse.json(card);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
