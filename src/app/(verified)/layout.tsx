"use client";

import Navbar from "@/components/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingPage } from "@/components/Loading";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, status } = useSession();

  const { error } = useSelector((state: RootState) => state.board);

  if (status === "loading") {
    return <LoadingPage />;
  }
  if (!data) {
    redirect("/");
  }
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
    </div>
  );
}
