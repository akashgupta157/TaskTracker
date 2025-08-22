import List from "./List";
import { Board } from "@/types";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LuPlus } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { RiCloseLine } from "react-icons/ri";
import React, { useMemo, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import {
  moveList,
  addNewList,
  updateListPosition,
} from "@/redux/slices/boardSlice";
import type { List as ListType } from "@/types";
import { createPortal } from "react-dom";

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
  const [activeList, setActiveList] = useState<ListType | null>(null);

  const listId = useMemo(
    () => currentBoard?.lists.map((list) => list.id) || [],
    [currentBoard]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "List") {
      setActiveList(event.active.data.current.list);
    }
  };

  // const handleDragOver = (event: ) => {}

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveList(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (
      active.data.current?.type === "List" &&
      over.data.current?.type === "List"
    ) {
      dispatch(
        moveList({
          listId: active.data.current.list.id,
          newPosition: over.data.current.list.position,
        })
      );
      dispatch(
        updateListPosition({
          boardId: currentBoard?.id ?? "",
          listId: active.data.current.list.id,
          newPosition: over.data.current.list.position,
        })
      );
    }
  };

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

  if (loading) {
    return (
      <div className="p-5 w-full h-full overflow-x-auto font-sans">
        <div className="flex items-start space-x-5">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="bg-zinc-200 dark:bg-zinc-800 rounded-md w-72 h-40"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-5 p-5 w-full h-full overflow-x-auto font-sans">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        // onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={listId}>
          {currentBoard?.lists.map((list) => (
            <List key={list.id} list={list} />
          ))}
        </SortableContext>

        {createPortal(
          <DragOverlay>{activeList && <List list={activeList} />}</DragOverlay>,
          document.body
        )}
      </DndContext>

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
  );
}
