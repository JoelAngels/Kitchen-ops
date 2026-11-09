import {
  ChartColumnIcon,
  ChefHatIcon,
  ClipboardListIcon,
  ListChecksIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  type LucideIcon,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*  Procurement mock data. Replace with real API calls during integration.    */
/* -------------------------------------------------------------------------- */

export const PROCUREMENT_BASE = "/admin/procurement"

export type ProcurementSection = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
}

export const PROCUREMENT_NAV: ProcurementSection[] = [
  {
    slug: "setup",
    title: "Setup",
    description: "Suppliers, storage places and units",
    icon: ListChecksIcon,
  },
  {
    slug: "inventory",
    title: "Inventory",
    description: "Every item you buy, what it costs and what's on hand",
    icon: PackageIcon,
  },
  {
    slug: "stock",
    title: "Stock",
    description: "Counts, usage and store requests",
    icon: ClipboardListIcon,
  },
  {
    slug: "recipes",
    title: "Recipes",
    description: "What goes into each dish, and what it costs to make",
    icon: ChefHatIcon,
  },
  {
    slug: "purchasing",
    title: "Purchasing",
    description: "Purchase orders, deliveries and supplier invoices",
    icon: ShoppingCartIcon,
  },
  {
    slug: "analytics",
    title: "Analytics",
    description: "Food cost, variance and spend over time",
    icon: ChartColumnIcon,
  },
  {
    slug: "settings",
    title: "Settings",
    description: "Approvals, count rules and defaults",
    icon: SettingsIcon,
  },
]

export function procurementHref(slug: string) {
  return `${PROCUREMENT_BASE}/${slug}`
}

export function findProcurementSection(slug: string) {
  return PROCUREMENT_NAV.find((s) => s.slug === slug)
}

/* -------------------------------- Categories ------------------------------- */

export type ItemKind = "food" | "non-food"

export type TopCategory = {
  name: string
  kind: ItemKind
  subs: string[]
}

export const CATEGORY_TREE: TopCategory[] = [
  { name: "Beverages", kind: "food", subs: [] },
  {
    name: "Food",
    kind: "food",
    subs: [
      "Condiments",
      "Dairy",
      "Dairy & Eggs",
      "Dry Goods",
      "Meat",
      "Seafood",
      "Seasonings",
      "Vegetables",
    ],
  },
  { name: "Supplies", kind: "non-food", subs: [] },
  { name: "Wine", kind: "food", subs: [] },
]

export function kindOf(category: string): ItemKind {
  return CATEGORY_TREE.find((c) => c.name === category)?.kind ?? "food"
}

/* ---------------------------------- Items ---------------------------------- */

export type InventoryItem = {
  id: string
  name: string
  category: string
  sub?: string
  unit: string
  /** e.g. "1000 g each": how much one unit holds. */
  pack?: string
  stock: number
  par: number
  cost: number
}

export type StockStatus = "in" | "low" | "out"

export function stockStatus(
  item: Pick<InventoryItem, "stock" | "par">
): StockStatus {
  if (item.stock <= 0) return "out"
  if (item.par > 0 && item.stock < item.par) return "low"
  return "in"
}

const KG = { unit: "kg", pack: "1000 g each" }
const LITRE = { unit: "litre", pack: "1000 ml each" }

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "beef",
    name: "Beef",
    category: "Food",
    sub: "Meat",
    ...KG,
    stock: 10,
    par: 0,
    cost: 650,
  },
  {
    id: "black-pepper",
    name: "Black pepper",
    category: "Food",
    sub: "Seasonings",
    ...KG,
    stock: 1,
    par: 0,
    cost: 600,
  },
  {
    id: "bottled-water",
    name: "Bottled water",
    category: "Beverages",
    unit: "bottle",
    pack: "700 ml each",
    stock: 48,
    par: 0,
    cost: 35,
  },
  {
    id: "butter",
    name: "Butter",
    category: "Food",
    sub: "Dairy",
    ...KG,
    stock: 2,
    par: 0,
    cost: 900,
  },
  {
    id: "cheddar",
    name: "Cheddar cheese",
    category: "Food",
    sub: "Dairy",
    ...KG,
    stock: 3,
    par: 0,
    cost: 1200,
  },
  {
    id: "chicken",
    name: "Chicken",
    category: "Food",
    sub: "Meat",
    ...KG,
    stock: 10,
    par: 0,
    cost: 450,
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "Beverages",
    ...KG,
    stock: 2,
    par: 0,
    cost: 1200,
  },
  {
    id: "cooking-oil",
    name: "Cooking oil",
    category: "Food",
    sub: "Dry Goods",
    ...LITRE,
    stock: 20,
    par: 0,
    cost: 300,
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Food",
    sub: "Dairy & Eggs",
    unit: "tray (30)",
    stock: 5,
    par: 0,
    cost: 450,
  },
  {
    id: "fresh-fish",
    name: "Fresh fish",
    category: "Food",
    sub: "Seafood",
    ...KG,
    stock: 5,
    par: 0,
    cost: 800,
  },
  {
    id: "garlic",
    name: "Garlic",
    category: "Food",
    sub: "Seasonings",
    ...KG,
    stock: 2,
    par: 0,
    cost: 250,
  },
  {
    id: "ginger",
    name: "Ginger",
    category: "Food",
    sub: "Seasonings",
    ...KG,
    stock: 2,
    par: 0,
    cost: 220,
  },
  {
    id: "green-peppers",
    name: "Green peppers",
    category: "Food",
    sub: "Vegetables",
    ...KG,
    stock: 5,
    par: 0,
    cost: 180,
  },
  {
    id: "mayonnaise",
    name: "Mayonnaise",
    category: "Food",
    sub: "Condiments",
    ...LITRE,
    stock: 5,
    par: 0,
    cost: 350,
  },
  {
    id: "milk",
    name: "Milk",
    category: "Food",
    sub: "Dairy",
    ...LITRE,
    stock: 10,
    par: 0,
    cost: 90,
  },
  {
    id: "onions",
    name: "Onions",
    category: "Food",
    sub: "Vegetables",
    ...KG,
    stock: 10,
    par: 0,
    cost: 100,
  },
  {
    id: "potatoes",
    name: "Potatoes",
    category: "Food",
    sub: "Vegetables",
    ...KG,
    stock: 20,
    par: 0,
    cost: 100,
  },
  {
    id: "rice",
    name: "Rice",
    category: "Food",
    sub: "Dry Goods",
    ...KG,
    stock: 25,
    par: 0,
    cost: 180,
  },
  {
    id: "salt",
    name: "Salt",
    category: "Food",
    sub: "Seasonings",
    ...KG,
    stock: 2,
    par: 0,
    cost: 80,
  },
  {
    id: "soft-drinks",
    name: "Soft drinks",
    category: "Beverages",
    unit: "bottle",
    pack: "750 ml each",
    stock: 48,
    par: 0,
    cost: 60,
  },
  {
    id: "sugar",
    name: "Sugar",
    category: "Food",
    sub: "Dry Goods",
    ...KG,
    stock: 10,
    par: 0,
    cost: 180,
  },
  {
    id: "tea-leaves",
    name: "Tea leaves",
    category: "Beverages",
    ...KG,
    stock: 2,
    par: 0,
    cost: 500,
  },
  {
    id: "tomato-sauce",
    name: "Tomato sauce",
    category: "Food",
    sub: "Condiments",
    ...LITRE,
    stock: 5,
    par: 0,
    cost: 250,
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    category: "Food",
    sub: "Vegetables",
    ...KG,
    stock: 10,
    par: 0,
    cost: 120,
  },
  {
    id: "wheat-flour",
    name: "Wheat flour",
    category: "Food",
    sub: "Dry Goods",
    ...KG,
    stock: 10,
    par: 0,
    cost: 150,
  },
]

/* ------------------------------- Stock counts ------------------------------ */

export type CountKind = "override" | "spot"
export type CountStatus = "in-progress" | "completed" | "approved"

export type StockCountLine = {
  itemId: string
  believed: number
  counted: number | null
}

export type StockCount = {
  id: string
  kind: CountKind
  place: string
  by: string
  date: string
  status: CountStatus
  lines: StockCountLine[]
}

export const STOCK_COUNTS: StockCount[] = [
  {
    id: "SC-0001",
    kind: "override",
    place: "Everywhere",
    by: "iamjoelangel",
    date: "2026-11-04",
    status: "completed",
    lines: INVENTORY_ITEMS.map((i) => ({
      itemId: i.id,
      believed: i.stock,
      counted: i.stock,
    })),
  },
]

export function findCount(id: string) {
  return STOCK_COUNTS.find((c) => c.id === id)
}
