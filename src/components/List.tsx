import Card from "./Card";
import type { List } from "@/types";
import { Button } from "./ui/button";
import CardDialog from "./CardDialog";
import { CSS } from "@dnd-kit/utilities";
import { InlineEdit } from "./InlineEdit";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import React, { useMemo, useState } from "react";
import { LuPlus, LuEllipsis, LuTrash2 } from "react-icons/lu";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { modifyListTitle, updateListTitle } from "@/redux/slices/boardSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function List({ list }: { list: List }) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const cardIds = useMemo(() => {
    return list.cards?.map((card) => card.id as string) || [];
  }, [list.cards]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: "List", list } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleTitleChange = () => {
    if (listTitle === list.title) return;
    dispatch(modifyListTitle({ listId: list.id, title: listTitle }));
    dispatch(updateListTitle({ listId: list.id, title: listTitle }));
  };
  const handleDeleteList = () => {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      data-list-id={list.id}
      data-type="List"
      className={`flex flex-col bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl min-w-[280px] max-h-[calc(100vh-172px)] font-sans ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex justify-between items-center cursor-grab active:cursor-grabbing"
      >
        <InlineEdit
          value={listTitle}
          onChange={setListTitle}
          onCommit={handleTitleChange}
          className="px-2 font-bold cursor-pointer"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <LuEllipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={handleDeleteList}
              className="text-red-600 focus:text-red-600 dark:focus:text-red-400 dark:text-red-400 cursor-pointer"
            >
              <LuTrash2 className="text-red-600 dark:text-red-400" /> Delete
              list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 space-y-3 my-2 overflow-hidden overflow-y-auto">
        <SortableContext items={cardIds}>
          {list.cards?.map((card) => (
            <Card key={card.id} card={card} list={list} />
          ))}
        </SortableContext>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex justify-start w-full" variant="ghost">
            <LuPlus /> Add a card
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle />
            <CardDialog list={list} isNew={true} setDialogOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
