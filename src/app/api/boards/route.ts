import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, handleAuthError } from "@/lib/auth";

const createBoardSchema = z.object({
  title: z.string().min(1).max(100),
  background: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
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
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = createBoardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title, background } = parsed.data;
    const board = await prisma.board.create({
      data: {
        title,
        description: "",
        adminId: session.user.id,
        background,
        lists: {
          create: [
            { title: "Todo", position: 0 },
            { title: "Doing", position: 1 },
            { title: "Done", position: 2 },
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
        members: { include: { user: true } },
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
