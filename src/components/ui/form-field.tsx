"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  containerClassName?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, required, containerClassName, className, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random()}`

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className={required ? "after:content-['*'] after:ml-1 after:text-destructive" : ""}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={fieldId}
          className={cn(error && "border-destructive focus-visible:ring-destructive/20", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-destructive font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"
