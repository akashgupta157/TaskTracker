"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { LuPencil, LuTrash2, LuX, LuCheck } from "react-icons/lu";
import type { Comment } from "@/types";
import {
  useGetCardCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/redux/api/commentApi";

export function CardComments({ cardId }: { cardId: string }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { data: comments = [], isLoading } = useGetCardCommentsQuery(cardId, {
    skip: !cardId,
  });
  const [addComment, { isLoading: adding }] = useAddCommentMutation();
  const [draft, setDraft] = useState("");

  const handleAdd = async () => {
    const content = draft.trim();
    if (!content) return;
    try {
      await addComment({ cardId, content }).unwrap();
      setDraft("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-start">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "You"}
            width={32}
            height={32}
            className="rounded-full shrink-0 mt-0.5"
          />
        ) : (
          <div className="size-8 rounded-full bg-muted shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[64px] resize-none bg-card"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          {draft.trim() && (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraft("")}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                {adding ? "Posting..." : "Comment"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              cardId={cardId}
              isOwner={c.userId === currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  cardId,
  isOwner,
}: {
  comment: Comment;
  cardId: string;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [updateComment, { isLoading: updating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: deleting }] = useDeleteCommentMutation();

  const save = async () => {
    const content = draft.trim();
    if (!content || content === comment.content) {
      setEditing(false);
      setDraft(comment.content);
      return;
    }
    try {
      await updateComment({ cardId, commentId: comment.id, content }).unwrap();
      setEditing(false);
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const remove = async () => {
    try {
      await deleteComment({ cardId, commentId: comment.id }).unwrap();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <li className="flex gap-2 items-start group">
      {comment.user?.image ? (
        <Image
          src={comment.user.image}
          alt={comment.user.name || "User"}
          width={32}
          height={32}
          className="rounded-full shrink-0 mt-0.5"
        />
      ) : (
        <div className="size-8 rounded-full bg-muted shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {comment.user?.name || "Unknown"}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
            {comment.isEdited && " · edited"}
          </span>
        </div>

        {editing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[60px] resize-none bg-card"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={updating}>
                <LuCheck className="size-3.5" /> Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.content);
                }}
              >
                <LuX className="size-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-md px-3 py-2 mt-1 text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        )}

        {isOwner && !editing && (
          <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              onClick={() => setEditing(true)}
            >
              <LuPencil className="size-3" /> Edit
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
              onClick={remove}
              disabled={deleting}
            >
              <LuTrash2 className="size-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
