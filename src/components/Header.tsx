import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { Board } from "@/types";
import { Input } from "./ui/input";
import { Loading } from "./Loading";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Separator } from "./ui/separator";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { LuCheck, LuListFilter, LuUserRoundPlus } from "react-icons/lu";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "./ui/dialog";

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (email) =>
        email.endsWith("@gmail.com") || email.endsWith("@googlemail.com"),
      {
        message: "Only Google email addresses are allowed for invitations",
      }
    ),
});

export default function Header({
  currentBoard,
  loading,
}: {
  currentBoard: Board | null;
  loading: boolean;
}) {
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentBoard?.id) return;
    setInviteLoading(true);
    try {
      const { data } = await axios.post(
        "/api/boards/" + currentBoard?.id + "/invite",
        values
      );
      setOpen(false);
      toast.success(data.message);
      form.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    } finally {
      setInviteLoading(false);
    }
  }
  return (
    <div className="flex justify-between items-center bg-white/90 dark:bg-black/20 p-4 sm:px-6 md:px-10 font-sans">
      {loading ? (
        <div className="h-8" />
      ) : (
        <>
          <h2 className="font-bold text-xl">{currentBoard?.title}</h2>
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center -space-x-2">
                {currentBoard?.members?.map((member) => (
                  <Popover key={member.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Image
                            src={member.user.image || "/logo.png"}
                            alt={member.user.name}
                            width={25}
                            height={25}
                            className="border rounded-full size-8 cursor-pointer"
                          />
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent className="min-w-fit">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.user.image || "/logo.png"}
                          alt={member.user.name}
                          width={25}
                          height={25}
                          className="z-1 rounded-full size-14 cursor-pointer"
                        />
                        <div>
                          <p className="font-bold">{member.user.name}</p>
                          <p className="text-sm">{member.user.email}</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>

            {/* Filter button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LuListFilter className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Cards</p>
              </TooltipContent>
            </Tooltip>

            {/* Invite member dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  {currentBoard?.adminId === session?.user.id ? (
                    <>
                      <LuUserRoundPlus />
                      Add Member
                    </>
                  ) : (
                    "See Member"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                {currentBoard?.adminId === session?.user.id ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Share Board</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div className="flex gap-3">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="user@gmail.com"
                                      {...field}
                                      autoComplete="off"
                                      className={
                                        field.value &&
                                        (field.value.endsWith("@gmail.com") ||
                                          field.value.endsWith(
                                            "@googlemail.com"
                                          ))
                                          ? "border-green-500"
                                          : ""
                                      }
                                    />
                                    {field.value &&
                                      (field.value.endsWith("@gmail.com") ||
                                        field.value.endsWith(
                                          "@googlemail.com"
                                        )) && (
                                        <LuCheck className="top-3 right-3 absolute w-4 h-4 text-green-500" />
                                      )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={inviteLoading}>
                            {inviteLoading ? <Loading /> : "Send Invite"}
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <Separator />
                  </>
                ) : (
                  <DialogTitle />
                )}
                <div className="space-y-4">
                  <h3 className="font-bold">Board Members</h3>
                  <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {currentBoard?.members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={member.user.image || "/logo.png"}
                            alt={member.user.name || "member"}
                            width={25}
                            height={25}
                            className="z-1 border rounded-full size-8 cursor-pointer"
                          />
                          <div>
                            <p className="font-bold">
                              {member.user.name}{" "}
                              {member.user.id === session?.user.id && "(You)"}
                            </p>
                            <p className="text-xs">{member.user.email}</p>
                          </div>
                        </div>
                        <p className="bg-card px-4 py-2 rounded text-sm first-letter:uppercase lowercase cursor-pointer">
                          {member.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
}
