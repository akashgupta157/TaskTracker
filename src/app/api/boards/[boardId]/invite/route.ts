import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
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

    try {
      const { data, error } = await resend.emails.send({
        from: "TaskTracker <onboarding@resend.dev>",
        to: email,
        subject: `🌟 You're invited! Join ${session.user.name} on TaskTracker`,
        html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
        .container { max-width: 550px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 36px; text-decoration: none; border-radius: 50px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .footer { background: #f8fafc; padding: 25px; text-align: center; color: #64748b; }
        .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0; }
        .feature { background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; border-radius: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">TaskTracker</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Streamline your team's workflow</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 10px;">You're Invited! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">
            <strong>${session.user.name}</strong> wants you to join their board and collaborate together.
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0; color: #1e40af;">${board.title}</h3>
            <p style="margin: 8px 0 0 0; color: #64748b;">Ready for collaboration</p>
          </div>
          
          <div style="text-align: center; margin: 35px 0; color: #64748b;">
            <a href="${inviteLink}" class="button">Accept Invitation →</a>
          </div>
          
          <div class="feature-grid">
            <div class="feature">
              <span style="font-size: 20px;">📋</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Organize tasks</p>
            </div>
            <div class="feature">
              <span style="font-size: 20px;">👥</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Team collaboration</p>
            </div>
            <div class="feature">
              <span style="font-size: 20px;">⚡</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Real-time updates</p>
            </div>
            <div class="feature">
              <span style="font-size: 20px;">🎯</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Track progress</p>
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
            ⏰ This invitation expires in 24 hours
          </p>
        </div>
        
        <div class="footer">
          <img src="${process.env.NEXTAUTH_URL}/logo.png" alt="TaskTracker" style="width: 40px; height: 40px; margin-bottom: 10px; border-radius: 8px;">
          <p style="margin: 0;">Happy collaborating! 🚀</p>
          <p style="margin: 8px 0 0 0; font-size: 12px;">TaskTracker - Making teamwork effortless</p>
        </div>
      </div>
    </body>
    </html>,
  `,
        text: `
🌟 TaskTracker Invitation 🌟

${session.user.name} has invited you to collaborate on: "${board.title}"

Join now: ${inviteLink}

✨ Features:
• Organize tasks efficiently
• Collaborate with your team
• Real-time updates
• Track progress easily

This invitation expires in 24 hours ⏰

--
TaskTracker - Making teamwork effortless
      `,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({
          message: "Failed to send invitation email",
        });
      }
      console.log(data);
      return NextResponse.json({ message: "Invitation sent successfully" });
    } catch (error) {
      const { message, statusCode } = handleApiError(error);
      return NextResponse.json({ message }, { status: statusCode || 500 });
    }
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
