"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FefoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tanggalExp: string | null
}

export const FefoBadge = React.forwardRef<HTMLSpanElement, FefoBadgeProps>(
  ({ className, tanggalExp, ...props }, ref) => {
    if (!tanggalExp) {
      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground",
            className
          )}
          {...props}
        >
          No Exp
        </span>
      )
    }

    const now = new Date()
    const exp = new Date(tanggalExp)
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            className
          )}
          {...props}
        >
          Expired
        </span>
      )
    }

    if (diffDays <= 7) {
      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            className
          )}
          {...props}
        >
          {diffDays} hari
        </span>
      )
    }

    if (diffDays <= 30) {
      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            className
          )}
          {...props}
        >
          {diffDays} hari
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
          className
        )}
        {...props}
      >
        {diffDays} hari
      </span>
    )
  }
)

FefoBadge.displayName = "FefoBadge"
