import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { handleApiError } from "@/lib/utils";
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
      where: { id: boardId as string, adminId: session.user.id },
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

    const existingInvitation = await prisma.invitation.findUnique({
      where: {
        email_boardId: {
          email,
          boardId: boardId as string,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === "PENDING") {
      return NextResponse.json(
        { message: "Invitation already sent to this email" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");

    await prisma.invitation.upsert({
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
        inviterId: session.user.id,
      },
      create: {
        email,
        boardId: boardId as string,
        token,
        inviterId: session.user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    const inviteLink = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`;
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
