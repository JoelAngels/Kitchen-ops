"use client"

import * as React from "react"

import { BRANCHES, type Branch, type Role } from "@/lib/tamu-data"

type AppState = {
  branch: Branch
  setBranchId: (id: string) => void
  role: Role
  setRole: (role: Role) => void
  pinned: string[]
  togglePin: (slug: string) => void
  recent: string[]
  trackRecent: (slug: string) => void
}

const AppStateContext = React.createContext<AppState | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable: the UI still works for this session
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchIdState] = React.useState(BRANCHES[0].id)
  const [role, setRoleState] = React.useState<Role>("admin")
  const [pinned, setPinned] = React.useState<string[]>([
    "analytics",
    "order-history",
    "pos-menu",
  ])
  const [recent, setRecent] = React.useState<string[]>([])

  // Hydrate from storage after mount so server and client markup match.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setBranchIdState(readStorage("tamu:branch", BRANCHES[0].id))
    setRoleState(readStorage<Role>("tamu:role", "admin"))
    setPinned(
      readStorage("tamu:pinned", ["analytics", "order-history", "pos-menu"])
    )
    setRecent(readStorage("tamu:recent", []))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const value = React.useMemo<AppState>(
    () => ({
      branch: BRANCHES.find((b) => b.id === branchId) ?? BRANCHES[0],
      setBranchId: (id) => {
        setBranchIdState(id)
        writeStorage("tamu:branch", id)
      },
      role,
      setRole: (r) => {
        setRoleState(r)
        writeStorage("tamu:role", r)
      },
      pinned,
      togglePin: (slug) =>
        setPinned((prev) => {
          const next = prev.includes(slug)
            ? prev.filter((s) => s !== slug)
            : [...prev, slug]
          writeStorage("tamu:pinned", next)
          return next
        }),
      recent,
      trackRecent: (slug) =>
        setRecent((prev) => {
          const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 6)
          writeStorage("tamu:recent", next)
          return next
        }),
    }),
    [branchId, role, pinned, recent]
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider")
  return ctx
}
