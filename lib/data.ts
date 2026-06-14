import type { Dish, RestaurantTable } from "./types";

export const DISHES: Dish[] = [
  { id: "d1", name: "Lemon Butter Salmon", price: 22, rating: 4.8, category: "Specials",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=70",
    calories: 320, prepMinutes: 15,
    description: "Pan-seared Atlantic salmon glazed in a citrus-forward lemon butter, finished with chive oil and seasonal microgreens." },
  { id: "d2", name: "Herb-Crusted Chicken", price: 29, rating: 4.6, category: "Specials",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=70",
    calories: 280, prepMinutes: 18,
    description: "Free-range chicken breast under a rosemary-thyme crust, served over heirloom carrot purée." },
  { id: "d3", name: "Grilled Lamb Chops", price: 32, rating: 4.9, category: "Main",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=70",
    calories: 410, prepMinutes: 22,
    description: "New Zealand lamb chops, charred over oak, paired with mint chimichurri." },
  { id: "d4", name: "Char-Grilled Filet Mignon", price: 38, rating: 4.8, category: "Main",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
    calories: 250, prepMinutes: 10,
    description: "Indulge in our exquisite Char-Grilled Filet Mignon, a luxurious cut of prime beef, expertly prepared to perfection. This tender, juicy filet is seasoned with our chef's signature herb blend and finished with a red-wine reduction." },
  { id: "d5", name: "Truffle Pasta", price: 28, rating: 4.9, category: "Seasonal",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=70",
    calories: 540, prepMinutes: 14,
    description: "Hand-rolled tagliatelle tossed with black truffle, brown butter and aged parmesan." },
  { id: "d6", name: "Bruschetta", price: 12, rating: 4.5, category: "Appetizers",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=70",
    calories: 180, prepMinutes: 6,
    description: "Toasted sourdough, vine-ripened tomato, basil, garlic confit." },
  { id: "d7", name: "Chocolate Lava Cake", price: 11, rating: 4.9, category: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=70",
    calories: 460, prepMinutes: 8,
    description: "Warm Valrhona dark chocolate, molten center, vanilla bean ice cream." },

  // ── Specials ──
  { id: "d8", name: "Seared Scallops", price: 26, rating: 4.8, category: "Specials",
    image: "https://images.unsplash.com/photo-1532980400857-e8d9d275d858?auto=format&fit=crop&w=900&q=70",
    calories: 240, prepMinutes: 12,
    description: "Diver scallops seared golden, set on cauliflower purée with a brown-butter caper sauce." },
  { id: "d9", name: "Duck Confit", price: 34, rating: 4.9, category: "Specials",
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=900&q=70",
    calories: 520, prepMinutes: 20,
    description: "Slow-cooked duck leg, crisp skin, with garlic potatoes and a cherry gastrique." },

  // ── Seasonal ──
  { id: "d10", name: "Pumpkin Risotto", price: 24, rating: 4.7, category: "Seasonal",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=70",
    calories: 480, prepMinutes: 18,
    description: "Creamy arborio risotto with roasted pumpkin, sage and toasted pumpkin seeds." },
  { id: "d11", name: "Heirloom Beet Salad", price: 16, rating: 4.6, category: "Seasonal",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=70",
    calories: 210, prepMinutes: 9,
    description: "Roasted heirloom beets, whipped goat cheese, candied walnuts and citrus vinaigrette." },

  // ── Appetizers ──
  { id: "d12", name: "Caprese Salad", price: 14, rating: 4.6, category: "Appetizers",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=900&q=70",
    calories: 230, prepMinutes: 7,
    description: "Buffalo mozzarella, vine tomatoes, fresh basil and aged balsamic." },
  { id: "d13", name: "Crispy Calamari", price: 17, rating: 4.7, category: "Appetizers",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=70",
    calories: 320, prepMinutes: 10,
    description: "Lightly battered calamari, lemon aioli and a chili-lime dust." },
  { id: "d14", name: "Tuna Tartare", price: 19, rating: 4.8, category: "Appetizers",
    image: "https://images.unsplash.com/photo-1625938145744-e380515399b7?auto=format&fit=crop&w=900&q=70",
    calories: 200, prepMinutes: 8,
    description: "Sushi-grade tuna, avocado, sesame and a yuzu-soy dressing on crisp wonton." },

  // ── Main courses ──
  { id: "d15", name: "Beef Wellington", price: 45, rating: 4.9, category: "Main",
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=900&q=70",
    calories: 620, prepMinutes: 30,
    description: "Prime beef tenderloin wrapped in mushroom duxelles and golden puff pastry." },
  { id: "d16", name: "Seafood Paella", price: 36, rating: 4.7, category: "Main",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=900&q=70",
    calories: 560, prepMinutes: 25,
    description: "Saffron rice with prawns, mussels, clams and chorizo, finished tableside." },
  { id: "d17", name: "Wild Mushroom Risotto", price: 25, rating: 4.6, category: "Main",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=70",
    calories: 500, prepMinutes: 18,
    description: "Carnaroli rice, wild mushrooms, white wine and 24-month parmesan." },

  // ── Desserts ──
  { id: "d18", name: "Tiramisu", price: 10, rating: 4.8, category: "Desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=70",
    calories: 380, prepMinutes: 6,
    description: "Espresso-soaked savoiardi, mascarpone cream and cocoa dust." },
  { id: "d19", name: "Crème Brûlée", price: 11, rating: 4.9, category: "Desserts",
    image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=900&q=70",
    calories: 340, prepMinutes: 7,
    description: "Madagascar vanilla custard under a torched caramel crust." },
  { id: "d20", name: "Berry Pavlova", price: 12, rating: 4.7, category: "Desserts",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=70",
    calories: 290, prepMinutes: 8,
    description: "Crisp meringue, Chantilly cream and a tumble of fresh seasonal berries." },
];

// Realistic interior photos (Unsplash) shown when a table is selected.
const IMG = {
  windowRound: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  centerHall:  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  banquette:   "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  booth:       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  barside:     "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
  nook:        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
  patio:       "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80",
  ocean:       "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=900&q=80",
  garden:      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80",
  longtable:   "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=900&q=80",
  private:     "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=900&q=80",
} as const;

// Wide panoramic photos for the 360°/AR viewer, per zone.
const PANO: Record<string, string> = {
  Indoor: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2400&q=80",
  Outdoor: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=2400&q=80",
  "Garden Terrace": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=2400&q=80",
  "Private Meeting": "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=2400&q=80",
};

type TableSeed = Omit<RestaurantTable, "pano">;

/** Coordinates on a 100×100 grid — scales to any viewport */
const TABLE_SEEDS: TableSeed[] = [
  // Indoor
  { id: "t01", label: "T-01", zone: "Indoor", shape: "round",  seats: 2, x: 18, y: 30, rotation: 0,
    position: "Window-side · Quiet corner", status: "available", image: IMG.windowRound },
  { id: "t02", label: "T-02", zone: "Indoor", shape: "rect",   seats: 6, x: 50, y: 22, rotation: 0,
    position: "Center hall · Near kitchen pass", status: "available", image: IMG.centerHall },
  { id: "t03", label: "T-03", zone: "Indoor", shape: "square", seats: 4, x: 82, y: 30, rotation: 0,
    position: "East wall · Banquette seating", status: "occupied", image: IMG.banquette },
  { id: "t04", label: "T-04", zone: "Indoor", shape: "booth",  seats: 5, x: 50, y: 58, rotation: 0,
    position: "Center booth · Velvet upholstery", status: "available", image: IMG.booth },
  { id: "t05", label: "T-05", zone: "Indoor", shape: "round",  seats: 2, x: 18, y: 72, rotation: 0,
    position: "Near bar · High-energy spot", status: "reserved", image: IMG.barside },
  { id: "t06", label: "T-06", zone: "Indoor", shape: "round",  seats: 3, x: 82, y: 72, rotation: 0,
    position: "South wall · Private nook", status: "available", image: IMG.nook },
  // Outdoor
  { id: "t07", label: "T-07", zone: "Outdoor", shape: "round", seats: 4, x: 30, y: 35, rotation: 0,
    position: "Patio · Under string lights", status: "available", image: IMG.patio },
  { id: "t08", label: "T-08", zone: "Outdoor", shape: "rect",  seats: 6, x: 70, y: 50, rotation: 0,
    position: "Patio · Heated, ocean view", status: "available", image: IMG.ocean },
  { id: "t09", label: "T-09", zone: "Outdoor", shape: "round", seats: 2, x: 40, y: 75, rotation: 0,
    position: "Patio edge · Intimate", status: "occupied", image: IMG.patio },
  // Garden
  { id: "t10", label: "T-10", zone: "Garden Terrace", shape: "round", seats: 4, x: 50, y: 35, rotation: 0,
    position: "Garden · Surrounded by greenery", status: "available", image: IMG.garden },
  { id: "t11", label: "T-11", zone: "Garden Terrace", shape: "rect",  seats: 8, x: 50, y: 70, rotation: 0,
    position: "Garden long-table · Group dining", status: "available", image: IMG.longtable },
  // Private
  { id: "t12", label: "T-12", zone: "Private Meeting", shape: "rect", seats: 10, x: 50, y: 50, rotation: 0,
    position: "Private room · Soundproof", status: "available", image: IMG.private },
];

export const TABLES: RestaurantTable[] = TABLE_SEEDS.map((t) => ({ ...t, pano: PANO[t.zone] ?? t.image }));
