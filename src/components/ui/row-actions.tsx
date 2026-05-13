"use client"

import * as React from "react"
import { MoreHorizontal, Trash2, Edit, Eye, Copy, Download, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface RowAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
}

interface RowActionsProps {
  actions: RowAction[]
  label?: string
}

export function RowActions({ actions, label = "Actions" }: RowActionsProps) {
  const destructiveActions = actions.filter((a) => a.variant === "destructive")
  const defaultActions = actions.filter((a) => a.variant !== "destructive")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {defaultActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className="cursor-pointer"
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
        {destructiveActions.length > 0 && defaultActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const commonActions = {
  view: (onClick: () => void): RowAction => ({
    label: "Lihat",
    icon: <Eye className="h-4 w-4" />,
    onClick,
  }),
  edit: (onClick: () => void): RowAction => ({
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    onClick,
  }),
  copy: (onClick: () => void): RowAction => ({
    label: "Salin",
    icon: <Copy className="h-4 w-4" />,
    onClick,
  }),
  download: (onClick: () => void): RowAction => ({
    label: "Unduh",
    icon: <Download className="h-4 w-4" />,
    onClick,
  }),
  delete: (onClick: () => void): RowAction => ({
    label: "Hapus",
    icon: <Trash className="h-4 w-4" />,
    onClick,
    variant: "destructive",
  }),
}
