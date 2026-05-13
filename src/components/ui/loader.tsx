"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  text?: string
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = "md", text, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
)
Loader.displayName = "Loader"

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible?: boolean
  text?: string
}

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, visible = true, text, ...props }, ref) => {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="rounded-lg bg-background p-8 shadow-lg">
          <Loader text={text || "Memuat..."} />
        </div>
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"
