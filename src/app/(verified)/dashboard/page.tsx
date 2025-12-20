"use client";

import { z } from "zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCurrentBoard } from "@/redux/slices/boardSlice";
import {
  useGetBoardsQuery,
  useCreateBoardMutation,
} from "@/redux/api/boardApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const boardSchema = z.object({
  title: z.string().min(1, "Board name is required"),
  description: z.string(),
});

type BoardFormData = z.infer<typeof boardSchema>;

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const { data: boards = [], isLoading } = useGetBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
  });

  const onSubmit = async (data: BoardFormData) => {
    try {
      const board = await createBoard(data).unwrap();
      reset();
      setOpen(false);
      router.push(`/board/${board.id}`);
    } catch (error) {
      console.error("Failed to create board", error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 px-3 sm:px-4 md:px-6 lg:px-10 py-6 md:py-10 font-sans">
      <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
        Your Boards
      </h1>

      <div className="gap-4 sm:gap-5 md:gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex justify-center items-center bg-foreground/10 hover:bg-foreground/20 rounded-xl w-full h-28 sm:h-32 text-sm sm:text-base cursor-pointer">
              Create New Board
            </button>
          </PopoverTrigger>

          <PopoverContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 sm:space-y-5 font-sans">
                <h3 className="font-bold text-lg sm:text-xl text-center">
                  Create New Board
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="boardTitle">
                    Board Title <span className="text-red-500">*</span>
                  </Label>
                  <Input id="boardTitle" {...register("title")} />
                  {errors.title && (
                    <p className="text-red-500 text-xs">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register("description")} />
                </div>

                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl w-full h-28 sm:h-32" />
            ))
          : boards.map((board) => (
              <div
                key={board.id}
                onClick={() => {
                  dispatch(setCurrentBoard(board));
                  router.push(`/board/${board.id}`);
                }}
                className={`rounded-xl w-full h-28 sm:h-32 relative shadow-xl cursor-pointer ${board.background}`}
              >
                <p className="bottom-0 absolute bg-background px-3 py-1.5 rounded-b-xl w-full">
                  {board.title}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}
