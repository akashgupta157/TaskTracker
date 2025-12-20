import Card from "./Card";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { List } from "@/types";
import { Button } from "./ui/button";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "./ui/skeleton";
import { InlineEdit } from "./InlineEdit";
import { useDispatch } from "react-redux";
import React, { useMemo, useState } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useSearchParams } from "next/navigation";
import { deleteList, modifyListTitle } from "@/redux/slices/boardSlice";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import {
  useUpdateListTitleMutation,
  useDeleteListMutation,
} from "@/redux/api/listApi";
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

export default function List({
  list,
  isFilterLoading,
}: {
  list: List;
  isFilterLoading: boolean;
}) {
  const { size } = useSearchParams();
  const dispatch = useDispatch();

  const [updateListTitleMutation] = useUpdateListTitleMutation();
  const [deleteListMutation] = useDeleteListMutation();

  const [open, setOpen] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const cardIds = useMemo(
    () => list.cards?.map((card) => card.id) || [],
    [list.cards]
  );

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
    updateListTitleMutation({
      listId: list.id,
      boardId: list.boardId,
      title: listTitle,
    });
  };

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting list...");
    try {
      await deleteListMutation({
        listId: list.id,
        boardId: list.boardId,
      }).unwrap();
      dispatch(deleteList({ listId: list.id }));
      toast.success("List deleted successfully!", { id: toastId });
    } catch {
      toast.error("Failed to delete list.", { id: toastId });
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
      className={`flex flex-col bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl min-w-[280px] max-h-[calc(100vh-172px)] ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex justify-between items-center cursor-grab"
      >
        <InlineEdit
          value={listTitle}
          onChange={setListTitle}
          onCommit={handleTitleChange}
          className="px-2 font-bold"
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
                This will permanently delete this list and its cards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 space-y-3 my-2 overflow-hidden overflow-y-auto">
        {isFilterLoading ? (
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
            <CardDialog list={list} isNew setDialogOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
