import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation utilities
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-200",
  slideIn: "animate-in slide-in-from-bottom-2 duration-300",
  slideOut: "animate-out slide-out-to-bottom-2 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  slideInLeft: "animate-in slide-in-from-left duration-300",
  slideInRight: "animate-in slide-in-from-right duration-300",
  pulse: "animate-pulse",
  spin: "animate-spin",
}

// Transition utilities
export const transitions = {
  smooth: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-100 ease-in-out",
  slow: "transition-all duration-500 ease-in-out",
}

// Responsive utilities
export const responsive = {
  containerX: "px-4 md:px-6 lg:px-8",
  containerY: "py-4 md:py-6 lg:py-8",
  gap: "gap-4 md:gap-6 lg:gap-8",
  gridAuto: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}
