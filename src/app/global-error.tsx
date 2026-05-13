"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <svg className="size-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">Terjadi Kesalahan Sistem</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => reset()}>Coba Lagi</Button>
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
              Ke Dashboard
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
