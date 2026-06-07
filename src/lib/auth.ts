import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOption";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }
  return session;
}

export async function assertBoardMembership(
  userId: string,
  boardId: string,
  opts?: { requireAdmin?: boolean }
) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      adminId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
  if (!board) throw new ApiError(404, "Board not found");
  const isAdmin = board.adminId === userId;
  const isMember = isAdmin || board.members.length > 0;
  if (!isMember) throw new ApiError(403, "Forbidden");
  if (opts?.requireAdmin && !isAdmin) throw new ApiError(403, "Admin only");
  return { isAdmin };
}

export function handleAuthError(err: unknown): NextResponse | null {
  if (err instanceof ApiError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
  return null;
}
