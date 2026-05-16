"use client";

import Image from "next/image";
import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useGetCardActivityQuery } from "@/redux/api/activityApi";
import type { Activity, ActivityType } from "@/types";
import {
  LuPlus,
  LuTrash2,
  LuArrowRightLeft,
  LuCircleCheck,
  LuRotateCcw,
  LuType,
  LuText,
  LuFlag,
  LuCalendarPlus,
  LuCalendarClock,
  LuCalendarX,
  LuUserPlus,
  LuUserMinus,
  LuListChecks,
  LuPaperclip,
  LuMessageSquare,
} from "react-icons/lu";

const ICONS: Record<ActivityType, React.ReactNode> = {
  CARD_CREATED: <LuPlus className="size-3.5" />,
  CARD_DELETED: <LuTrash2 className="size-3.5" />,
  CARD_MOVED: <LuArrowRightLeft className="size-3.5" />,
  CARD_COMPLETED: <LuCircleCheck className="size-3.5" />,
  CARD_REOPENED: <LuRotateCcw className="size-3.5" />,
  TITLE_CHANGED: <LuType className="size-3.5" />,
  DESCRIPTION_CHANGED: <LuText className="size-3.5" />,
  PRIORITY_CHANGED: <LuFlag className="size-3.5" />,
  DUE_DATE_SET: <LuCalendarPlus className="size-3.5" />,
  DUE_DATE_CHANGED: <LuCalendarClock className="size-3.5" />,
  DUE_DATE_REMOVED: <LuCalendarX className="size-3.5" />,
  ASSIGNEE_ADDED: <LuUserPlus className="size-3.5" />,
  ASSIGNEE_REMOVED: <LuUserMinus className="size-3.5" />,
  CHECKLIST_ADDED: <LuListChecks className="size-3.5" />,
  CHECKLIST_ITEM_CHECKED: <LuListChecks className="size-3.5" />,
  CHECKLIST_ITEM_UNCHECKED: <LuListChecks className="size-3.5" />,
  CHECKLIST_ITEM_REMOVED: <LuListChecks className="size-3.5" />,
  ATTACHMENT_ADDED: <LuPaperclip className="size-3.5" />,
  ATTACHMENT_REMOVED: <LuPaperclip className="size-3.5" />,
  COMMENT_ADDED: <LuMessageSquare className="size-3.5" />,
  COMMENT_DELETED: <LuMessageSquare className="size-3.5" />,
};

const TONE: Record<ActivityType, string> = {
  CARD_CREATED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CARD_DELETED: "bg-red-500/15 text-red-600 dark:text-red-400",
  CARD_MOVED: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  CARD_COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CARD_REOPENED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  TITLE_CHANGED: "bg-muted text-muted-foreground",
  DESCRIPTION_CHANGED: "bg-muted text-muted-foreground",
  PRIORITY_CHANGED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  DUE_DATE_SET: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  DUE_DATE_CHANGED: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  DUE_DATE_REMOVED: "bg-muted text-muted-foreground",
  ASSIGNEE_ADDED: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  ASSIGNEE_REMOVED: "bg-muted text-muted-foreground",
  CHECKLIST_ADDED: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  CHECKLIST_ITEM_CHECKED:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CHECKLIST_ITEM_UNCHECKED: "bg-muted text-muted-foreground",
  CHECKLIST_ITEM_REMOVED: "bg-muted text-muted-foreground",
  ATTACHMENT_ADDED: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  ATTACHMENT_REMOVED: "bg-muted text-muted-foreground",
  COMMENT_ADDED: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  COMMENT_DELETED: "bg-muted text-muted-foreground",
};

function describe(a: Activity): React.ReactNode {
  const d = (a.data || {}) as Record<string, unknown>;
  const str = (k: string) => (d[k] as string) || "";
  switch (a.type) {
    case "CARD_CREATED":
      return (
        <>
          created this card{" "}
          {str("title") && <strong>&ldquo;{str("title")}&rdquo;</strong>}
        </>
      );
    case "CARD_DELETED":
      return (
        <>
          deleted card{" "}
          {str("title") && <strong>&ldquo;{str("title")}&rdquo;</strong>}
        </>
      );
    case "CARD_MOVED":
      return (
        <>
          moved this card from{" "}
          <strong>{str("fromListTitle") || "another list"}</strong> to{" "}
          <strong>{str("toListTitle") || "another list"}</strong>
        </>
      );
    case "CARD_COMPLETED":
      return <>marked this card as complete</>;
    case "CARD_REOPENED":
      return <>reopened this card</>;
    case "TITLE_CHANGED":
      return (
        <>
          renamed the card{" "}
          {str("from") && (
            <>
              from <strong>&ldquo;{str("from")}&rdquo;</strong>{" "}
            </>
          )}
          to <strong>&ldquo;{str("to")}&rdquo;</strong>
        </>
      );
    case "DESCRIPTION_CHANGED":
      return <>updated the description</>;
    case "PRIORITY_CHANGED":
      return (
        <>
          changed priority{" "}
          {str("from") && (
            <>
              from <strong>{str("from")}</strong>{" "}
            </>
          )}
          to <strong>{str("to") || "none"}</strong>
        </>
      );
    case "DUE_DATE_SET":
      return (
        <>
          set due date to{" "}
          <strong>{format(new Date(str("to")), "MMM d, yyyy h:mm a")}</strong>
        </>
      );
    case "DUE_DATE_CHANGED":
      return (
        <>
          changed due date to{" "}
          <strong>{format(new Date(str("to")), "MMM d, yyyy h:mm a")}</strong>
        </>
      );
    case "DUE_DATE_REMOVED":
      return <>removed the due date</>;
    case "ASSIGNEE_ADDED":
      return <>added an assignee</>;
    case "ASSIGNEE_REMOVED":
      return <>removed an assignee</>;
    case "CHECKLIST_ADDED":
      return (
        <>
          added checklist item{" "}
          <strong>&ldquo;{str("title")}&rdquo;</strong>
        </>
      );
    case "CHECKLIST_ITEM_CHECKED":
      return (
        <>
          completed checklist item{" "}
          <strong>&ldquo;{str("title")}&rdquo;</strong>
        </>
      );
    case "CHECKLIST_ITEM_UNCHECKED":
      return (
        <>
          unchecked checklist item{" "}
          <strong>&ldquo;{str("title")}&rdquo;</strong>
        </>
      );
    case "CHECKLIST_ITEM_REMOVED":
      return (
        <>
          removed checklist item{" "}
          <strong>&ldquo;{str("title")}&rdquo;</strong>
        </>
      );
    case "ATTACHMENT_ADDED":
      return (
        <>
          attached <strong>{str("name")}</strong>
        </>
      );
    case "ATTACHMENT_REMOVED":
      return (
        <>
          removed attachment <strong>{str("name")}</strong>
        </>
      );
    case "COMMENT_ADDED":
      return <>commented on this card</>;
    case "COMMENT_DELETED":
      return <>deleted a comment</>;
    default:
      return <>made an update</>;
  }
}

export function CardActivity({ cardId }: { cardId: string }) {
  const { data: activities = [], isLoading } = useGetCardActivityQuery(cardId, {
    skip: !cardId,
  });

  const sorted = useMemo(
    () =>
      [...activities].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [activities]
  );

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">Loading activity...</p>
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 pl-1">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
      {sorted.map((a) => (
        <li key={a.id} className="relative flex gap-3 items-start">
          <span
            className={`relative z-[1] flex justify-center items-center size-7 rounded-full shrink-0 ring-4 ring-background ${
              TONE[a.type] || "bg-muted text-muted-foreground"
            }`}
          >
            {ICONS[a.type] || <LuPlus className="size-3.5" />}
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm leading-snug">
              <span className="inline-flex items-center gap-1.5 align-middle">
                {a.user?.image ? (
                  <Image
                    src={a.user.image}
                    alt={a.user.name || "User"}
                    width={18}
                    height={18}
                    className="rounded-full inline-block"
                  />
                ) : null}
                <strong className="font-medium">
                  {a.user?.name || "Someone"}
                </strong>{" "}
              </span>
              <span className="text-muted-foreground">{describe(a)}</span>
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-0.5"
              title={format(new Date(a.createdAt), "PPpp")}
            >
              {formatDistanceToNow(new Date(a.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
