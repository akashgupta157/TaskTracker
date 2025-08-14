"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoadingPage } from "@/components/Loading";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const { data, status } = useSession();
  if (status === "loading") {
    return <LoadingPage />;
  }
  if (data) {
    redirect("/dashboard");
  }

  return (
    <div
      className="bg-cover bg-center px-6 sm:px-10 md:px-20 w-screen max-w-screen h-screen max-h-screen font-satoshi"
      style={{ backgroundImage: `url('/landing_bg.png')` }}
    >
      <div className="mx-auto max-w-[1300px]">
        <div className="flex items-center gap-2 py-5">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <p className="font-black text-[#2e2b42] text-2xl sm:text-3xl">
            TaskTracker
          </p>
        </div>

        <div className="space-y-5 mt-5 text-center">
          <h1 className="font-black text-[#18266f] text-4xl sm:text-5xl md:text-6xl lg:text-7xl capitalize leading-tight sm:leading-snug md:leading-[4.5rem] lg:leading-[5rem]">
            boost your{" "}
            <span className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 text-transparent">
              Productivity,
            </span>{" "}
            <br className="hidden sm:block" />
            simplify your life
          </h1>

          <p className="mx-auto w-full sm:w-4/5 md:w-3/4 font-medium text-[#8087b3] text-base sm:text-lg">
            We&apos;re here to simplify the intricacies of your life, providing
            a user-friendly platform that not only manages your tasks
            effortlessly but also enhances your overall efficiency.
          </p>

          <button
            className="block bg-[#5146b8] hover:bg-[#5146b8]/90 mx-auto px-6 sm:px-8 py-2 rounded-full font-medium text-white text-base sm:text-lg transition-colors duration-300 cursor-pointer"
            onClick={() => signIn("google")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
