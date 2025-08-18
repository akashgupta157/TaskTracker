import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  try {
    const { boardId } = await params;
    const { email } = await request.json();

    if (email === session.user.email) {
      return NextResponse.json(
        { message: "You cannot invite yourself" },
        { status: 400 }
      );
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId as string, admin: session.user.id },
    });

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 });
    }

    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId: boardId as string,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "User already a member" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");

    const invitation = await prisma.invitation.upsert({
      where: {
        email_boardId: {
          email,
          boardId: boardId as string,
        },
      },
      update: {
        token,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000),
      },
      create: {
        email,
        boardId: boardId as string,
        token,
        inviterId: session.user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    return NextResponse.json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
