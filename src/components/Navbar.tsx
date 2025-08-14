import React from "react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { LuLogOut } from "react-icons/lu";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function Navbar() {
  const router = useRouter();
  const { data } = useSession();
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex justify-between items-center shadow-md p-2 px-4 sm:px-6 md:px-10 dark:border-gray-600 dark:border-b font-sans">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={30}
          height={30}
          className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8"
        />
        <h1 className="font-semibold text-md sm:text-lg md:text-xl">
          TaskTracker
        </h1>
      </div>
      <Popover>
        <PopoverTrigger>
          <Image
            src={data?.user.image || "/logo.png"}
            alt="user"
            width={25}
            height={25}
            className="rounded-full w-6 sm:w-7 h-6 sm:h-7 cursor-pointer"
          />
        </PopoverTrigger>
        <PopoverContent className="space-y-5 px-5 py-7 w-[90vw] sm:w-auto max-w-md font-sans">
          <p className="font-bold text-sm">Account</p>
          <div className="flex items-center gap-3">
            <Image
              src={data?.user.image || "/logo.png"}
              alt="user"
              width={40}
              height={40}
              className="rounded-full w-10 h-10"
            />
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {data?.user.name}
              </h2>
              <p className="text-xs sm:text-sm">{data?.user.email}</p>
            </div>
          </div>
          <Separator />
          <p className="font-bold text-sm">Theme</p>
          <div className="flex items-center gap-2">
            <Switch
              id="theme"
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="cursor-pointer"
            />
            <Label htmlFor="theme">Dark Mode</Label>
          </div>
          <Separator />
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              signOut();
            }}
          >
            <LuLogOut /> Logout
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
