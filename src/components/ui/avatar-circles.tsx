"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface Avatar {
  imageUrl: string;
  name?: string;
  email?: string;
}

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <div
        className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}
      >
        {avatarUrls.map((avatar, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                <Image
                  className="rounded-full border-2 border-white/90 dark:border-black/20 object-cover"
                  src={avatar.imageUrl}
                  width={35}
                  height={35}
                  alt={avatar.name ?? `Avatar ${index + 1}`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="flex items-center gap-3 px-4 py-3 font-sans"
            >
              <Image
                src={avatar.imageUrl}
                alt={avatar.name ?? `Avatar ${index + 1}`}
                width={32}
                height={32}
                className="rounded-full border object-cover"
              />
              <div>
                {avatar.name && (
                  <p className="font-semibold text-sm">{avatar.name}</p>
                )}
                {avatar.email && (
                  <p className="text-xs text-muted-foreground">
                    {avatar.email}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {(numPeople ?? 0) > 0 && (
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 border-white/90 dark:border-transparent bg-black text-center text-xs font-medium text-white dark:bg-white dark:text-black">
            +{numPeople}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
