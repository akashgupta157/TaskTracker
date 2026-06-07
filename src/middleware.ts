import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/api/boards/:path*",
    "/api/lists/:path*",
    "/api/cards/:path*",
    // Protect invitation routes EXCEPT /api/invitations/validate (public, used by accept-invite page)
    // /api/invitations/accept requires auth — let it pass through (handler enforces session).
    "/api/invitations/accept",
  ],
};
