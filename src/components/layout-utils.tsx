"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const PageWrapper = React.forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-6 animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PageWrapper.displayName = "PageWrapper"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div className="flex-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-1 text-muted-foreground">{description}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)

interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: "1" | "2" | "3" | "4"
}

export const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps>(
  ({ className, cols = "3", children, ...props }, ref) => {
    const gridColsMap = {
      "1": "grid-cols-1",
      "2": "sm:grid-cols-2",
      "3": "sm:grid-cols-2 lg:grid-cols-3",
      "4": "sm:grid-cols-2 lg:grid-cols-4",
    }

    return (
      <div
        ref={ref}
        className={cn("grid gap-4", gridColsMap[cols], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DataGrid.displayName = "DataGrid"

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ className, children, header, footer, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card card-hover", className)}
      {...props}
    >
      {header && (
        <div className="border-b border-border px-4 md:px-6 py-3 md:py-4">
          {header}
        </div>
      )}
      <div className="px-4 md:px-6 py-4">{children}</div>
      {footer && (
        <div className="border-t border-border px-4 md:px-6 py-3 md:py-4">
          {footer}
        </div>
      )}
    </div>
  )
)
ContentCard.displayName = "ContentCard"
