import Card from "./Card";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { List } from "@/types";
import { Button } from "./ui/button";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "./ui/skeleton";
import { InlineEdit } from "./InlineEdit";
import React, { useMemo, useState } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { modifyListTitle } from "@/redux/slices/boardSlice";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { deleteList, updateListTitle } from "@/redux/slices/listSlice";
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

const CardDialog = dynamic(() => import("./CardDialog"), {
  ssr: false,
});

export default function List({ list }: { list: List }) {
  const { size } = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { filterLoading } = useSelector((state: RootState) => state.board);

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

  const CardSkeleton = () => (
    <div className="bg-white dark:bg-zinc-900 shadow mb-3 p-3 rounded-lg">
      <Skeleton className="mb-2 w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  );

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
        {filterLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {size > 0 && (
              <p className="text-muted-foreground text-sm text-center">
                {list.cards?.length} cards matches your filter
              </p>
            )}
            <SortableContext items={cardIds}>
              {list.cards?.map((card) => (
                <Card key={card.id} card={card} list={list} />
              ))}
            </SortableContext>
          </>
        )}
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
