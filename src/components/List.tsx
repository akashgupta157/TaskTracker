import Card from "./Card";
import type { List } from "@/types";
import { Button } from "./ui/button";
import CardDialog from "./CardDialog";
import React, { useState } from "react";
import { LuPlus, LuEllipsis } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InlineEdit } from "./InlineEdit";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { modifyListTitle, updateListTitle } from "@/redux/slices/boardSlice";

export default function List({ list }: { list: List }) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const handleTitleChange = () => {
    if (listTitle === list.title) return;
    dispatch(modifyListTitle({ listId: list.id, title: listTitle }));
    dispatch(updateListTitle({ listId: list.id, title: listTitle }));
  };
  return (
    <div
      className={`flex flex-col bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl min-w-[280px] max-h-[calc(100vh-160px)] font-sans`}
    >
      <div className="flex justify-between items-center cursor-grab active:cursor-grabbing">
        <InlineEdit
          value={listTitle}
          onChange={setListTitle}
          onCommit={handleTitleChange}
          className="px-2 font-bold cursor-pointer"
        />
        <Button variant="ghost" type="button" size="icon">
          <LuEllipsis className="size-5" />
        </Button>
      </div>

      <div className="flex-1 space-y-3 my-2 overflow-hidden overflow-y-auto">
        {list.cards?.map((card) => (
          <Card key={card.id} card={card} list={list} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex justify-start w-full" variant="ghost">
            <LuPlus /> Add a card
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle />
            <CardDialog list={list} isNew={true} setDialogOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
