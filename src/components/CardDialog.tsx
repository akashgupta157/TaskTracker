import { toast } from "sonner";
import Image from "next/image";
import RTEditor from "./RTEditor";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loading } from "./Loading";
import { Card, List } from "@/types";
import { Button } from "./ui/button";
import { formatDate } from "date-fns";
import React, { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { InlineEdit } from "./InlineEdit";
import { Separator } from "./ui/separator";
import { uploadSupabase } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { DateTimePickerForm } from "./DateTimePickerForm";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { addNewCard, deleteCard, reviseCard } from "@/redux/slices/boardSlice";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  LuX,
  LuText,
  LuCheck,
  LuSearch,
  LuCircle,
  LuCaptions,
  LuPaperclip,
  LuUsersRound,
  LuArrowUpDown,
  LuChevronDown,
  LuCalendarRange,
  LuSquareCheckBig,
  LuTrash2,
} from "react-icons/lu";

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

  const { currentBoard, cardLoading } = useSelector(
    (state: RootState) => state.board
  );
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    title: cardData?.title || "",
    description: cardData?.description || null,
    listId: cardData?.listId || list.id,
    priority: cardData?.priority || null,
    dueDate: cardData?.dueDate || null,
    isCompleted: cardData?.isCompleted || false,
    position: cardData?.position || list.cards?.length || 0,
    checklist: cardData?.checklist || [],
    attachments: cardData?.attachments || [],
  });
  const {
    title,
    description,
    listId,
    priority,
    dueDate,
    isCompleted,
    attachments,
  } = cardDetails;

  const handleChange = <T extends keyof typeof cardDetails>(
    field: T,
    value: (typeof cardDetails)[T] | string | null
  ) => {
    setCardDetails({ ...cardDetails, [field]: value });
  };

  const handleDateSubmit = (date: Date) => {
    handleChange("dueDate", date.toISOString());
    setOpen(false);
  };

  const handleAddChecklist = () => {
    const newChecklist = [
      ...cardDetails.checklist,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: "",
        isChecked: false,
      },
    ];
    setCardDetails({ ...cardDetails, checklist: newChecklist });
  };

  const handleChecklistChange = (
    id: string,
    field: "isChecked" | "title",
    value: string | boolean
  ) => {
    const updatedChecklist = cardDetails.checklist.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setCardDetails({ ...cardDetails, checklist: updatedChecklist });
  };

  const handleRemoveChecklistItem = (id: string) => {
    const filteredChecklist = cardDetails.checklist.filter(
      (item) => item.id !== id
    );
    setCardDetails({ ...cardDetails, checklist: filteredChecklist });
  };

  const handleAttachmentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const result = await uploadSupabase(file);
      const newAttachment = {
        name: file.name,
        url: result,
      };
      const newAttachments = [...cardDetails.attachments, newAttachment];
      setCardDetails({ ...cardDetails, attachments: newAttachments });

      toast.success(`File uploaded successfully!`, { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Failed to upload file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          id: toastId,
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...cardDetails.attachments];
    newAttachments.splice(index, 1);
    setCardDetails({ ...cardDetails, attachments: newAttachments });
  };

  const handleSubmit = async () => {
    const filteredCard = Object.fromEntries(
      Object.entries({
        ...cardDetails,
      }).filter(([_, value]) => value !== null)
    ) as unknown as Card;

    const newPosition =
      listId !== cardData?.listId
        ? currentBoard?.lists.find((l) => l.id === listId)?.cards?.length || 0
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

  const handleDelete = async () => {
    if (cardData) {
      setDialogOpen(false);
      await dispatch(deleteCard(cardData.id as string));
    }
  };
  return (
    <>
      <div className="flex justify-between items-center">
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

        {!isNew && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mr-4 text-destructive hover:text-destructive/80"
              >
                <LuTrash2 /> Delete Card
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your card and remove your data from our servers.
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
        )}
      </div>

      <Separator className="my-1" />

      <div className="flex gap-4">
        <div className="flex-1 max-h-[calc(100vh-160px)] overflow-y-auto">
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
                    priority === "HIGH"
                      ? "text-red-500"
                      : priority === "MEDIUM"
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

          <div className="space-y-2 my-2">
            {cardDetails.checklist.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <LuSquareCheckBig className="size-5" />
                <span className="font-semibold">Checklist</span>
              </div>
            )}

            {cardDetails.checklist.map((item) => (
              <div key={item.id} className="group flex items-center gap-2">
                <Checkbox
                  checked={item.isChecked}
                  onCheckedChange={(checked) =>
                    handleChecklistChange(
                      item.id,
                      "isChecked",
                      checked as boolean
                    )
                  }
                  className="rounded-md w-5 h-5"
                />
                <InlineEdit
                  value={item.title}
                  onChange={(value) =>
                    handleChecklistChange(item.id, "title", value)
                  }
                  className={`flex-1 ${
                    item.isChecked ? "line-through text-muted-foreground" : ""
                  }`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 w-6 h-6"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                >
                  <LuX className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {attachments && attachments.length > 0 && (
            <div className="space-y-2 my-2">
              <div className="flex items-center gap-2 mb-2">
                <LuPaperclip className="size-5" />
                <span className="font-semibold">Attachments</span>
              </div>
              <div className="space-y-3 p-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="group flex justify-between items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        window.open(attachment.url, "_blank");
                      }}
                    >
                      <div className="flex justify-center items-center bg-muted-foreground px-1 rounded-md min-w-10 h-10">
                        <p className="font-semibold uppercase">
                          {attachment.name.split(".")[1]}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        {attachment.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 w-6 h-6"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <LuX className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
            onValueChange={(value) => handleChange("priority", value)}
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
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 w-10 h-3" />
                  <span>High</span>
                </div>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500 w-10 h-3" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem value="LOW">
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

          <Button
            variant="outline"
            className="flex justify-start items-center w-full font-normal text-muted-foreground hover:text-muted-foreground"
            onClick={handleAddChecklist}
          >
            <LuSquareCheckBig className="size-4" />
            <span>Add Checklist</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex justify-start items-center w-full font-normal text-muted-foreground hover:text-muted-foreground"
              >
                <LuPaperclip className="size-4" />
                <span>Attachment</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-80" align="start">
              <div className="space-y-2">
                <Label className="font-semibold">Attach</Label>
                <p className="text-muted-foreground text-sm">
                  Select a file to attach
                </p>
                <div>
                  <Label className="block cursor-pointer">
                    <span className="sr-only">Choose a file</span>
                    <Input
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                      disabled={isUploading}
                    />
                    <Button variant="outline" className="w-full" asChild>
                      <span>Choose a file</span>
                    </Button>
                  </Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
