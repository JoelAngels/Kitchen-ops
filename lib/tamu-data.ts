import {
  BadgePercentIcon,
  BellRingIcon,
  BookOpenIcon,
  ChartColumnIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  GlobeIcon,
  GraduationCapIcon,
  HamburgerIcon,
  HeartHandshakeIcon,
  HistoryIcon,
  LayoutGridIcon,
  ListChecksIcon,
  MailIcon,
  PackageIcon,
  ReceiptTextIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SquareMenuIcon,
  TrophyIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  FileClockIcon,
  type LucideIcon,
} from "lucide-react"

import { formatNumber } from "@/lib/format"

/* -------------------------------------------------------------------------- */
/*  Mock data for the UI phase. Replace with real API calls during integration */
/* -------------------------------------------------------------------------- */

export type Role = "admin" | "manager" | "cashier" | "kitchen"

export const ROLES: { id: Role; label: string; description: string }[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Everything, across all branches",
  },
  {
    id: "manager",
    label: "Manager",
    description: "Operations, staff & reports",
  },
  { id: "cashier", label: "Cashier", description: "Orders, payments & pickup" },
  {
    id: "kitchen",
    label: "Kitchen",
    description: "Tickets, prep & checklists",
  },
]

export const ORGANIZATION = { name: "Tasty Grubs", plan: "Tamu Pro" }

export type Branch = { id: string; name: string; area: string }

export const BRANCHES: Branch[] = [
  { id: "supreme-kilimani", name: "Supreme - Kilimani", area: "Kilimani" },
  { id: "ayeyo-kilimani", name: "Ayeyo - Kilimani", area: "Kilimani" },
  { id: "lavington", name: "Lavington", area: "Lavington" },
  { id: "supreme-piazza", name: "Supreme - Piazza", area: "Westlands" },
  { id: "supreme-sarit", name: "Supreme - Sarit", area: "Westlands" },
]

export const CURRENT_USER = {
  name: "iamjoelangel",
  email: "joel@tastygrubs.co.ke",
  initials: "JA",
}

/* ------------------------------- Top-level nav ------------------------------ */

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

export const PRIMARY_NAV: NavItem[] = [
  {
    title: "Cashier",
    href: "/",
    icon: BellRingIcon,
    roles: ["admin", "manager", "cashier"],
  },
  {
    title: "Smash",
    href: "/smash",
    icon: HamburgerIcon,
    roles: ["admin", "manager", "kitchen"],
  },
  {
    title: "Pickup",
    href: "/pickup",
    icon: ShoppingBagIcon,
    roles: ["admin", "manager", "cashier", "kitchen"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: ChartColumnIcon,
    roles: ["admin", "manager"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: LayoutGridIcon,
    roles: ["admin", "manager"],
  },
]

/* ------------------------------ Admin tools -------------------------------- */

export type ToolTone =
  | "orange"
  | "violet"
  | "emerald"
  | "sky"
  | "rose"
  | "amber"
  | "slate"
  | "indigo"
  | "teal"

export type Tool = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  tone: ToolTone
  beta?: boolean
  roles: Role[]
  keywords?: string[]
}

export type ToolGroup = {
  id: string
  title: string
  icon: LucideIcon
  tools: Tool[]
}

const ALL: Role[] = ["admin", "manager", "cashier", "kitchen"]
const MGMT: Role[] = ["admin", "manager"]
const ADMIN: Role[] = ["admin"]

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "sales",
    title: "Sales, Orders & History",
    icon: ChartColumnIcon,
    tools: [
      {
        slug: "analytics",
        title: "Analytics",
        description: "Reports, trends and performance metrics",
        icon: ChartColumnIcon,
        tone: "orange",
        roles: MGMT,
        keywords: ["reports", "sales", "revenue"],
      },
      {
        slug: "order-history",
        title: "Order History",
        description: "Past orders and transaction records",
        icon: HistoryIcon,
        tone: "violet",
        roles: ["admin", "manager", "cashier"],
        keywords: ["receipts"],
      },
      {
        slug: "payment-transactions",
        title: "Payment Transactions",
        description: "Every payment provider callback",
        icon: CreditCardIcon,
        tone: "emerald",
        roles: MGMT,
        keywords: ["mpesa", "card"],
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    icon: SettingsIcon,
    tools: [
      {
        slug: "procurement",
        title: "Procurement",
        description: "Inventory, purchasing and cost analysis",
        icon: PackageIcon,
        tone: "slate",
        beta: true,
        roles: MGMT,
        keywords: ["stock", "inventory", "suppliers"],
      },
      {
        slug: "smash-tickets",
        title: "Smash Ticket History",
        description: "Completed smash tickets and item timelines",
        icon: HamburgerIcon,
        tone: "amber",
        roles: ["admin", "manager", "kitchen"],
      },
      {
        slug: "adjustments",
        title: "Adjustments",
        description: "Item moves, comps, wastage and tab changes",
        icon: RefreshCwIcon,
        tone: "indigo",
        beta: true,
        roles: MGMT,
        keywords: ["void", "comp", "waste"],
      },
      {
        slug: "report-subscriptions",
        title: "Report Subscriptions",
        description: "Who gets which email report, and how often",
        icon: MailIcon,
        tone: "sky",
        beta: true,
        roles: ADMIN,
      },
      {
        slug: "restaurant-settings",
        title: "Restaurant Settings",
        description: "Operating hours, timezone and general settings",
        icon: SettingsIcon,
        tone: "slate",
        roles: ADMIN,
      },
    ],
  },
  {
    id: "accounting",
    title: "Accounting & Tax",
    icon: ReceiptTextIcon,
    tools: [
      {
        slug: "transaction-changes",
        title: "Transaction Changes",
        description: "Category and label changes on Money Out, with approvals",
        icon: FileClockIcon,
        tone: "amber",
        roles: ADMIN,
      },
      {
        slug: "tax-compliance",
        title: "Tax & Compliance",
        description: "VAT, Catering Levy and statutory filings",
        icon: BadgePercentIcon,
        tone: "rose",
        beta: true,
        roles: ADMIN,
        keywords: ["kra", "vat"],
      },
      {
        slug: "etims",
        title: "eTIMS Dashboard",
        description: "KRA fiscal receipts and credit notes",
        icon: ReceiptTextIcon,
        tone: "sky",
        beta: true,
        roles: ADMIN,
        keywords: ["kra", "fiscal"],
      },
    ],
  },
  {
    id: "staff",
    title: "Staff",
    icon: UsersIcon,
    tools: [
      {
        slug: "users",
        title: "User Management",
        description: "System users and their access levels",
        icon: UsersIcon,
        tone: "indigo",
        roles: ADMIN,
      },
      {
        slug: "roles",
        title: "Roles & Privileges",
        description: "See what each role can access",
        icon: ShieldCheckIcon,
        tone: "violet",
        beta: true,
        roles: ADMIN,
        keywords: ["permissions"],
      },
      {
        slug: "payroll",
        title: "Payroll & Staff",
        description: "Runs, payments, staff records and attendance",
        icon: WalletIcon,
        tone: "emerald",
        beta: true,
        roles: ADMIN,
        keywords: ["salary", "tamupay"],
      },
      {
        slug: "people",
        title: "People & HR",
        description: "Attendance, leave, notices and the HR assistant",
        icon: HeartHandshakeIcon,
        tone: "rose",
        beta: true,
        roles: MGMT,
        keywords: ["leave", "handbook"],
      },
    ],
  },
  {
    id: "service",
    title: "Service & Menu",
    icon: SquareMenuIcon,
    tools: [
      {
        slug: "pos-menu",
        title: "POS Menu",
        description: "Dishes and prices for the ordering system",
        icon: SquareMenuIcon,
        tone: "slate",
        roles: MGMT,
        keywords: ["dishes", "prices"],
      },
      {
        slug: "item-options",
        title: "Item Options",
        description: "Variants, add-ons and combos",
        icon: ListChecksIcon,
        tone: "teal",
        roles: MGMT,
        keywords: ["modifiers"],
      },
      {
        slug: "tables",
        title: "Table Management",
        description: "Tables, seating and floor layout",
        icon: LayoutGridIcon,
        tone: "emerald",
        roles: MGMT,
      },
      {
        slug: "promotions",
        title: "Promotions & Deals",
        description: "Discounts, BOGO offers and bundles",
        icon: BadgePercentIcon,
        tone: "orange",
        beta: true,
        roles: MGMT,
        keywords: ["discount", "offer"],
      },
    ],
  },
  {
    id: "online",
    title: "Online Channels",
    icon: GlobeIcon,
    tools: [
      {
        slug: "website",
        title: "Website",
        description: "Site status, menu categories and theme",
        icon: GlobeIcon,
        tone: "indigo",
        roles: ADMIN,
      },
      {
        slug: "delivery",
        title: "Delivery Monitor",
        description: "Live Glovo deliveries: cancel, reassign, refresh",
        icon: TruckIcon,
        tone: "orange",
        beta: true,
        roles: ["admin", "manager", "cashier"],
        keywords: ["glovo", "uber"],
      },
    ],
  },
  {
    id: "training",
    title: "Training",
    icon: GraduationCapIcon,
    tools: [
      {
        slug: "sops",
        title: "SOP Management",
        description: "Training guides, written with AI help",
        icon: BookOpenIcon,
        tone: "indigo",
        roles: ALL,
      },
      {
        slug: "training-decks",
        title: "Training Decks",
        description: "Slide-based training modules for staff",
        icon: GraduationCapIcon,
        tone: "teal",
        beta: true,
        roles: ALL,
      },
      {
        slug: "quizzes",
        title: "Quiz Dashboard",
        description: "Team quiz scores and pass rates",
        icon: TrophyIcon,
        tone: "emerald",
        roles: MGMT,
      },
      {
        slug: "checklists",
        title: "Checklist Management",
        description: "Daily checklists, written with AI help",
        icon: ClipboardCheckIcon,
        tone: "teal",
        beta: true,
        roles: ALL,
      },
    ],
  },
]

export const ALL_TOOLS = TOOL_GROUPS.flatMap((g) =>
  g.tools.map((t) => ({ ...t, group: g.title }))
)

export function toolHref(slug: string) {
  return `/admin/${slug}`
}

export function findTool(slug: string) {
  return ALL_TOOLS.find((t) => t.slug === slug)
}

export const TONE_CLASSES: Record<ToolTone, string> = {
  orange:
    "bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-400",
  violet:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  emerald:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  sky: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  rose: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
  amber: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  slate: "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
  indigo:
    "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20 dark:text-indigo-400",
  teal: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400",
}

/* --------------------------------- Orders ---------------------------------- */

export type OrderStatus = "new" | "preparing" | "ready"
export type OrderType = "Dine in" | "Takeaway" | "Delivery"

export type Order = {
  id: string
  number: number
  customer: string
  type: OrderType
  items: { name: string; qty: number }[]
  total: number
  status: OrderStatus
  createdAt: number
}

export const MENU_SAMPLE = [
  "Classic Smash",
  "Double Smash",
  "Spicy Chicken Burger",
  "Loaded Fries",
  "Oreo Shake",
  "Buffalo Wings (6)",
  "Coke 500ml",
  "Garlic Mayo",
]

export const CUSTOMERS = [
  "Wanjiru",
  "Otieno",
  "Amina",
  "Kamau",
  "Achieng",
  "Mwangi",
  "Njeri",
  "Hassan",
  "Table 4",
  "Table 7",
]

/* -------------------------------- Analytics -------------------------------- */

export const MENU_CATEGORIES = [
  "Beverages",
  "Chicken burgers",
  "Fries",
  "Modifier",
  "Shakes",
  "Sides & sauces",
  "Smash burgers",
  "Soft drinks",
  "Wings",
]

export function formatKES(value: number) {
  return `KSh ${formatNumber(value)}`
}
