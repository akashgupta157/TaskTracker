import RTEditor from "./RTEditor";
import { Loading } from "./Loading";
import { Card, List } from "@/types";
import { Button } from "./ui/button";
import { formatDate } from "date-fns";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { InlineEdit } from "./InlineEdit";
import { Separator } from "@/components/ui/separator";
import { AppDispatch, RootState } from "@/redux/store";
import { DateTimePickerForm } from "./DateTimePickerForm";
import { addNewCard, reviseCard } from "@/redux/slices/boardSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LuText,
  LuCheck,
  LuCircle,
  LuCaptions,
  LuArrowUpDown,
  LuChevronDown,
  LuCalendarRange,
  LuX,
} from "react-icons/lu";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

export default function CardDialog({
  list,
  isNew,
  cardData,
  setDialogOpen,
}: {
  list: List;
  isNew: boolean;
  cardData?: Card;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const { currentBoard, cardLoading } = useSelector(
    (state: RootState) => state.board
  );
  const [cardDetails, setCardDetails] = useState({
    title: cardData?.title || "",
    description: cardData?.description || null,
    listId: cardData?.listId || list.id,
    priority: cardData?.priority || null,
    dueDate: cardData?.dueDate || null,
    isCompleted: cardData?.isCompleted || false,
    position: cardData?.position || list.cards.length,
  });
  const { title, description, listId, priority, dueDate, isCompleted } =
    cardDetails;

  const handleChange = <T extends keyof typeof cardDetails>(
    field: T,
    value: (typeof cardDetails)[T] | boolean
  ) => {
    setCardDetails({ ...cardDetails, [field]: value });
  };

  const handleDateSubmit = (date: Date) => {
    handleChange("dueDate", date.toISOString());
    setOpen(false);
  };

  const handleSubmit = async () => {
    const filteredCard = Object.fromEntries(
      Object.entries(cardDetails).filter(([_, value]) => value !== null)
    ) as unknown as Card;

    const newPosition =
      listId !== cardData?.listId
        ? currentBoard?.lists.find((l) => l.id === listId)?.cards.length || 0
        : cardData?.position;

    if (isNew) {
      await dispatch(
        addNewCard({
          ...filteredCard,
          position: newPosition,
        })
      );
      setDialogOpen(false);
    } else {
      await dispatch(
        reviseCard({
          ...cardData,
          ...filteredCard,
          position: newPosition,
          listId,
          dueDate,
          priority,
          isCompleted,
        })
      );
      setDialogOpen(false);
    }
  };
  return (
    <>
      <Select
        value={listId}
        onValueChange={(value) => handleChange("listId", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent>
          {currentBoard?.lists.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator className="my-1" />

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                {isCompleted ? (
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handleChange("isCompleted", false)}
                  >
                    <LuCircle
                      className="size-5 text-[#2abb7f]"
                      fill="#2abb7f"
                    />
                    <LuCheck
                      className="top-[calc(50%-6px)] left-[calc(50%-6px)] absolute size-3 text-background"
                      strokeWidth={4}
                    />
                  </div>
                ) : (
                  <LuCircle
                    className="size-5 cursor-pointer"
                    onClick={() => handleChange("isCompleted", true)}
                  />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCompleted ? "Mark incomplete" : "Mark completed"}</p>
              </TooltipContent>
            </Tooltip>

            <LuCaptions className="size-6" />
            <InlineEdit
              value={title}
              onChange={(value) => handleChange("title", value)}
              className="font-medium text-2xl"
            />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <LuText className="size-5" />
              <span className="font-semibold">Description</span>
            </div>
            <RTEditor
              value={description}
              onChange={(value) => handleChange("description", value)}
            />
          </div>

          {priority && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <LuArrowUpDown className="size-5" />
                  <span className="font-semibold">Priority:</span>
                </div>
                <p
                  className={`font-bold ${
                    priority === "High"
                      ? "text-red-500"
                      : priority === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {priority}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleChange("priority", null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <LuX className="size-5" />
              </Button>
            </div>
          )}

          {dueDate && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LuCalendarRange className="size-5" />
                <span className="font-semibold">Due Date:</span>
                <p className="font-semibold">
                  {formatDate(dueDate, "dd/MM/yyyy hh:mm a")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleChange("dueDate", null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <LuX className="size-5" />
              </Button>
            </div>
          )}

          <Button
            disabled={!title.trim() || cardLoading}
            onClick={handleSubmit}
            className="mt-4"
          >
            {cardLoading ? <Loading /> : isNew ? "Create Card" : "Update Card"}
          </Button>
        </div>

        <div className="space-y-4">
          <Select
            value={priority || ""}
            onValueChange={(value) => handleChange("priority", value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={
                  <div className="flex items-center gap-2">
                    <LuArrowUpDown className="size-4" />
                    <span>Select Priority</span>
                  </div>
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 w-10 h-3" />
                  <span>High</span>
                </div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500 w-10 h-3" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem value="Low">
                <div className="flex items-center gap-2">
                  <span className="bg-green-500 w-10 h-3" />
                  <span>Low</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex justify-between w-full font-normal text-muted-foreground hover:text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <LuCalendarRange className="size-4" />
                  <span>Set Due Date</span>
                </div>
                <LuChevronDown className="opacity-50 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="">
              <DateTimePickerForm
                onSubmit={(data) => {
                  handleDateSubmit(data.time);
                }}
                initialDate={dueDate ? new Date(dueDate) : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
