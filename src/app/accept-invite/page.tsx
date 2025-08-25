"use client";
import axios from "axios";
import { LuLoader } from "react-icons/lu";
import { useEffect, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token not found");
      setLoading(false);
      return;
    }

    const handleInvite = async () => {
      try {
        const { data } = await axios.get(
          `api/invitations/validate?token=${token}`
        );
        console.log(data);
        const { valid, email, boardId, userExists } = data;

        if (!valid) {
          setError("Invalid or expired invitation link");
          setLoading(false);
          return;
        }

        // Case 1: User is already logged in
        if (session) {
          if (session.user.email === email) {
            await axios.post("/api/invitations/accept", { token });
            router.push(`/board/${boardId}`);
            toast.success("Welcome to the board!");
          } else {
            setError(`Please sign in with ${email} to accept this invitation`);
            setLoading(false);
          }
          return;
        }

        // Case 2: User is not logged in
        if (!userExists) {
          // NEW USER: Force Google account selection
          await signIn("google", {
            callbackUrl: `/accept-invite?token=${token}`,
            prompt: "select_account",
          });
        } else {
          // EXISTING USER: Normal sign-in
          await signIn("google", {
            callbackUrl: `/accept-invite?token=${token}`,
          });
        }
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    if (status !== "loading") {
      handleInvite();
    }
  }, [token, session, status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LuLoader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-4 h-screen font-sans">
        <h1 className="mb-4 font-bold text-2xl">Invitation Error</h1>
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <LuLoader className="w-8 h-8 animate-spin" />
    </div>
  );
}

export default function AcceptInvite() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <LuLoader className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
