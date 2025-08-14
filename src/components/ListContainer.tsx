import List from "./List";
import { Board } from "@/types";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LuPlus } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { RiCloseLine } from "react-icons/ri";
import React, { useState } from "react";
import {
  moveList,
  addNewList,
  updateListPosition,
} from "@/redux/slices/boardSlice";

export default function ListContainer({
  currentBoard,
  loading,
}: {
  currentBoard: Board | null;
  loading: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [isNewList, setIsNewList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      addNewList({
        title: newListTitle.trim(),
        position: currentBoard?.lists.length ?? 0,
        boardId: currentBoard?.id ?? "",
      })
    );
    setNewListTitle("");
    setIsNewList(false);
  };

  return (
    <div className="p-5 w-full h-full overflow-x-auto font-sans">
      {loading ? null : (
        <div className="flex items-start space-x-5">
          {currentBoard?.lists.map((list) => (
            <List key={list.id} list={list} />
          ))}

          {isNewList ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-2 bg-zinc-100 dark:bg-zinc-950 p-3 rounded-md min-w-[280px] font-sans"
            >
              <Input
                required
                autoFocus
                placeholder="Enter list title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button type="submit">Add List</Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsNewList(false)}
                >
                  <RiCloseLine className="size-5" />
                </Button>
              </div>
            </form>
          ) : (
            <Button
              className="flex justify-start bg-white/50 min-w-[250px]"
              onClick={() => setIsNewList(true)}
            >
              <LuPlus /> Add another list
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
