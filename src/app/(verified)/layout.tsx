"use client";

import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingPage } from "@/components/Loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, status } = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!data) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
    </div>
  );
}
