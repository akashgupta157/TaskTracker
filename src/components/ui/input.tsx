import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

function Input({ className, type, icon, iconPosition = "left", ...props }: InputProps) {
  const hasIcon = !!icon;
  
  return (
    <div className={cn(
      "relative flex items-center w-full",
      hasIcon && iconPosition === "left" ? "flex-row" : "flex-row-reverse"
    )}>
      {hasIcon && (
        <Slot className={cn(
          "z-10 absolute flex justify-center items-center w-5 h-5",
          iconPosition === "left" ? "left-3" : "right-3",
          "text-muted-foreground"
        )}>
          {icon}
        </Slot>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:inline-flex flex bg-transparent selection:bg-primary dark:bg-input/30 file:bg-transparent disabled:opacity-50 shadow-xs px-3 py-1 border border-input file:border-0 rounded-md outline-none w-full min-w-0 h-9 file:h-7 font-sans file:font-medium selection:text-primary-foreground placeholder:text-muted-foreground file:text-foreground md:text-sm file:text-sm text-base transition-[color,box-shadow] disabled:cursor-not-allowed disabled:pointer-events-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          hasIcon && (iconPosition === "left" ? "pl-9" : "pr-9"),
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }