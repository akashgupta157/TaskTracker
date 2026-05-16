import List from "./List";
import Card from "./Card";
import { Board } from "@/types";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LuPlus } from "react-icons/lu";
import { createPortal } from "react-dom";
import { Skeleton } from "./ui/skeleton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { RiCloseLine } from "react-icons/ri";
import React, { useMemo, useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { moveList, moveCard, addList } from "@/redux/slices/boardSlice";
import type { List as ListType, Card as CardType } from "@/types";
import { useUpdateCardPositionMutation } from "@/redux/api/cardApi";
import {
  useCreateListMutation,
  useUpdateListPositionMutation,
} from "@/redux/api/listApi";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";

export default function ListContainer({
  currentBoard,
  loading,
  isFilterLoading,
}: {
  currentBoard: Board | undefined;
  loading: boolean;
  isFilterLoading: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const [createList] = useCreateListMutation();
  const [updateListPositionMutation] = useUpdateListPositionMutation();
  const [updateCardPositionMutation] = useUpdateCardPositionMutation();

  const [isNewList, setIsNewList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeList, setActiveList] = useState<ListType | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeCardList, setActiveCardList] = useState<ListType | null>(null);

  const listId = useMemo(
    () => currentBoard?.lists?.map((list) => list.id) || [],
    [currentBoard]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const { active, droppableContainers } = args;
    if (active.data.current?.type === "List") {
      const listCollisions = rectIntersection({
        ...args,
        droppableContainers: droppableContainers.filter(
          (container) => container.data.current?.type === "List"
        ),
      });
      if (listCollisions.length > 0) {
        return listCollisions;
      }
      return rectIntersection(args);
    }
    if (active.data.current?.type === "Card") {
      return pointerWithin(args);
    }
    return rectIntersection(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "List") {
      setActiveList(event.active.data.current.list);
      return;
    } else if (event.active.data.current?.type === "Card") {
      setActiveCard(event.active.data.current.card);
      setActiveCardList(event.active.data.current.list);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (active.data.current?.type === "Card") {
      const activeCardData = active.data.current.card;

      if (over.data.current?.type === "Card") {
        const overCardData = over.data.current.card;

        if (
          activeCardData.listId !== overCardData.listId ||
          activeCardData.position !== overCardData.position
        ) {
          dispatch(
            moveCard({
              cardId: activeCardData.id,
              listId: overCardData.listId,
              newPosition: overCardData.position,
            })
          );
        }
      } else if (over.data.current?.type === "List") {
        const overListData = over.data.current.list;
        const newPosition = overListData.cards?.length || 0;

        if (activeCardData.listId !== overListData.id) {
          dispatch(
            moveCard({
              cardId: activeCardData.id,
              listId: overListData.id,
              newPosition,
            })
          );
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveList(null);
    setActiveCard(null);
    setActiveCardList(null);

    if (!over) return;

    if (
      active.data.current?.type === "List" &&
      over.data.current?.type === "List"
    ) {
      const activeListData = active.data.current.list;
      const overListData = over.data.current.list;
      if (activeListData.id !== overListData.id) {
        dispatch(
          moveList({
            listId: activeListData.id,
            newPosition: overListData.position,
          })
        );
        updateListPositionMutation({
          boardId: currentBoard?.id ?? "",
          listId: activeListData.id,
          newPosition: overListData.position,
        });
      }
    }

    if (active.data.current?.type === "Card") {
      const activeCardData = active.data.current.card;

      if (over.data.current?.type === "Card") {
        const overCardData = over.data.current.card;

        updateCardPositionMutation({
          cardId: activeCardData.id,
          listId: overCardData.listId,
          newPosition: overCardData.position,
          boardId: currentBoard?.id,
        });
      } else if (over.data.current?.type === "List") {
        const overListData = over.data.current.list;
        const newPosition = overListData.cards?.length || 0;

        updateCardPositionMutation({
          cardId: activeCardData.id,
          listId: overListData.id,
          newPosition,
          boardId: currentBoard?.id,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    await createList({
      title: newListTitle.trim(),
      position: currentBoard?.lists.length ?? 0,
      boardId: currentBoard?.id ?? "",
    })
      .unwrap()
      .then((data) => {
        const now = new Date().toISOString();
        dispatch(
          addList({ ...data, cards: [], createdAt: now, updatedAt: now })
        );
      });

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
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={listId}>
          {currentBoard?.lists?.map((list) => (
            <List key={list.id} list={list} isFilterLoading={isFilterLoading} />
          ))}
        </SortableContext>

        {createPortal(
          <DragOverlay>
            {activeList && (
              <List list={activeList} isFilterLoading={isFilterLoading} />
            )}
            {activeCard && activeCardList && (
              <Card card={activeCard} list={activeCardList} />
            )}
          </DragOverlay>,
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
