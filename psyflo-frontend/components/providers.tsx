"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { MoodProvider } from "@/lib/mood-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MoodProvider>{children}</MoodProvider>
    </AuthProvider>
  )
}
