import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "SPPG Inventory System",
  description: "Sistem Inventaris Satuan Pelayanan Gizi",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background antialiased">
        <TooltipProvider delay={0}>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
