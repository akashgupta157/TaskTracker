import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted rounded-md font-sans animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
