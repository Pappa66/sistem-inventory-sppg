"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, XCircle, Info } from "lucide-react"

interface StatusBadgeProps {
  status: "success" | "error" | "warning" | "pending" | "info"
  label: string
  icon?: boolean
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, icon = true }, ref) => {
    const statusConfig = {
      success: {
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
      },
      error: {
        variant: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
      },
      warning: {
        variant: "secondary" as const,
        icon: <AlertCircle className="h-3 w-3" />,
      },
      pending: {
        variant: "outline" as const,
        icon: <Clock className="h-3 w-3" />,
      },
      info: {
        variant: "ghost" as const,
        icon: <Info className="h-3 w-3" />,
      },
    }

    const config = statusConfig[status]

    return (
      <Badge ref={ref} variant={config.variant}>
        {icon && config.icon}
        {label}
      </Badge>
    )
  }
)

StatusBadge.displayName = "StatusBadge"
