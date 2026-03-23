"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Board } from "@/types";
import { LuCheck, LuPalette } from "react-icons/lu";
import { Button } from "./ui/button";
import { boardApi } from "@/redux/api/boardApi";
import { useAppDispatch } from "@/redux/hooks";
import { useUpdateBoardBackgroundMutation } from "@/redux/api/boardApi";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const BACKGROUNDS = [
  "bg-gradient-to-br from-sky-500 to-indigo-600",
  "bg-gradient-to-br from-pink-500 to-yellow-500",
  "bg-gradient-to-br from-green-400 to-blue-500",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-slate-800 to-sky-900",
];

export function BackgroundSelector({
  currentBoard,
}: {
  currentBoard: Board | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [updateBackground] = useUpdateBoardBackgroundMutation();

  const handleBackgroundChange = async (background: string) => {
    if (!currentBoard?.id) return;

    setSelectedBg(background);
    dispatch(
      boardApi.util.updateQueryData("getBoardById", currentBoard.id, (draft) => {
        draft.background = background;
      })
    );
    setOpen(false);

    try {
      await updateBackground({
        boardId: currentBoard.id,
        background,
      }).unwrap();
    } catch (error: unknown) {
      dispatch(
        boardApi.util.updateQueryData("getBoardById", currentBoard.id, (draft) => {
          draft.background = currentBoard.background || null;
        })
      );
      const errorMessage =
        error instanceof Object &&
        "data" in error &&
        error.data instanceof Object &&
        "message" in error.data
          ? (error.data.message as string)
          : "Failed to update background";
      toast.error(errorMessage);
    } finally {
      setSelectedBg(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 sm:size-9">
              <LuPalette className="size-4 sm:size-5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change Background</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              onClick={() => handleBackgroundChange(bg)}
              disabled={selectedBg !== null}
              className={`relative w-16 h-10 sm:w-20 sm:h-12 rounded-md ${bg} transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                currentBoard?.background === bg && selectedBg === null
                  ? "ring-2 ring-white"
                  : selectedBg === bg
                  ? "ring-2 ring-white animate-pulse"
                  : ""
              }`}
            >
              {currentBoard?.background === bg && selectedBg === null && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LuCheck className="size-5 text-white drop-shadow-md" />
                </span>
              )}
              {selectedBg === bg && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LuCheck className="size-5 text-white drop-shadow-md" />
                </span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
