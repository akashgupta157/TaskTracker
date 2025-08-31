import { toast } from "sonner";
import Image from "next/image";
import RTEditor from "./RTEditor";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loading } from "./Loading";
import { Button } from "./ui/button";
import { formatDate } from "date-fns";
import { Checkbox } from "./ui/checkbox";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { InlineEdit } from "./InlineEdit";
import { Separator } from "./ui/separator";
import { uploadSupabase } from "@/lib/utils";
import { BoardMember, Card, List } from "@/types";
import React, { useState, useCallback } from "react";
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
  LuCircle,
  LuTrash2,
  LuCaptions,
  LuPaperclip,
  LuUsersRound,
  LuArrowUpDown,
  LuChevronDown,
  LuCalendarRange,
  LuSquareCheckBig,
} from "react-icons/lu";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
    assignees:
      cardData?.assignees?.map(
        (assignee: { boardMember: BoardMember }) => assignee.boardMember
      ) || [],
  });

  const [boardMember, setBoardMember] = useState(
    currentBoard?.members.filter(
      (member) =>
        !cardDetails.assignees
          .map((assignee) => assignee.userId)
          .includes(member.userId)
    ) || []
  );

  const handleChange = useCallback(
    <T extends keyof typeof cardDetails>(
      field: T,
      value: (typeof cardDetails)[T] | string | null
    ) => {
      setCardDetails((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleDateSubmit = useCallback(
    (date: Date) => {
      handleChange("dueDate", date.toISOString());
      setOpen(false);
    },
    [handleChange]
  );

  const handleAddChecklist = useCallback(() => {
    setCardDetails((prev) => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        {
          id: generateId(),
          title: "",
          isChecked: false,
        },
      ],
    }));
  }, []);

  const handleChecklistChange = useCallback(
    (id: string, field: "isChecked" | "title", value: string | boolean) => {
      setCardDetails((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  const handleRemoveChecklistItem = useCallback((id: string) => {
    setCardDetails((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  }, []);

  const handleAttachmentUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      event.target.value = "";
      setIsUploading(true);

      const toastId = toast.loading(`Uploading ${file.name}...`);

      try {
        const result = await uploadSupabase(file);
        setCardDetails((prev) => ({
          ...prev,
          attachments: [...prev.attachments, { name: file.name, url: result }],
        }));

        toast.success(`File uploaded successfully!`, { id: toastId });
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"
          }`,
          { id: toastId }
        );
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const handleRemoveAttachment = useCallback((index: number) => {
    setCardDetails((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAssigneeChange = useCallback(
    (boardMember: BoardMember) => {
      const isAlreadyAssigned = cardDetails.assignees.some(
        (assignee) => assignee.userId === boardMember.userId
      );

      if (isAlreadyAssigned) {
        setCardDetails((prev) => ({
          ...prev,
          assignees: prev.assignees.filter(
            (assignee) => assignee.userId !== boardMember.userId
          ),
        }));
        setBoardMember((prev) => [...prev, boardMember]);
      } else {
        setCardDetails((prev) => ({
          ...prev,
          assignees: [...prev.assignees, boardMember],
        }));
        setBoardMember((prev) =>
          prev.filter((member) => member.userId !== boardMember.userId)
        );
      }
    },
    [cardDetails.assignees]
  );

  const handleSubmit = useCallback(async () => {
    if (!cardDetails.title.trim()) {
      toast.error("Card title is required");
      return;
    }

    const cleanCard = Object.fromEntries(
      Object.entries(cardDetails).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    ) as Card;

    const newPosition =
      cardDetails.listId !== cardData?.listId
        ? currentBoard?.lists.find((l) => l.id === cardDetails.listId)?.cards
          ?.length || 0
        : cardData?.position;

    try {
      if (isNew) {
        await dispatch(
          addNewCard({
            ...cleanCard,
            position: newPosition,
          })
        );
        toast.success("Card created successfully");
      } else {
        await dispatch(
          reviseCard({
            ...cardData,
            ...cleanCard,
            position: newPosition,
          })
        );
        toast.success("Card updated successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save card");
    }
  }, [cardDetails, cardData, currentBoard, isNew, dispatch, setDialogOpen]);

  const handleDelete = useCallback(async () => {
    if (!cardData) return;

    try {
      setDialogOpen(false);
      await dispatch(deleteCard(cardData.id as string));
      toast.success("Card deleted successfully");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  }, [cardData, dispatch, setDialogOpen]);

  return (
    <>
      <div className="flex justify-between items-center">
        <Select
          value={cardDetails.listId}
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
                className="mr-2 sm:mr-4 text-destructive hover:text-destructive/80"
              >
                <LuTrash2 /> <p className="hidden sm:inline">Delete Card</p>
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

      <div className="flex lg:flex-row flex-col gap-4">
        <div className="flex-1 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                {cardDetails.isCompleted ? (
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
                <p>
                  {cardDetails.isCompleted
                    ? "Mark incomplete"
                    : "Mark completed"}
                </p>
              </TooltipContent>
            </Tooltip>

            <LuCaptions className="size-6" />
            <InlineEdit
              value={cardDetails.title}
              onChange={(value) => handleChange("title", value)}
              className="font-medium text-xl sm:text-2xl"
            />
          </div>
          <div className="md:hidden">
            <SidebarActions
              priority={cardDetails.priority}
              dueDate={cardDetails.dueDate}
              onPriorityChange={(value) => handleChange("priority", value)}
              onDueDateChange={handleDateSubmit}
              onAddChecklist={handleAddChecklist}
              onAttachmentUpload={handleAttachmentUpload}
              isUploading={isUploading}
              boardMembers={boardMember}
              assignees={cardDetails.assignees}
              handleAssigneeChange={handleAssigneeChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LuText className="size-5" />
              <span className="font-semibold">Description</span>
            </div>
            <RTEditor
              value={cardDetails.description}
              onChange={(value) => handleChange("description", value)}
            />
          </div>

          {cardDetails.assignees.length > 0 && (
            <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg">
              <LuUsersRound className="flex-shrink-0 size-4 text-muted-foreground" />
              <div className="flex items-center -space-x-2">
                {cardDetails.assignees.slice(0, 4).map((assignee) => (
                  <Tooltip key={assignee.userId}>
                    <TooltipTrigger asChild>
                      <Image
                        src={assignee.user?.image || "/default-avatar.png"}
                        alt={assignee.user?.name || "User"}
                        width={28}
                        height={28}
                        className="hover:z-10 border-2 border-background rounded-full hover:scale-110 transition-transform"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-sm">{assignee.user?.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {cardDetails.assignees.length > 4 && (
                <div className="flex justify-center items-center bg-muted rounded-full w-7 h-7 font-medium text-xs">
                  +{cardDetails.assignees.length - 4}
                </div>
              )}
              <span className="ml-1 text-muted-foreground text-sm">
                {cardDetails.assignees.length} {cardDetails.assignees.length === 1 ? 'assignee' : 'assignees'}
              </span>
            </div>
          )}

          <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
            {cardDetails.priority && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-full ${cardDetails.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : cardDetails.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                        }`}
                    >
                      <LuArrowUpDown className="size-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Priority</p>
                      <p
                        className={`font-semibold ${cardDetails.priority === "HIGH"
                          ? "text-red-600"
                          : cardDetails.priority === "MEDIUM"
                            ? "text-yellow-600"
                            : "text-green-600"
                          }`}
                      >
                        {cardDetails.priority}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleChange("priority", null)}
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                  >
                    <LuX className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {cardDetails.dueDate && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 mt-1.5 p-2 rounded-full text-blue-600">
                      <LuCalendarRange className="size-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Due Date</p>
                      <p className="font-semibold">
                        {formatDate(cardDetails.dueDate, "dd/MM/yyyy")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(cardDetails.dueDate, "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleChange("dueDate", null)}
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                  >
                    <LuX className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {cardDetails.checklist.length > 0 && (
              <div className="md:col-span-2 bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                      <LuSquareCheckBig className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Checklist</p>
                      <p className="text-muted-foreground text-sm">
                        {
                          cardDetails.checklist.filter((item) => item.isChecked)
                            .length
                        }{" "}
                        of {cardDetails.checklist.length} completed
                      </p>
                    </div>
                  </div>

                  <div className="md:hidden bg-gray-200 rounded-full w-24 h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{
                        width: `${(cardDetails.checklist.filter(
                          (item) => item.isChecked
                        ).length /
                          cardDetails.checklist.length) *
                          100
                          }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="hidden md:block bg-gray-200 mb-3 rounded-full w-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{
                      width: `${(cardDetails.checklist.filter((item) => item.isChecked)
                        .length /
                        cardDetails.checklist.length) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>

                <div className="space-y-2">
                  {cardDetails.checklist.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onChange={handleChecklistChange}
                      onRemove={handleRemoveChecklistItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {cardDetails.attachments.length > 0 && (
              <div className="md:col-span-2 bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-cyan-100 p-2 rounded-full text-cyan-600">
                    <LuPaperclip className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Attachments</p>
                    <p className="text-muted-foreground text-sm">
                      {cardDetails.attachments.length} files
                    </p>
                  </div>
                </div>

                <div className="gap-2 grid grid-cols-1 sm:grid-cols-2">
                  {cardDetails.attachments.map((attachment, index) => (
                    <AttachmentItem
                      key={index}
                      attachment={attachment}
                      onRemove={() => handleRemoveAttachment(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bottom-0 sticky bg-background mt-4 pt-4 pb-2 border-t">
            <Button
              disabled={!cardDetails.title.trim() || cardLoading}
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              {cardLoading ? (
                <Loading />
              ) : isNew ? (
                "Create Card"
              ) : (
                "Update Card"
              )}
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <SidebarActions
            priority={cardDetails.priority}
            dueDate={cardDetails.dueDate}
            onPriorityChange={(value) => handleChange("priority", value)}
            onDueDateChange={handleDateSubmit}
            onAddChecklist={handleAddChecklist}
            onAttachmentUpload={handleAttachmentUpload}
            isUploading={isUploading}
            boardMembers={boardMember}
            assignees={cardDetails.assignees}
            handleAssigneeChange={handleAssigneeChange}
          />
        </div>
      </div>
    </>
  );
}

const ChecklistItem = ({
  item,
  onChange,
  onRemove,
}: {
  item: { id: string; title: string; isChecked: boolean };
  onChange: (
    id: string,
    field: "isChecked" | "title",
    value: string | boolean
  ) => void;
  onRemove: (id: string) => void;
}) => (
  <div className="group flex items-center gap-2">
    <Checkbox
      checked={item.isChecked}
      onCheckedChange={(checked) =>
        onChange(item.id, "isChecked", checked as boolean)
      }
      className="rounded-md w-5 h-5"
    />
    <InlineEdit
      value={item.title}
      onChange={(value) => onChange(item.id, "title", value)}
      className={`flex-1 ${item.isChecked ? "line-through text-muted-foreground" : ""
        }`}
    />
    <Button
      variant="ghost"
      size="icon"
      className="opacity-0 group-hover:opacity-100 w-6 h-6"
      onClick={() => onRemove(item.id)}
    >
      <LuX className="size-4" />
    </Button>
  </div>
);

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: { name: string; url: string };
  onRemove: () => void;
}) => (
  <div className="group flex justify-between items-center gap-2 cursor-pointer">
    <div
      className="flex items-center gap-2"
      onClick={() => window.open(attachment.url, "_blank")}
    >
      <div className="flex justify-center items-center bg-muted-foreground px-1 rounded-md min-w-10 h-10">
        <p className="font-semibold uppercase">
          {attachment.name.split(".").pop()}
        </p>
      </div>
      <span className="block max-w-[180px] font-semibold text-sm truncate">
        {attachment.name}
      </span>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="opacity-0 group-hover:opacity-100 w-6 h-6"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <LuX className="size-4" />
    </Button>
  </div>
);

const SidebarActions = ({
  priority,
  dueDate,
  onPriorityChange,
  onDueDateChange,
  onAddChecklist,
  onAttachmentUpload,
  isUploading,
  boardMembers,
  assignees,
  handleAssigneeChange,
}: {
  priority: string | null;
  dueDate: string | null;
  onPriorityChange: (value: string) => void;
  onDueDateChange: (date: Date) => void;
  onAddChecklist: () => void;
  onAttachmentUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  boardMembers: BoardMember[];
  assignees: BoardMember[];
  handleAssigneeChange: (boardMember: BoardMember) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:flex sm:flex-col gap-2 sm:gap-0 sm:space-y-4 grid grid-cols-2">
      <Select value={priority || ""} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue
            placeholder={
              <div className="flex items-center gap-2">
                <LuArrowUpDown className="size-4" />
                <span>
                  <span className="hidden sm:inline">Select </span>Priority
                </span>
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
              onDueDateChange(data.time);
              setOpen(false);
            }}
            initialDate={dueDate ? new Date(dueDate) : undefined}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        className="flex justify-start items-center w-full font-normal text-muted-foreground hover:text-muted-foreground"
        onClick={onAddChecklist}
      >
        <LuSquareCheckBig className="size-4" />
        <span>Add Checklist</span>
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex justify-start items-center w-full font-normal text-muted-foreground hover:text-muted-foreground"
            disabled={isUploading}
          >
            <LuPaperclip className="size-4" />
            <span>{isUploading ? "Uploading..." : "Attachment"}</span>
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
                  onChange={onAttachmentUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  disabled={isUploading}
                >
                  <span>Choose a file</span>
                </Button>
              </Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex justify-start items-center w-full font-normal text-muted-foreground hover:text-muted-foreground"
          >
            <LuUsersRound className="size-4" />
            <span>Add Assignees</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="space-y-4 p-4 w-80 max-h-80 overflow-y-auto"
          align="start"
        >
          {assignees.length > 0 && (
            <div>
              <Label className="font-semibold tex-sm">Card Members</Label>
              <div className="flex flex-col gap-2 mt-2">
                {assignees.map((member, index) => (
                  <div
                    key={index}
                    className="group flex justify-between items-center gap-2 hover:bg-muted-foreground/10 p-2 rounded-md cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={member?.user?.image || "/public/logo.png"}
                        alt={member?.user?.name || ""}
                        width={25}
                        height={25}
                        className="rounded-full"
                      />
                      <span className="text-sm">{member?.user?.name}</span>
                    </div>
                    <LuX
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleAssigneeChange(member)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {assignees.length > 0 && boardMembers.length > 0 && <Separator />}
          {boardMembers.length > 0 && (
            <div>
              <Label className="font-semibold tex-sm">Board Members</Label>
              <div className="flex flex-col gap-2 mt-2">
                {boardMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 hover:bg-muted-foreground/10 p-2 rounded-md cursor-pointer"
                    onClick={() => handleAssigneeChange(member)}
                  >
                    <Image
                      src={member?.user?.image || "/public/logo.png"}
                      alt={member?.user?.name || ""}
                      width={25}
                      height={25}
                      className="rounded-full"
                    />
                    <span className="text-sm">{member?.user?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
