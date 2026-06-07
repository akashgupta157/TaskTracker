import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const createListSchema = z.object({
  title: z.string().min(1).max(100),
  boardId: z.string().min(1),
  position: z.number().int().min(0),
});

const patchListSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = createListSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title, position, boardId } = parsed.data;
    await assertBoardMembership(session.user.id, boardId);

    const list = await prisma.list.create({
      data: { title, position, boardId },
    });
    return NextResponse.json(list);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = patchListSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { id, title } = parsed.data;

    const existing = await prisma.list.findUnique({
      where: { id },
      select: { boardId: true },
    });
    if (!existing) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }
    await assertBoardMembership(session.user.id, existing.boardId);

    const list = await prisma.list.update({
      where: { id },
      data: { title },
    });
    return NextResponse.json(list);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
