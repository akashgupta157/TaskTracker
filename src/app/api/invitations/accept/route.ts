import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { token } = await request.json();

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { board: true },
    });

    // Validate invitation
    if (
      !invitation ||
      invitation.status !== "PENDING" ||
      new Date(invitation.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    // Verify user's email matches invitation
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: "Email does not match invitation" },
        { status: 400 }
      );
    }

    // Check if user already a member
    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId: invitation.boardId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({ boardId: invitation.boardId });
    }

    // Add user to board
    await prisma.$transaction([
      prisma.boardMember.create({
        data: {
          boardId: invitation.boardId,
          userId: session.user.id,
          role: "MEMBER",
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);
    return NextResponse.json({ boardId: invitation.boardId });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
