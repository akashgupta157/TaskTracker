import prisma from "@/lib/prisma";
import { supabase } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const { error } = await supabase
      .from("_prisma_migrations")
      .select("id")
      .limit(1);

    return NextResponse.json({
      status: "healthy",
      supabase: error ? "error" : "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
