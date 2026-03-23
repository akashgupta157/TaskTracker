"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface Avatar {
  imageUrl: string;
  name: string;
  email: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[] | undefined;
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls?.map((url, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Image
              key={index}
              className="h-8 w-8 rounded-full border-2 border-white/90 dark:border-black/30"
              src={url.imageUrl}
              width={40}
              height={40}
              alt={`Avatar ${index + 1}`}
            />
          </TooltipTrigger>
          <TooltipContent className="space-y-1 p-2">
            <p className="font-bold text-sm">{url.name}</p>
            <p className="text-xs">{url.email}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href=""
        >
          +{numPeople}
        </a>
      )}
    </div>
  );
};
