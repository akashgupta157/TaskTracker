import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loading } from "./Loading";
import { Button } from "./ui/button";
import { formatDate } from "date-fns";
import { Checkbox } from "./ui/checkbox";
import { InlineEdit } from "./InlineEdit";
import { RootState } from "@/redux/store";
import { Separator } from "./ui/separator";
import { uploadSupabase } from "@/lib/utils";
import { BoardMember, Card, List } from "@/types";
import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DateTimePickerForm } from "./DateTimePickerForm";
import { addCard, modifyCard, removeCard } from "@/redux/slices/boardSlice";
import { CardComments } from "./CardComments";
import { CardActivity } from "./CardActivity";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} from "@/redux/api/cardApi";
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
  LuFlag,
  LuCheck,
  LuCircle,
  LuTrash2,
  LuPaperclip,
  LuUsersRound,
  LuChevronDown,
  LuCalendarRange,
  LuSquareCheckBig,
  LuListChecks,
  LuFile,
  LuMessageSquare,
  LuActivity,
} from "react-icons/lu";

const RTEditor = dynamic(() => import("./RTEditor"), {
  ssr: false,
});

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const PRIORITY_STYLES: Record<
  string,
  { dot: string; text: string; bg: string; ring: string }
> = {
  HIGH: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    ring: "ring-red-200 dark:ring-red-500/20",
  },
  MEDIUM: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    ring: "ring-amber-200 dark:ring-amber-500/20",
  },
  LOW: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    ring: "ring-emerald-200 dark:ring-emerald-500/20",
  },
};

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
  const dispatch = useDispatch();
  const { currentBoard } = useSelector((state: RootState) => state.board);

  const [createCard, { isLoading: creating }] = useCreateCardMutation();
  const [updateCard, { isLoading: updating }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleting }] = useDeleteCardMutation();

  const cardLoading = creating || updating || deleting;

  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    title: cardData?.title || "",
    description: cardData?.description || null,
    listId: cardData?.listId || list.id,
    priority: cardData?.priority || null,
    dueDate: cardData?.dueDate || null,
    isCompleted: cardData?.isCompleted || false,
    position: isNew ? list.cards.length : cardData?.position,
    checklist: cardData?.checklist || [],
    attachments: cardData?.attachments || [],
    assignees:
      cardData?.assignees?.map(
        (assignee: { boardMember: BoardMember }) => assignee.boardMember,
      ) || [],
    boardId: currentBoard?.id,
  });

  const [boardMember, setBoardMember] = useState(
    currentBoard?.members.filter(
      (member) =>
        !cardDetails.assignees
          .map((assignee) => assignee.userId)
          .includes(member.userId),
    ) || [],
  );

  const handleChange = useCallback(
    <T extends keyof typeof cardDetails>(
      field: T,
      value: (typeof cardDetails)[T] | string | null,
    ) => {
      setCardDetails((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleDateSubmit = useCallback(
    (date: Date) => {
      handleChange("dueDate", date.toISOString());
      setOpen(false);
    },
    [handleChange],
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
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [],
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
          `Failed to upload file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          { id: toastId },
        );
      } finally {
        setIsUploading(false);
      }
    },
    [],
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
        (assignee) => assignee.userId === boardMember.userId,
      );

      if (isAlreadyAssigned) {
        setCardDetails((prev) => ({
          ...prev,
          assignees: prev.assignees.filter(
            (assignee) => assignee.userId !== boardMember.userId,
          ),
        }));
        setBoardMember((prev) => [...prev, boardMember]);
      } else {
        setCardDetails((prev) => ({
          ...prev,
          assignees: [...prev.assignees, boardMember],
        }));
        setBoardMember((prev) =>
          prev.filter((member) => member.userId !== boardMember.userId),
        );
      }
    },
    [cardDetails.assignees],
  );

  const handleSubmit = useCallback(async () => {
    if (!cardDetails.title.trim()) {
      toast.error("Card title is required");
      return;
    }
    try {
      if (isNew) {
        await createCard(cardDetails as Card)
          .unwrap()
          .then((data) => dispatch(addCard(data)));
        toast.success("Card created successfully");
      } else {
        await updateCard({
          ...cardData,
          ...cardDetails,
        } as Card)
          .unwrap()
          .then((data) => dispatch(modifyCard(data)));
        toast.success("Card updated successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save card");
    }
  }, [
    cardDetails,
    cardData,
    isNew,
    setDialogOpen,
    createCard,
    updateCard,
    dispatch,
  ]);

  const handleDelete = useCallback(async () => {
    if (!cardData) return;

    try {
      setDialogOpen(false);
      await deleteCard({
        cardId: cardData.id,
        boardId: currentBoard?.id,
      }).unwrap();
      dispatch(removeCard({ cardId: cardData.id }));
      toast.success("Card deleted successfully");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  }, [cardData, setDialogOpen, currentBoard?.id, deleteCard, dispatch]);

  const checklistDone = cardDetails.checklist.filter((i) => i.isChecked).length;
  const checklistTotal = cardDetails.checklist.length;
  const checklistPct = checklistTotal
    ? (checklistDone / checklistTotal) * 100
    : 0;

  return (
    <>
      {/* Header bar */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground text-xs uppercase tracking-wider hidden sm:inline">
            In list
          </span>
          <Select
            value={cardDetails.listId}
            onValueChange={(value) => handleChange("listId", value)}
          >
            <SelectTrigger className="h-8 text-sm font-medium border-dashed">
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
        </div>

        {!isNew && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LuTrash2 className="size-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The card and all its data will
                  be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Separator className="my-3" />

      <div className="flex lg:flex-row flex-col gap-6">
        {/* Main column */}
        <div className="flex-1 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] hover:scrollbar-thumb-[var(--scrollbar-thumb-hover)] scrollbar-track-transparent">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    handleChange("isCompleted", !cardDetails.isCompleted)
                  }
                  className="mt-1 shrink-0"
                  aria-label={
                    cardDetails.isCompleted
                      ? "Mark incomplete"
                      : "Mark completed"
                  }
                >
                  {cardDetails.isCompleted ? (
                    <div className="relative">
                      <LuCircle
                        className="size-6 text-emerald-500"
                        fill="currentColor"
                      />
                      <LuCheck
                        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute size-3.5 text-white"
                        strokeWidth={4}
                      />
                    </div>
                  ) : (
                    <LuCircle className="size-6 text-muted-foreground hover:text-emerald-500 transition-colors" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {cardDetails.isCompleted
                    ? "Mark incomplete"
                    : "Mark completed"}
                </p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1 min-w-0">
              <InlineEdit
                value={cardDetails.title}
                onChange={(value) => handleChange("title", value)}
                className={`font-semibold text-xl sm:text-2xl block leading-tight ${
                  cardDetails.isCompleted
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              />
              <p className="mt-1 text-muted-foreground text-xs">
                Click the title to edit
              </p>
            </div>
          </div>

          {/* Mobile sidebar */}
          <div className="lg:hidden">
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

          {/* Quick-info chips */}
          {(cardDetails.priority ||
            cardDetails.dueDate ||
            cardDetails.assignees.length > 0) && (
            <div className="flex flex-wrap gap-2 pl-0.5">
              {cardDetails.priority && (
                <button
                  type="button"
                  onClick={() => handleChange("priority", null)}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                    PRIORITY_STYLES[cardDetails.priority].bg
                  } ${PRIORITY_STYLES[cardDetails.priority].text} ${
                    PRIORITY_STYLES[cardDetails.priority].ring
                  }`}
                >
                  <LuFlag className="size-3" />
                  {cardDetails.priority}
                  <LuX className="opacity-50 group-hover:opacity-100 size-3" />
                </button>
              )}
              {cardDetails.dueDate && (
                <button
                  type="button"
                  onClick={() => handleChange("dueDate", null)}
                  className="group inline-flex items-center gap-1.5 bg-accent/60 ring-1 ring-border px-3 py-1 rounded-full font-medium text-accent-foreground text-xs"
                >
                  <LuCalendarRange className="size-3" />
                  {formatDate(cardDetails.dueDate, "MMM d, h:mm a")}
                  <LuX className="opacity-50 group-hover:opacity-100 size-3" />
                </button>
              )}
              {cardDetails.assignees.length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-muted ring-1 ring-border px-2.5 py-0.5 rounded-full">
                  <div className="flex items-center -space-x-1.5">
                    {cardDetails.assignees.slice(0, 3).map((assignee) => (
                      <Tooltip key={assignee.userId}>
                        <TooltipTrigger asChild>
                          <Image
                            src={assignee.user?.image || "/default-avatar.png"}
                            alt={assignee.user?.name || "User"}
                            width={20}
                            height={20}
                            className="border-2 border-background rounded-full"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">{assignee.user?.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  {cardDetails.assignees.length > 3 && (
                    <span className="font-medium text-muted-foreground text-xs">
                      +{cardDetails.assignees.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <section className="space-y-2">
            <SectionHeader
              icon={<LuText className="size-4" />}
              title="Description"
            />
            <RTEditor
              value={cardDetails.description}
              onChange={(value) => handleChange("description", value)}
            />
          </section>

          {/* Checklist */}
          {cardDetails.checklist.length > 0 && (
            <section className="space-y-3 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <SectionHeader
                  icon={<LuListChecks className="size-4" />}
                  title="Checklist"
                  subtitle={`${checklistDone} of ${checklistTotal} completed`}
                />
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {Math.round(checklistPct)}%
                </span>
              </div>
              <div className="bg-muted rounded-full w-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              <div className="space-y-1">
                {cardDetails.checklist.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onChange={handleChecklistChange}
                    onRemove={handleRemoveChecklistItem}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Attachments */}
          {cardDetails.attachments.length > 0 && (
            <section className="space-y-3 bg-card border border-border rounded-xl p-4">
              <SectionHeader
                icon={<LuPaperclip className="size-4" />}
                title="Attachments"
                subtitle={`${cardDetails.attachments.length} file${
                  cardDetails.attachments.length === 1 ? "" : "s"
                }`}
              />
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {cardDetails.attachments.map((attachment, index) => (
                  <AttachmentItem
                    key={index}
                    attachment={attachment}
                    onRemove={() => handleRemoveAttachment(index)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Comments + Activity (existing cards only) */}
          {!isNew && cardData?.id && (
            <CommentsActivityTabs cardId={cardData.id} />
          )}

          {/* Footer */}
          <div className="bottom-0 sticky z-20 bg-background mt-4 pt-4 pb-2 border-t">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={cardLoading}
              >
                Cancel
              </Button>
              <Button
                disabled={!cardDetails.title.trim() || cardLoading}
                onClick={handleSubmit}
                className="min-w-28"
              >
                {cardLoading ? (
                  <Loading />
                ) : isNew ? (
                  "Create Card"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
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
        </aside>
      </div>
    </>
  );
}

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex justify-center items-center bg-accent rounded-md w-7 h-7 text-accent-foreground">
      {icon}
    </span>
    <div>
      <p className="font-semibold text-sm leading-tight">{title}</p>
      {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
    </div>
  </div>
);

const ChecklistItem = ({
  item,
  onChange,
  onRemove,
}: {
  item: { id: string; title: string; isChecked: boolean };
  onChange: (
    id: string,
    field: "isChecked" | "title",
    value: string | boolean,
  ) => void;
  onRemove: (id: string) => void;
}) => (
  <div className="group flex items-center gap-2 hover:bg-muted/60 -mx-1 px-1 py-1 rounded-md transition-colors">
    <Checkbox
      checked={item.isChecked}
      onCheckedChange={(checked) =>
        onChange(item.id, "isChecked", checked as boolean)
      }
      className="rounded-md w-4 h-4"
    />
    <InlineEdit
      value={item.title}
      onChange={(value) => onChange(item.id, "title", value)}
      className={`flex-1 text-sm ${
        item.isChecked ? "line-through text-muted-foreground" : ""
      }`}
    />
    <Button
      variant="ghost"
      size="icon"
      className="opacity-0 group-hover:opacity-100 w-6 h-6 text-muted-foreground hover:text-destructive"
      onClick={() => onRemove(item.id)}
    >
      <LuX className="size-3.5" />
    </Button>
  </div>
);

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: { name: string; url: string };
  onRemove: () => void;
}) => {
  const ext = attachment.name.split(".").pop()?.toUpperCase() || "FILE";
  return (
    <div className="group flex justify-between items-center gap-2 bg-muted/40 hover:bg-muted px-2 py-2 border border-border rounded-lg transition-colors">
      <div
        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
        onClick={() => window.open(attachment.url, "_blank")}
      >
        <div className="relative flex justify-center items-center bg-primary/10 rounded-md w-10 h-10 shrink-0">
          <LuFile className="size-5 text-primary" />
          <span className="absolute bottom-0.5 text-[8px] font-bold text-primary leading-none">
            {ext.slice(0, 4)}
          </span>
        </div>
        <span className="block min-w-0 font-medium text-sm truncate">
          {attachment.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <LuX className="size-4" />
      </Button>
    </div>
  );
};

const SidebarActionButton = ({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="ghost"
    onClick={onClick}
    disabled={disabled}
    className="w-full justify-start gap-2 font-normal text-sm bg-muted/50 hover:bg-muted"
  >
    {icon}
    <span>{label}</span>
  </Button>
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
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider px-1">
          Card details
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
          <Select value={priority || ""} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-full bg-muted/50 hover:bg-muted border-0 font-normal text-sm [&>span]:flex [&>span]:items-center [&>span]:gap-2">
              <SelectValue
                placeholder={
                  <span className="flex items-center gap-2 text-foreground">
                    <LuFlag className="size-4" />
                    Priority
                  </span>
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 rounded-full size-2" />
                  <span>High</span>
                </div>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 rounded-full size-2" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 rounded-full size-2" />
                  <span>Low</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between bg-muted/50 hover:bg-muted font-normal text-sm"
              >
                <div className="flex items-center gap-2">
                  <LuCalendarRange className="size-4" />
                  <span>Due date</span>
                </div>
                <LuChevronDown className="opacity-50 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 max-h-[min(calc(100vh-2rem),36rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-transparent"
              align="end"
              side="left"
              sideOffset={8}
              collisionPadding={16}
            >
              <DateTimePickerForm
                onSubmit={(data) => {
                  onDueDateChange(data.time);
                  setOpen(false);
                }}
                initialDate={dueDate ? new Date(dueDate) : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider px-1">
          Add to card
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
          <SidebarActionButton
            icon={<LuSquareCheckBig className="size-4" />}
            label="Checklist"
            onClick={onAddChecklist}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 bg-muted/50 hover:bg-muted font-normal text-sm"
                disabled={isUploading}
              >
                <LuPaperclip className="size-4" />
                <span>{isUploading ? "Uploading..." : "Attachment"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-72" align="start">
              <div className="space-y-3">
                <div>
                  <Label className="font-semibold">Attach a file</Label>
                  <p className="text-muted-foreground text-xs mt-1">
                    Choose a file from your device
                  </p>
                </div>
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
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 bg-muted/50 hover:bg-muted font-normal text-sm col-span-2 lg:col-span-1"
              >
                <LuUsersRound className="size-4" />
                <span>Assignees</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-3 w-72 max-h-80 overflow-y-auto"
              align="start"
            >
              {assignees.length > 0 && (
                <div className="space-y-1">
                  <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider px-1">
                    Card members
                  </Label>
                  <div className="flex flex-col">
                    {assignees.map((member, index) => (
                      <div
                        key={index}
                        className="group flex justify-between items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer"
                        onClick={() => handleAssigneeChange(member)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Image
                            src={member?.user?.image || "/logo.png"}
                            alt={member?.user?.name || ""}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <span className="text-sm truncate">
                            {member?.user?.name}
                          </span>
                        </div>
                        <LuCheck className="size-4 text-primary shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {assignees.length > 0 && boardMembers.length > 0 && (
                <Separator className="my-2" />
              )}
              {boardMembers.length > 0 && (
                <div className="space-y-1">
                  <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider px-1">
                    Board members
                  </Label>
                  <div className="flex flex-col">
                    {boardMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer"
                        onClick={() => handleAssigneeChange(member)}
                      >
                        <Image
                          src={member?.user?.image || "/logo.png"}
                          alt={member?.user?.name || ""}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="text-sm truncate">
                          {member?.user?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

function CommentsActivityTabs({ cardId }: { cardId: string }) {
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  return (
    <section className="space-y-3 bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-1 border-b border-border -mx-4 -mt-4 px-4 pt-3">
        <button
          type="button"
          onClick={() => setTab("comments")}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "comments"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LuMessageSquare className="size-4" /> Comments
        </button>
        <button
          type="button"
          onClick={() => setTab("activity")}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "activity"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LuActivity className="size-4" /> Activity
        </button>
      </div>
      <div className="pt-1">
        {tab === "comments" ? (
          <CardComments cardId={cardId} />
        ) : (
          <CardActivity cardId={cardId} />
        )}
      </div>
    </section>
  );
}
