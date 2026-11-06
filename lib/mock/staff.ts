import {
  BoxIcon,
  ChefHatIcon,
  CreditCardIcon,
  HeadsetIcon,
  ShieldIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react"

import { MOCK_NOW } from "@/lib/mock/transactions"

/* Staff accounts and the permission model, shared by User Management and Roles & Privileges. */

export type StaffRoleId =
  "admin" | "manager" | "cashier" | "cx" | "pickup" | "smash"

export type StaffRole = {
  id: StaffRoleId
  name: string
  description: string
  icon: LucideIcon
  /** Tailwind classes for the role's tinted surfaces. */
  tint: string
  iconClass: string
}

export const STAFF_ROLES: StaffRole[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Everything, across every branch, including payroll and tax",
    icon: ShieldIcon,
    tint: "border-red-500/25 bg-red-500/[0.04]",
    iconClass: "text-red-600 dark:text-red-400",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Runs the floor: overrides, comps, reports and staff rotas",
    icon: UserCogIcon,
    tint: "border-violet-500/25 bg-violet-500/[0.04]",
    iconClass: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "cashier",
    name: "Cashier",
    description: "Takes orders and payments, closes tabs",
    icon: CreditCardIcon,
    tint: "border-amber-500/30 bg-amber-500/[0.05]",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "cx",
    name: "CX Admin",
    description: "Customer messages, deliveries and the website",
    icon: HeadsetIcon,
    tint: "border-border bg-card",
    iconClass: "text-foreground",
  },
  {
    id: "pickup",
    name: "Pickup Station",
    description: "The pickup board: marks orders collected",
    icon: BoxIcon,
    tint: "border-indigo-500/25 bg-indigo-500/[0.04]",
    iconClass: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "smash",
    name: "Smash Station",
    description: "Kitchen screen for the smash grill",
    icon: ChefHatIcon,
    tint: "border-rose-500/25 bg-rose-500/[0.04]",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
]

export type Access = "full" | "view" | "none"

export type Permission = { id: string; label: string; area: string }

export const PERMISSIONS: Permission[] = [
  { id: "orders", label: "Take orders & open tabs", area: "Service" },
  { id: "payments", label: "Take payments", area: "Service" },
  { id: "smash", label: "Smash kitchen screen", area: "Service" },
  { id: "pickup", label: "Pickup board", area: "Service" },
  { id: "void", label: "Void items & cancel tabs", area: "Service" },
  { id: "comp", label: "Comp items", area: "Service" },
  { id: "analytics", label: "Analytics & reports", area: "Sales" },
  { id: "history", label: "Order history", area: "Sales" },
  { id: "transactions", label: "Payment transactions", area: "Sales" },
  { id: "refunds", label: "Refunds", area: "Sales" },
  { id: "menu", label: "POS menu & item options", area: "Menu" },
  { id: "promos", label: "Promotions & deals", area: "Menu" },
  { id: "procurement", label: "Procurement & stock", area: "Operations" },
  { id: "settings", label: "Restaurant settings", area: "Operations" },
  { id: "users", label: "Users & roles", area: "Staff" },
  { id: "payroll", label: "Payroll", area: "Staff" },
  { id: "tax", label: "Tax, VAT & eTIMS", area: "Accounting" },
  { id: "delivery", label: "Delivery monitor", area: "Online" },
  { id: "website", label: "Website & WhatsApp", area: "Online" },
  { id: "training", label: "SOPs, checklists & quizzes", area: "Training" },
]

const F = "full" as const
const V = "view" as const

export const ROLE_ACCESS: Record<
  StaffRoleId,
  Partial<Record<string, Access>>
> = {
  admin: Object.fromEntries(PERMISSIONS.map((p) => [p.id, F])),
  manager: {
    orders: F,
    payments: F,
    smash: F,
    pickup: F,
    void: F,
    comp: F,
    analytics: F,
    history: F,
    transactions: V,
    refunds: V,
    menu: F,
    promos: F,
    procurement: F,
    settings: V,
    users: V,
    delivery: F,
    website: V,
    training: F,
  },
  cashier: {
    orders: F,
    payments: F,
    pickup: F,
    history: V,
    delivery: V,
    training: V,
  },
  cx: { history: V, delivery: F, website: F, pickup: V, training: V },
  pickup: { pickup: F, training: V },
  smash: { smash: F, training: V },
}

export type StaffStatus = "active" | "invited" | "disabled"

export type StaffUser = {
  id: string
  name: string
  username: string
  phone: string
  email: string | null
  role: StaffRoleId
  branches: string[]
  status: StaffStatus
  pinSet: boolean
  lastActive: number | null
}

const H = 3_600_000
const D = 24 * H

export const MOCK_STAFF: StaffUser[] = [
  {
    id: "u1",
    name: "Joel Angel",
    username: "iamjoelangel",
    phone: "0712 345 678",
    email: "joel@tastygrubs.co.ke",
    role: "admin",
    branches: ["all"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 0.1 * H,
  },
  {
    id: "u2",
    name: "Kevin Kamau",
    username: "kevin",
    phone: "0722 111 222",
    email: "kevin@tastygrubs.co.ke",
    role: "admin",
    branches: ["all"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 5 * H,
  },
  {
    id: "u3",
    name: "Amina Hassan",
    username: "amina",
    phone: "0733 456 789",
    email: "amina@tastygrubs.co.ke",
    role: "admin",
    branches: ["all"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 2 * D,
  },
  {
    id: "u4",
    name: "Wanjiku Mwangi",
    username: "wanjiku",
    phone: "0701 222 333",
    email: "wanjiku@tastygrubs.co.ke",
    role: "manager",
    branches: ["supreme-kilimani", "ayeyo-kilimani"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 1 * H,
  },
  {
    id: "u5",
    name: "Ali Omar",
    username: "ali",
    phone: "0745 987 654",
    email: null,
    role: "cashier",
    branches: ["supreme-kilimani"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 0.5 * H,
  },
  {
    id: "u6",
    name: "Grace Wambui",
    username: "grace",
    phone: "0756 321 987",
    email: null,
    role: "cashier",
    branches: ["supreme-kilimani"],
    status: "active",
    pinSet: false,
    lastActive: MOCK_NOW - 20 * H,
  },
  {
    id: "u7",
    name: "Mercy Achieng",
    username: "mercy",
    phone: "0768 654 321",
    email: null,
    role: "cashier",
    branches: ["supreme-sarit"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 3 * D,
  },
  {
    id: "u8",
    name: "Hassan Ali",
    username: "hassan.cx",
    phone: "0790 112 233",
    email: "cx@tastygrubs.co.ke",
    role: "cx",
    branches: ["all"],
    status: "active",
    pinSet: true,
    lastActive: MOCK_NOW - 3 * H,
  },
  {
    id: "u9",
    name: "Pickup Tablet",
    username: "pickup-kilimani",
    phone: "—",
    email: null,
    role: "pickup",
    branches: ["supreme-kilimani"],
    status: "active",
    pinSet: false,
    lastActive: MOCK_NOW - 0.2 * H,
  },
  {
    id: "u10",
    name: "Smash Grill Screen",
    username: "smash-kilimani",
    phone: "—",
    email: null,
    role: "smash",
    branches: ["supreme-kilimani"],
    status: "active",
    pinSet: false,
    lastActive: MOCK_NOW - 0.2 * H,
  },
  {
    id: "u11",
    name: "Brian Otieno",
    username: "brian",
    phone: "0711 445 566",
    email: "brian@tastygrubs.co.ke",
    role: "smash",
    branches: ["supreme-kilimani", "lavington"],
    status: "invited",
    pinSet: false,
    lastActive: null,
  },
  {
    id: "u12",
    name: "Peter Njoroge",
    username: "peter",
    phone: "0729 778 899",
    email: null,
    role: "cashier",
    branches: ["lavington"],
    status: "disabled",
    pinSet: true,
    lastActive: MOCK_NOW - 41 * D,
  },
]

export function relativeTime(t: number | null) {
  if (t === null) return "Never"
  const mins = Math.round((MOCK_NOW - t) / 60_000)
  if (mins < 5) return "Online now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? "Yesterday" : `${days} days ago`
}

export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
