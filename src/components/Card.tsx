import CardDialog from "./CardDialog";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Card as CardType, List } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toggleCard, toggleCardIsComplete } from "@/redux/slices/boardSlice";
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

export default function Card({ card, list }: { card: CardType; list: List }) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);

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

  const dueDate = new Date(card.dueDate || "");
  const istNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const isPast = dueDate.getTime() < istNow.getTime();
  const isCurrentYear = dueDate.getFullYear() === istNow.getFullYear();

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.id) return;
    dispatch(toggleCardIsComplete({ cardId: card.id }));
    dispatch(toggleCard(card.id));
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
          (card.checklist && card.checklist.length > 0) ||
          card.attachments ||
          card.priority ? (
            <div className="flex items-center gap-2">
              {card.priority && (
                <span
                  className={`text-xs px-3 rounded w-fit text-card font-semibold ${
                    card.priority === "High"
                      ? "bg-red-500"
                      : card.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {card.priority}
                </span>
              )}

              {card.description && card.description !== "<p></p>" && (
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer">
                    <LuText />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This card has a description</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {card.checklist && card.checklist.length > 0 && (
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer">
                    <LuSquareCheck />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This card has a checklist</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {Array.isArray(card.attachments) &&
                card.attachments.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <LuPaperclip />
                      <p>{card.attachments.length}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This card has attachments</p>
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>
          ) : null}

          <div className="flex flex-row items-start gap-2">
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

          {card.dueDate || card.assignedTo ? (
            <div className="flex items-center gap-2">
              {card.dueDate && (
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
              {/* {card.assignedTo && (
                <p className="">Assigned to: {card.assignedTo}</p>
              )} */}
            </div>
          ) : null}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
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
