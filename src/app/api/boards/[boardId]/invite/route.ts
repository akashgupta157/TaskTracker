import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
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

    if (
      existingInvitation &&
      existingInvitation.status === "PENDING" &&
      existingInvitation.expiresAt > new Date()
    ) {
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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `TaskTracker <${process.env.EMAIL}>`,
      to: email,
      subject: `You've been invited to collaborate on ${board.title} - TaskTracker`,
      html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskTracker Collaboration Invitation</title>
    <style>
        /* Reset styles for email compatibility */
        body, table, td, a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            border-collapse: collapse;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            margin: 20px auto;
        }
        .header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            max-width: 180px;
            margin-bottom: 15px;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .message {
            background-color: #f8fafc;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
            transition: all 0.3s ease;
        }
        .button:hover {
            background-color: #3730a3;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(79, 70, 229, 0.3);
        }
        .link-text {
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 12px;
            border-radius: 4px;
            font-size: 14px;
            color: #475569;
            margin: 20px 0;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 25px 0;
        }
        .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8fafc;
            color: #64748b;
            font-size: 12px;
        }
        .social-links a {
            margin: 0 10px;
            text-decoration: none;
            color: #4F46E5;
        }
        .expiry-notice {
            background-color: #fffbeb;
            border: 1px solid #fcd34d;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            margin: 20px 0;
            color: #92400e;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #4F46E5;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <center class="container">
        <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0">
            <!-- Header -->
            <tr>
                <td class="header">
                    <img src="https://res.cloudinary.com/dm5uvtj7t/image/upload/v1756641485/atwymgd8/siymiv5rrfexzlfxxn4r.png" alt="TaskTracker Logo" class="logo">
                    <h1>Collaboration Invitation</h1>
                </td>
            </tr>
            
            <tr>
                <td class="content">
                    <p class="greeting">Hello,</p>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div class="avatar">${
                          session.user && session.user.name
                            ? session.user.name.charAt(0)
                            : ""
                        }</div>
                        <div>
                            <strong>${
                              session.user.name
                            }</strong> has invited you to collaborate on the board<br>
                            <strong>"${board.title}"</strong> in TaskTracker.
                        </div>
                    </div>
                    
                    <div class="message">
                        TaskTracker helps teams organize, track, and manage their projects in one place. 
                        Join this board to start collaborating with your team.
                    </div>
                    
                    <div class="expiry-notice">
                        ⏳ This invitation will expire in <strong>24 hours</strong>
                    </div>
                    
                    <div class="button-container">
                        <a href="${inviteLink}" class="button">Accept Invitation</a>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="margin: 0; color: #64748b;">Or copy and paste this URL into your browser:</p>
                    <p class="link-text">${inviteLink}</p>
                    
                    <p style="color: #94a3b8; font-size: 14px;">
                        If you didn't request this invitation, please ignore this email. 
                        For security reasons, please do not forward this email.
                    </p>
                </td>
            </tr>
            
            <tr>
                <td class="footer">
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} TaskTracker. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
  `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Invitation sent successfully" });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
