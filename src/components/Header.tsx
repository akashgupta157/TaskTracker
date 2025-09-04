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
import Filter from "./Filter";

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
  const [filterOpen, setFilterOpen] = useState(false);

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
    <div className="flex flex-wrap justify-between items-center gap-3 bg-white/90 dark:bg-black/20 p-3 sm:p-4 md:px-6 lg:px-10 font-sans">
      {loading ? (
        <div className="h-8" />
      ) : (
        <>
          <h2 className="max-w-[180px] sm:max-w-xs md:max-w-md font-bold text-lg sm:text-xl truncate">
            {currentBoard?.title}
          </h2>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 md:gap-5">
            <div className="flex-shrink-0">
              <div className="flex items-center -space-x-2">
                {currentBoard?.members?.slice(0, 4).map((member) => (
                  <Popover key={member.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Image
                            src={member.user.image || "/logo.png"}
                            alt={member.user.name || "user"}
                            width={25}
                            height={25}
                            className="border rounded-full size-6 sm:size-7 md:size-8 cursor-pointer"
                          />
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-full min-w-fit max-w-[90vw] sm:max-w-xs">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.user.image || "/logo.png"}
                          alt={member.user.name || "user"}
                          width={25}
                          height={25}
                          className="z-1 rounded-full size-10 sm:size-12 md:size-14 cursor-pointer"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold truncate">
                            {member.user.name}
                          </p>
                          <p className="text-sm truncate">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
                {currentBoard?.members && currentBoard.members.length > 4 && (
                  <div className="flex justify-center items-center bg-gray-200 dark:bg-gray-700 rounded-full size-6 sm:size-7 md:size-8 font-medium text-xs">
                    +{currentBoard.members.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Filter button */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 sm:size-9"
                    >
                      <LuListFilter className="size-4 sm:size-5" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter Cards</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="">
                <Filter
                  currentBoard={currentBoard}
                  setFilterOpen={setFilterOpen}
                />
              </PopoverContent>
            </Popover>

            {/* Invite member dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs sm:text-sm">
                  {currentBoard?.adminId === session?.user.id ? (
                    <>
                      <LuUserRoundPlus className="size-3 sm:size-4" />
                      <span className="hidden sm:inline ml-1">Add Member</span>
                    </>
                  ) : (
                    "See Member"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg">
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
                        <div className="flex sm:flex-row flex-col gap-3">
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
                          <Button
                            type="submit"
                            disabled={inviteLoading}
                            className="sm:self-stretch"
                          >
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
                  <div className="space-y-3 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-400px)] overflow-y-auto">
                    {currentBoard?.members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center gap-2 sm:gap-0"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Image
                            src={member.user.image || "/logo.png"}
                            alt={member.user.name || "member"}
                            width={25}
                            height={25}
                            className="z-1 flex-shrink-0 border rounded-full size-8 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">
                              {member.user.name}{" "}
                              {member.user.id === session?.user.id && "(You)"}
                            </p>
                            <p className="text-xs truncate">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        <p className="self-start sm:self-auto bg-card px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm first-letter:uppercase lowercase cursor-pointer">
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
