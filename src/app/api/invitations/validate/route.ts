import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    const invitation = await prisma.invitation.findUnique({
      where: { token: token as string },
      include: { board: true },
    });

    if (
      !invitation ||
      invitation.status !== "PENDING" ||
      new Date(invitation.expiresAt) < new Date()
    ) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      boardId: invitation.boardId,
      userExists: !!userExists,
    });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
