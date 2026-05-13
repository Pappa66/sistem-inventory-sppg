"use client"

import { createContext, useContext } from "react"

type UserData = {
  userId: string
  role: string
  name: string
}

const UserContext = createContext<UserData | null>(null)

export function UserProvider({ children, value }: { children: React.ReactNode; value: UserData }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
