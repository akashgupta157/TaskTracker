import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  time: z.date({
    error: "A date and time is required.",
  }),
});

interface DateTimePickerFormProps {
  onSubmit: (data: { time: Date }) => void;
  initialDate?: Date;
}

export function DateTimePickerForm({
  onSubmit,
  initialDate,
}: DateTimePickerFormProps) {
  const defaultDate = initialDate || new Date();
  if (!initialDate) {
    defaultDate.setDate(defaultDate.getDate() + 1);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      time: defaultDate,
    },
  });

  function handleSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data);
  }

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      const currentTime = form.getValues("time") || new Date();
      const newDate = new Date(date);
      newDate.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds()
      );
      form.setValue("time", newDate);
    }
  }

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const currentDate = form.getValues("time") || defaultDate;
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue("time", newDate);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <div className="flex flex-col">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateSelect}
                    initialFocus
                    fromDate={new Date()}
                    className="p-0"
                  />
                  <div className="flex gap-1.5 mt-2 border-t pt-2">
                    <ScrollArea className="flex-1 h-28 scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-transparent">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mb-1 font-medium">
                        Hour
                      </p>
                      <div className="flex flex-col gap-0.5 pr-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (hour) => (
                            <Button
                              key={hour}
                              type="button"
                              size="sm"
                              variant={
                                field.value &&
                                field.value.getHours() % 12 === hour % 12
                                  ? "default"
                                  : "ghost"
                              }
                              className="h-7 w-full text-xs"
                              onClick={() =>
                                handleTimeChange("hour", hour.toString())
                              }
                            >
                              {hour}
                            </Button>
                          )
                        )}
                      </div>
                    </ScrollArea>
                    <ScrollArea className="flex-1 h-28 scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-transparent">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mb-1 font-medium">
                        Min
                      </p>
                      <div className="flex flex-col gap-0.5 pr-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => (
                            <Button
                              key={minute}
                              type="button"
                              size="sm"
                              variant={
                                field.value &&
                                field.value.getMinutes() === minute
                                  ? "default"
                                  : "ghost"
                              }
                              className="h-7 w-full text-xs"
                              onClick={() =>
                                handleTimeChange("minute", minute.toString())
                              }
                            >
                              {minute.toString().padStart(2, "0")}
                            </Button>
                          )
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mb-1 font-medium">
                        AM/PM
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {["AM", "PM"].map((ampm) => (
                          <Button
                            key={ampm}
                            type="button"
                            size="sm"
                            variant={
                              field.value &&
                              ((ampm === "AM" && field.value.getHours() < 12) ||
                                (ampm === "PM" && field.value.getHours() >= 12))
                                ? "default"
                                : "ghost"
                            }
                            className="h-7 w-full text-xs"
                            onClick={() => handleTimeChange("ampm", ampm)}
                          >
                            {ampm}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="sm">
          Set Due Date
        </Button>
      </form>
    </Form>
  );
}
