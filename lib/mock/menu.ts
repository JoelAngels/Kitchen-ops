/* POS menu, taken from the live Tamu menu. Images are emoji placeholders until real photos are wired in. */

export type MenuItemType = "F&B" | "Retail"

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  subcategory: string | null
  type: MenuItemType
  visible: boolean
  online: boolean
  eightySixed: boolean
  labels: string[]
}

export type MenuCategory = {
  id: string
  name: string
  emoji: string
  visible: boolean
  items: MenuItem[]
}

let n = 0
const item = (
  name: string,
  description: string,
  price: number,
  emoji: string,
  extra: Partial<MenuItem> = {}
): MenuItem => ({
  id: `item_${++n}`,
  name,
  description,
  price,
  emoji,
  subcategory: null,
  type: "F&B",
  visible: true,
  online: true,
  eightySixed: false,
  labels: [],
  ...extra,
})

export const DIETARY_LABELS = [
  { id: "D", name: "Dairy", className: "bg-sky-500" },
  { id: "V", name: "Vegetarian", className: "bg-emerald-500" },
  { id: "N", name: "Nuts", className: "bg-amber-500" },
  { id: "F", name: "Fish", className: "bg-teal-500" },
  { id: "P", name: "Pork", className: "bg-rose-500" },
]

export const INITIAL_MENU: MenuCategory[] = [
  {
    id: "cat_smash",
    name: "Smash Burgers",
    emoji: "🍔",
    visible: true,
    items: [
      item(
        "The Solo Supreme",
        "Single patty smash burger with double cheese, caramelized onions and supreme sauce",
        1400,
        "🍔",
        { labels: ["D"] }
      ),
      item(
        "The Double-Up Supreme",
        "Double patty smash burger with double cheese, caramelized onions and supreme sauce",
        1600,
        "🍔",
        { labels: ["D"] }
      ),
      item(
        "Chili Supreme Delight",
        "Single patty smash burger with double cheese, caramelized onions and chili",
        1500,
        "🌶️",
        { labels: ["D"] }
      ),
      item(
        "Double Chili Supreme Delight",
        "Double patty smash burger with cheese, caramelized onions and chili",
        1600,
        "🌶️",
        { labels: ["D"] }
      ),
      item("test burger", "", 1, "🧪", { online: false, visible: false }),
    ],
  },
  {
    id: "cat_chicken",
    name: "Chicken Burgers",
    emoji: "🍗",
    visible: true,
    items: [
      item(
        "Homestyle Chicken Burger",
        "Classic buttermilk fried chicken patty in special herbs and spices",
        1300,
        "🍗"
      ),
      item(
        "Korean Chicken Burger",
        "Fried chicken patty tossed in homemade gochujang sauce",
        1300,
        "🍗"
      ),
      item(
        "Sweet and Sassy Chicken",
        "Fried chicken patty tossed in honey and sweet jalapeño",
        1300,
        "🍗"
      ),
    ],
  },
  {
    id: "cat_wings",
    name: "Wings",
    emoji: "🔥",
    visible: true,
    items: [
      item(
        "Sweet and Sassy Wings",
        "Six pieces of crispy wings tossed in a honey and sweet jalapeño glaze",
        900,
        "🍗"
      ),
      item(
        "BBQ Wings",
        "Six pieces of crispy wings tossed in a homemade BBQ sauce",
        900,
        "🍗"
      ),
      item(
        "Korean Wings",
        "Six pieces of crispy chicken wings tossed in homemade gochujang",
        900,
        "🍗",
        { eightySixed: true }
      ),
    ],
  },
  {
    id: "cat_fries",
    name: "Fries",
    emoji: "🍟",
    visible: true,
    items: [
      item(
        "Loaded Fries",
        "Classic fries topped with a supreme cheese sauce and crispy bits",
        1200,
        "🍟",
        { labels: ["D"] }
      ),
      item(
        "Homestyle Fries",
        "Crispy, golden classic fries. A delicious homestyle companion",
        500,
        "🍟",
        { labels: ["V"] }
      ),
      item(
        "Flamin Cajun Fries",
        "Spicy, seasoned cajun-inspired fries with a fiery flavour",
        500,
        "🍟",
        { labels: ["V"] }
      ),
      item(
        "Seasoned Tangy Fries",
        "Zesty flavourful fries with a tangy and savoury seasoning",
        500,
        "🍟",
        { labels: ["V"] }
      ),
    ],
  },
  {
    id: "cat_sides",
    name: "Sides & Sauces",
    emoji: "🥗",
    visible: true,
    items: [
      item(
        "Apple Slaw",
        "A refreshing mix of crisp apples and tangy coleslaw",
        350,
        "🥗",
        { labels: ["V"] }
      ),
      item(
        "Homemade Korean Sauce",
        "A homemade Korean sauce bursting with authentic flavour",
        200,
        "🥣"
      ),
      item(
        "Sweet and Sassy Sauce",
        "A delectable sauce combining sweetness and a hint of heat",
        200,
        "🍯"
      ),
      item(
        "Honey Mustard Sauce",
        "A smooth blend of honey and mustard with the perfect tang",
        200,
        "🍯"
      ),
      item(
        "Mayonnaise",
        "Creamy and smooth mayonnaise with a rich, tangy taste",
        200,
        "🥚",
        { subcategory: "Sauces" }
      ),
      item(
        "Supreme Mayo",
        "Our signature supreme mayo: creamy, bold and packed with flavour",
        200,
        "🧡"
      ),
    ],
  },
  {
    id: "cat_soft",
    name: "Soft Drinks",
    emoji: "🥤",
    visible: true,
    items: [
      item(
        "7UP",
        "Crisp refreshing lemon-lime flavour with bubbly fizz",
        300,
        "🥤",
        { type: "Retail" }
      ),
      item(
        "Ice Tea",
        "Chilled iced tea with a smooth, refreshing taste",
        400,
        "🧋"
      ),
      item(
        "Mirinda Orange",
        "Vibrant orange soda with a crisp, citrusy flavour",
        300,
        "🥤",
        { type: "Retail" }
      ),
      item("Mountain Dew", "Soda", 300, "🥤", { type: "Retail" }),
      item(
        "Pepsi 500 ml",
        "Classic cola with a refreshing, crisp citrusy taste",
        300,
        "🥤",
        { type: "Retail" }
      ),
      item(
        "Pepsi (Zero Sugar)",
        "Sugar-free cola with the same refreshing Pepsi taste",
        300,
        "🥤",
        { type: "Retail" }
      ),
      item(
        "Sparkling Water",
        "Lightly carbonated water for crisp, refreshing hydration",
        300,
        "💧",
        { type: "Retail" }
      ),
      item("Still Water", "250ml", 250, "💧", { type: "Retail" }),
    ],
  },
  {
    id: "cat_juices",
    name: "Juices",
    emoji: "🧃",
    visible: true,
    items: [
      item(
        "Tamarind Juice",
        "Cool, tangy juice bursting with the bold refreshing taste of tamarind",
        400,
        "🧃",
        { labels: ["V"] }
      ),
      item(
        "Apple, Passion & Mango Juice",
        "Freshly squeezed apple, passion fruit and mango",
        400,
        "🥭",
        { labels: ["V"] }
      ),
      item(
        "Orange Juice",
        "Freshly squeezed orange juice, natural sweetness and zest",
        400,
        "🍊",
        { labels: ["V"] }
      ),
    ],
  },
  {
    id: "cat_shakes",
    name: "Shakes",
    emoji: "🥛",
    visible: true,
    items: [
      item(
        "Lotus Biscoff",
        "Creamy shake blended with the indulgent taste of Lotus Biscoff",
        550,
        "🥤",
        { labels: ["D"] }
      ),
      item(
        "Oreo Milkshake",
        "Creamy chocolate milkshake blended with crushed Oreos",
        550,
        "🥤",
        { labels: ["D"] }
      ),
      item(
        "Peanut Butter Milkshake",
        "Rich and creamy peanut butter milkshake",
        550,
        "🥜",
        { labels: ["D", "N"] }
      ),
      item("Salted Caramel Milkshake", "Salted caramel milkshake", 550, "🥤", {
        labels: ["D"],
      }),
      item("Vanilla Shake", "Smooth and creamy vanilla milkshake", 550, "🍦", {
        labels: ["D"],
      }),
    ],
  },
  {
    id: "cat_mojitos",
    name: "Mojitos",
    emoji: "🍹",
    visible: true,
    items: [
      item(
        "Strawberry Mojito",
        "Strawberry-infused mojito with fresh mint and lime",
        500,
        "🍓"
      ),
      item(
        "Tamarind Mojito",
        "Tart tamarind mojito blended with fresh mint and lime",
        500,
        "🍹"
      ),
      item(
        "Classic Mojito",
        "Refreshing blend of mint, lime and soda with a bubbly finish",
        400,
        "🍹"
      ),
    ],
  },
  {
    id: "cat_retired",
    name: "Retired specials",
    emoji: "📦",
    visible: false,
    items: [
      item("Ramadan Iftar Box", "Seasonal iftar combo", 1800, "🌙", {
        visible: false,
      }),
      item(
        "Valentine's Double",
        "Two double smashes and a shake to share",
        3200,
        "💘",
        { visible: false }
      ),
      item("World Cup Wings Bucket", "Twenty wings for match day", 3500, "⚽", {
        visible: false,
      }),
    ],
  },
]
