"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import type { Card as CardType, List } from "@/types";
import { toggleCardIsComplete } from "@/redux/slices/boardSlice";
import { useToggleCardCompleteMutation } from "@/redux/api/cardApi";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import {
  LuText,
  LuClock,
  LuCheck,
  LuCircle,
  LuPaperclip,
  LuSquareCheck,
} from "react-icons/lu";

const CardDialog = dynamic(() => import("./CardDialog"), {
  ssr: false,
});

export default function Card({ card, list }: { card: CardType; list: List }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const [toggleComplete] = useToggleCardCompleteMutation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id as string,
    data: {
      type: "Card",
      card,
      list,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const isPast = dueDate ? dueDate.getTime() < now.getTime() : false;
  const isCurrentYear = dueDate?.getFullYear() === now.getFullYear();

  const handleToggleComplete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!card.id || !card.boardId) return;
    dispatch(toggleCardIsComplete({ cardId: card.id }));
    try {
      await toggleComplete(card.id).unwrap();
    } catch {
      // dispatch(toggleCardIsComplete({ cardId: card.id }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          ref={setNodeRef}
          id={card.id as string}
          style={style}
          {...attributes}
          {...listeners}
          className={`space-y-2 bg-card/60 p-3 border-2 rounded-xl font-sans cursor-pointer border-muted hover:border-white ${
            isDragging ? "opacity-50" : ""
          }`}
        >
          {(card.description && card.description !== "<p></p>") ||
          card.checklist?.length ||
          card.attachments?.length ||
          card.priority ? (
            <div className="flex items-center gap-2">
              {card.priority && (
                <span
                  className={`text-xs px-3 rounded font-semibold text-card ${
                    card.priority === "HIGH"
                      ? "bg-red-500"
                      : card.priority === "MEDIUM"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {card.priority}
                </span>
              )}

              {card.description && card.description !== "<p></p>" && (
                <Tooltip>
                  <TooltipTrigger>
                    <LuText />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This card has a description</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {card.checklist?.length ? (
                <Tooltip>
                  <TooltipTrigger>
                    <LuSquareCheck />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This card has a checklist</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}

              {card.attachments?.length ? (
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <LuPaperclip />
                    <span className="text-xs">{card.attachments.length}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This card has {card.attachments.length} attachments</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-start gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="relative cursor-pointer"
                  onClick={handleToggleComplete}
                >
                  {card.isCompleted ? (
                    <>
                      <LuCircle
                        className="size-5 text-[#2abb7f]"
                        fill="#2abb7f"
                      />
                      <LuCheck
                        className="top-[calc(50%-6px)] left-[calc(50%-6px)] absolute size-3 text-background"
                        strokeWidth={4}
                      />
                    </>
                  ) : (
                    <LuCircle className="size-5 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{card.isCompleted ? "Mark incomplete" : "Mark completed"}</p>
              </TooltipContent>
            </Tooltip>

            <p className="text-sm break-words line-clamp-100">{card.title}</p>
          </div>

          {dueDate || card.assignees?.length ? (
            <div
              className={`flex ${
                card.dueDate ? "justify-between" : "justify-end"
              } items-center gap-2`}
            >
              {dueDate && (
                <span
                  className={`flex items-center gap-1.5 text-muted-foreground ${
                    isPast && "bg-[#5c1e1a] px-1 rounded"
                  }`}
                >
                  <LuClock />
                  <p className="text-sm">
                    {dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      ...(isCurrentYear ? {} : { year: "numeric" }),
                    })}
                  </p>
                </span>
              )}

              {card.assignees?.length ? (
                <div className="flex items-center -space-x-2">
                  {card.assignees.map((a, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger className="cursor-pointer">
                        <Image
                          src={a.boardMember.user.image || "/logo.png"}
                          alt={a.boardMember.user.name || "user"}
                          width={24}
                          height={24}
                          className="border rounded-full"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{a.boardMember.user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle />
          <CardDialog
            list={list}
            cardData={card}
            isNew={false}
            setDialogOpen={setOpen}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
