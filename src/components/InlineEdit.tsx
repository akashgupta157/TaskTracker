import { Input } from "./ui/input";
import React, { useState, useRef, useEffect } from "react";

export const InlineEdit = ({
  value,
  onChange,
  onCommit,
  className,
}: {
  value: string;
  onChange: (newValue: string) => void;
  onCommit?: (finalValue: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onCommit?.(draft);
    if (draft?.trim() !== value) {
      onChange(draft.trim());
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setDraft(value);
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(e.target.value);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
    />
  ) : (
    <span
      className={`cursor-pointer ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value || "Untitled"}
    </span>
  );
};
