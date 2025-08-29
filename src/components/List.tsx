import Card from "./Card";
import type { List } from "@/types";
import { Button } from "./ui/button";
import CardDialog from "./CardDialog";
import { CSS } from "@dnd-kit/utilities";
import { InlineEdit } from "./InlineEdit";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import React, { useMemo, useState } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import {
  deleteList,
  modifyListTitle,
  updateListTitle,
} from "@/redux/slices/boardSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "./ui/alert-dialog";
import { toast } from "sonner";

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
  const handleDelete = async () => {
    try {
      const toastId = toast.loading("Deleting list...");
      await dispatch(deleteList(list.id as string));
      toast.success("List deleted successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete list.");
    }
  };
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <LuTrash2 className="text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                list and cards within it from your board.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/80"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
