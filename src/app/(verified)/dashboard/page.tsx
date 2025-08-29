"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { addNewBoard, getBoards } from "@/redux/slices/boardSlice";
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
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading } = useSelector((state: RootState) => state.board);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
  });

  useEffect(() => {
    dispatch(getBoards());
  }, [dispatch]);

  const onSubmit = async (data: BoardFormData) => {
    const { payload: id } = await dispatch(addNewBoard(data));
    router.push(`/board/${id.id}`);
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-10 px-4 sm:px-6 md:px-10 py-10 font-sans">
      <h1 className="font-bold text-4xl">Your Boards</h1>

      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex justify-center items-center bg-foreground/10 hover:bg-foreground/20 rounded-xl w-full h-32 cursor-pointer">
              Create New Board
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5 font-sans">
                <h3 className="font-bold text-center">Create New Board</h3>
                <div className="space-y-2">
                  <Label htmlFor="boardTitle">
                    Board Title <span className="text-red-500">*</span>
                  </Label>
                  <Input id="boardTitle" {...register("title")} />
                  {errors.title && (
                    <p className="text-red-500 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register("description")} />
                </div>
                <Button type="submit" className="w-full">
                  Create Board
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl w-full h-32" />
            ))
          : boards.map((board) => (
              <div
                key={board.id}
                onClick={() => {
                  dispatch({ type: "board/setCurrentBoard", payload: board });
                  router.push(`/board/${board.id}`);
                }}
                className={`rounded-xl w-full h-32 relative shadow-xl dark:[box-shadow:0_0_20px_0_rgba(80,80,80,0.30)] cursor-pointer ${board.background}`}
              >
                <p className="bottom-0 absolute bg-background px-5 py-1.5 rounded-b-xl w-full">
                  {board.title}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}
