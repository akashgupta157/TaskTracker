import React from "react";
import Image from "next/image";
import { Board } from "@/types";
import { Button } from "./ui/button";
import { LuListFilter, LuUserRoundPlus } from "react-icons/lu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Header({
  currentBoard,
  loading,
}: {
  currentBoard: Board | null;
  loading: boolean;
}) {
  return (
    <div className="flex justify-between items-center bg-white/90 dark:bg-black/20 p-4 sm:px-6 md:px-10 font-sans">
      {loading ? (
        <div className="h-8" />
      ) : (
        <>
          <h2 className="font-bold text-xl">{currentBoard?.title}</h2>
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center -space-x-1">
                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Image
                          src={currentBoard?.user.image || "/logo.png"}
                          alt="admin"
                          width={25}
                          height={25}
                          className="z-1 border rounded-full size-8 cursor-pointer"
                        />
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{currentBoard?.user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent>
                    <div className="flex items-center gap-3">
                      <Image
                        src={currentBoard?.user.image || "/logo.png"}
                        alt="admin"
                        width={25}
                        height={25}
                        className="z-1 border rounded-full size-14 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold">{currentBoard?.user.name}</p>
                        <p className="text-sm">{currentBoard?.user.email}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LuListFilter className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Cards</p>
              </TooltipContent>
            </Tooltip>
            <Button>
              <LuUserRoundPlus />
              Add Member
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
