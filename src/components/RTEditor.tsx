import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Separator } from "./ui/separator";
import styles from "./RTEditor.module.css";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { isImageUrl, uploadCloudinary } from "@/lib/utils";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LuCaseSensitive,
  LuChevronDown,
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuCode,
  LuEllipsis,
  LuList,
  LuListOrdered,
  LuLink,
  LuImage,
} from "react-icons/lu";

interface RTEditorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export default function RTEditor({ value, onChange }: RTEditorProps) {
  const editor = useEditor({
    extensions: [
      TextStyleKit,
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: styles.image,
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rounded-md border min-h-[200px] sm:h-[200px] border-input bg-background focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-2 overflow-y-auto",
      },
    },
  });

  return (
    <div className="flex flex-col space-y-1">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  return <MenuBarInner editor={editor} />;
}

function MenuBarInner({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [isUrlValid, setIsUrlValid] = useState(true);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
      isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
      isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isUnderline: ctx.editor.isActive("underline") ?? false,
      canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isLink: ctx.editor.isActive("link") ?? false,
    }),
  });

  const handleHeadingChange = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    setTimeout(() => {
      editor.chain().focus().toggleHeading({ level }).run();
    }, 0);
  };

  const handleParagraphChange = () => {
    setTimeout(() => {
      editor.chain().focus().setParagraph().run();
    }, 0);
  };

  const activeLevel = [1, 2, 3, 4, 5, 6].find(
    (level) => editorState[`isHeading${level}` as keyof typeof editorState]
  );

  const validateUrl = (url: string) => {
    try {
      const isValid =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
          url
        );
      setIsUrlValid(isValid);
      return isValid;
    } catch {
      setIsUrlValid(false);
      return false;
    }
  };

  const setLink = () => {
    if (!validateUrl(linkUrl) && linkUrl !== "") return;

    const attrs = {
      href: linkUrl,
      ...(openInNewTab && { target: "_blank", rel: "noopener noreferrer" }),
    };

    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setOpen(false);
    setLinkUrl("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-0 px-2 py-1.5 border rounded-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="gap-0 px-3 sm:px-6"
            size="icon"
            variant="ghost"
            aria-label="Text formatting options"
            aria-haspopup="menu"
          >
            <LuCaseSensitive className="size-5 sm:size-6" />
            <LuChevronDown className="size-3 sm:size-4" />
            {activeLevel && (
              <span className="sr-only">Heading {activeLevel} selected</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-[200px] sm:w-auto"
        >
          <DropdownMenuItem
            onClick={handleParagraphChange}
            aria-selected={editorState.isParagraph}
            className={`${editorState.isParagraph ? "bg-accent" : ""
              } focus:bg-accent`}
          >
            <span className={styles.normalText}>Normal Text</span>
          </DropdownMenuItem>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <DropdownMenuItem
              key={level}
              className={`${editorState[`isHeading${level}` as keyof typeof editorState]
                ? "bg-accent"
                : ""
                } focus:bg-accent`}
              onClick={() =>
                handleHeadingChange(level as 1 | 2 | 3 | 4 | 5 | 6)
              }
              aria-selected={
                editorState[`isHeading${level}` as keyof typeof editorState]
              }
            >
              <span className={styles[`heading${level}`]}>Heading {level}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator
        orientation="vertical"
        className="mx-1 sm:mx-2 data-[orientation=vertical]:h-6 sm:data-[orientation=vertical]:h-8.5"
      />

      <div className="flex items-center gap-1 sm:gap-0">
        <Button
          size="icon"
          variant={editorState.isBold ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          aria-label="Bold"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuBold className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>

        <Button
          size="icon"
          variant={editorState.isItalic ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          aria-label="Italic"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuItalic className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>

        <Button
          size="icon"
          variant={editorState.isUnderline ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canUnderline}
          aria-label="Underline"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuUnderline className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="More formatting options"
              className="w-8 sm:w-10 h-8 sm:h-10"
            >
              <LuEllipsis className="w-3 sm:w-4 h-3 sm:h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="w-[200px] sm:w-auto"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editorState.canStrike}
              className={`${editorState.isStrike ? "bg-accent" : ""
                } focus:bg-accent`}
            >
              <span className="flex items-center gap-2">
                <LuStrikethrough className="w-4 h-4" />
                Strikethrough
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editorState.canCode}
              className={`${editorState.isCode ? "bg-accent" : ""
                } focus:bg-accent`}
            >
              <span className="flex items-center gap-2">
                <LuCode className="w-4 h-4" />
                Code
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator
        orientation="vertical"
        className="mx-1 sm:mx-2 data-[orientation=vertical]:h-6 sm:data-[orientation=vertical]:h-8.5"
      />

      <div className="flex items-center gap-1 sm:gap-0">
        <Button
          size="icon"
          variant={editorState.isBulletList ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuList className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>

        <Button
          size="icon"
          variant={editorState.isOrderedList ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuListOrdered className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>
      </div>

      <Separator
        orientation="vertical"
        className="mx-1 sm:mx-2 data-[orientation=vertical]:h-6 sm:data-[orientation=vertical]:h-8.5"
      />

      <div className="flex items-center gap-1 sm:gap-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant={editorState.isLink ? "secondary" : "ghost"}
              aria-label="Insert link"
              className="w-8 sm:w-10 h-8 sm:h-10"
            >
              <LuLink className="w-3 sm:w-4 h-3 sm:h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[90vw] sm:w-auto">
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    validateUrl(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && setLink()}
                  className={!isUrlValid && linkUrl ? "border-red-500" : ""}
                />
                {!isUrlValid && linkUrl && (
                  <p className="mt-1 text-red-500 text-sm">
                    Please enter a valid URL
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="open-new-tab"
                  checked={openInNewTab}
                  onCheckedChange={setOpenInNewTab}
                />
                <Label htmlFor="open-new-tab">Open in new tab</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={setLink}
                  disabled={!isUrlValid && linkUrl !== ""}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ImageUpload editor={editor} />
      </div>
    </div>
  );
}

function ImageUpload({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const addImageByUrl = () => {
    if (imageUrl && isImageUrl(imageUrl)) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setOpen(false);
      setImageUrl("");
    } else {
      toast.error("Please enter a valid image URL");
      setImageUrl("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Insert image"
          className="w-8 sm:w-10 h-8 sm:h-10"
        >
          <LuImage className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-[90vw] sm:w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              placeholder="Paste image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImageByUrl()}
            />
            <Button
              onClick={addImageByUrl}
              disabled={!imageUrl}
              className="w-full"
            >
              Insert
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="border-t w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div>
            <Label className="block cursor-pointer">
              <span className="sr-only">Upload image</span>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <Button variant="outline" className="w-full" asChild>
                <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
              </Button>
            </Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

async function uploadImage(file: File): Promise<string> {
  try {
    const { url } = await uploadCloudinary(file);
    return url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}