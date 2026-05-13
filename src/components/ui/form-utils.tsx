"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  layout?: "vertical" | "grid-2" | "grid-3"
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, layout = "grid-2", ...props }, ref) => {
    const layoutClass = {
      vertical: "flex flex-col gap-4",
      "grid-2": "grid grid-cols-1 md:grid-cols-2 gap-4",
      "grid-3": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    }

    return (
      <form
        ref={ref}
        className={cn(layoutClass[layout], className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  span?: 1 | 2 | 3
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, span = 1, ...props }, ref) => {
    const spanClass = {
      1: "",
      2: "md:col-span-2",
      3: "md:col-span-3 lg:col-span-3",
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-2", spanClass[span], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormGroup.displayName = "FormGroup"

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children: React.ReactNode
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
)
FormSection.displayName = "FormSection"
