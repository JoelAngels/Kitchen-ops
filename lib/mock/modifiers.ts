import { INITIAL_MENU } from "@/lib/mock/menu"

/* Item options (variants, add-ons, removals) attached to POS menu items. */

export type ModifierOption = {
  id: string
  name: string
  /** Extra charge in KSh; 0 = free. */
  price: number
  /** When set, picking this option also sends that menu item to the kitchen (e.g. a burger's fries). */
  linkedItemId: string | null
}

export type ModifierGroup = {
  id: string
  name: string
  categoryId: string
  required: boolean
  min: number
  max: number
  options: ModifierOption[]
}

export type ModifierCategory = { id: string; name: string; description: string }

export const MODIFIER_CATEGORIES: ModifierCategory[] = [
  {
    id: "sides",
    name: "Sides",
    description: "A side that comes with the dish, often a linked menu item",
  },
  {
    id: "removals",
    name: "Removals",
    description: "Take something out at no charge",
  },
  {
    id: "service",
    name: "Service",
    description: "How it's served: dine-in glass or takeaway cup",
  },
  {
    id: "variants",
    name: "Variants",
    description: "A different version of the same dish",
  },
]

const all = INITIAL_MENU.flatMap((c) => c.items)
const idOf = (name: string) => all.find((i) => i.name === name)?.id ?? null

let n = 0
const opt = (
  name: string,
  price = 0,
  linked: string | null = null
): ModifierOption => ({
  id: `opt_${++n}`,
  name,
  price,
  linkedItemId: linked ? idOf(linked) : null,
})

const friesChoice = (): ModifierGroup => ({
  id: `grp_${++n}`,
  name: "Choose your fries",
  categoryId: "sides",
  required: true,
  min: 1,
  max: 1,
  options: [
    opt("Flamin Cajun Fries", 0, "Flamin Cajun Fries"),
    opt("Homestyle Fries", 0, "Homestyle Fries"),
    opt("Seasoned Tangy Fries", 0, "Seasoned Tangy Fries"),
  ],
})

const removals = (): ModifierGroup => ({
  id: `grp_${++n}`,
  name: "Leave out",
  categoryId: "removals",
  required: false,
  min: 0,
  max: 4,
  options: [
    opt("No Cheese"),
    opt("No Onions"),
    opt("No Pickles"),
    opt("No Sauce"),
  ],
})

const service = (): ModifierGroup => ({
  id: `grp_${++n}`,
  name: "Serve",
  categoryId: "service",
  required: true,
  min: 1,
  max: 1,
  options: [opt("Dine-in"), opt("Takeaway", 30)],
})

const burgers = [
  "Homestyle Chicken Burger",
  "Korean Chicken Burger",
  "Sweet and Sassy Chicken",
  "Chili Supreme Delight",
  "Double Chili Supreme Delight",
  "The Double-Up Supreme",
  "The Solo Supreme",
]

export const INITIAL_OPTIONS: Record<string, ModifierGroup[]> = {
  ...Object.fromEntries(
    burgers.map((b) => [idOf(b), [friesChoice(), removals()]])
  ),
  [idOf("Flamin Cajun Fries")!]: [
    {
      id: `grp_${++n}`,
      name: "Heat",
      categoryId: "variants",
      required: false,
      min: 0,
      max: 1,
      options: [opt("Mild"), opt("Extra Cajun Spice", 50)],
    },
  ],
  [idOf("Homestyle Fries")!]: [
    {
      id: `grp_${++n}`,
      name: "Size",
      categoryId: "variants",
      required: false,
      min: 0,
      max: 1,
      options: [opt("Large", 150)],
    },
  ],
  [idOf("Seasoned Tangy Fries")!]: [
    {
      id: `grp_${++n}`,
      name: "Size",
      categoryId: "variants",
      required: false,
      min: 0,
      max: 1,
      options: [opt("Large", 150)],
    },
  ],
  [idOf("Loaded Fries")!]: [
    {
      id: `grp_${++n}`,
      name: "Protein",
      categoryId: "variants",
      required: true,
      min: 1,
      max: 1,
      options: [opt("Beef"), opt("Chicken")],
    },
    {
      id: `grp_${++n}`,
      name: "Fries base",
      categoryId: "sides",
      required: true,
      min: 1,
      max: 1,
      options: [
        opt("Flamin Cajun", 0, "Flamin Cajun Fries"),
        opt("Regular Fries", 0, "Homestyle Fries"),
        opt("Tangy", 0, "Seasoned Tangy Fries"),
      ],
    },
  ],
  [idOf("Lotus Biscoff")!]: [service()],
  [idOf("Ice Tea")!]: [service()],
  [idOf("Still Water")!]: [service()],
}

export const nextId = (p: string) =>
  `${p}_${++n}_${Math.random().toString(36).slice(2, 6)}`
