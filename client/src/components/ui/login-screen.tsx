import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const loginVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

type LoginScreenProps =
  React.ComponentProps<"div"> &
  VariantProps<typeof loginVariants>

export function LoginScreen({
  className,
  orientation,
  ...props
}: LoginScreenProps) {
  return (
    <div
      role="group"
      data-slot="login-screen"
      data-orientation={orientation}
      className={cn(loginVariants({ orientation }), className)}
      {...props}
    />
  )
}
