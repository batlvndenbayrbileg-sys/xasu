import type { Category, Dish, RestaurantTable } from "./types";

const CORE_DISHES: Dish[] = [
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

/* ──────────────────────────────────────────────────────────────────────────
   Expanded menu: 50 more dishes, 20 drinks, 10 snacks.
   Images cycle through curated Unsplash pools for variety; DishCard has an
   onError fallback so any single broken URL degrades gracefully.
   ────────────────────────────────────────────────────────────────────────── */
const Q = "?auto=format&fit=crop&w=900&q=70";
const img = (id: string) => `https://images.unsplash.com/photo-${id}${Q}`;

const FOOD_IMG = [
  "1467003909585-2f8a72700288", "1604908176997-125f25cc6f3d", "1544025162-d76694265947",
  "1558030006-450675393462", "1473093295043-cdd812d0e601", "1572695157366-5e585ab2b69f",
  "1551024506-0bccd828d307", "1532980400857-e8d9d275d858", "1432139555190-58524dae6a55",
  "1476124369491-e7addf5db371", "1505253716362-afaea1d3d1af", "1608897013039-887f21d8c804",
  "1599487488170-d11ec9c172f0", "1625938145744-e380515399b7", "1534080564583-6be75777b70a",
  "1571877227200-a0d98ea607e9", "1470124182917-cc6e71b22ecc", "1488477181946-6428a0291777",
  "1513104890138-7c749659a591", "1568901346375-23c9450c58cd", "1546964124-0cce460f38ef",
  "1512621776951-a57141f2eefd", "1567620905732-2d1ec7ab7445", "1565299624946-b28f40a0ae38",
  "1455619452474-d2be8b1e70cd", "1547592180-85f173990554",
].map(img);

const DRINK_IMG = [
  "1509042239860-f550ce710b93", "1461023058943-07fcbe16d735", "1437418747212-8d9709afab22",
  "1551538827-9c037cb4f32a", "1510812431401-41d2bd2722f3", "1535958636474-b021ee887b13",
].map(img);

const SNACK_IMG = [
  "1568901346375-23c9450c58cd", "1513104890138-7c749659a591", "1572695157366-5e585ab2b69f",
  "1599487488170-d11ec9c172f0", "1608897013039-887f21d8c804", "1625938145744-e380515399b7",
].map(img);

/** [category, name, price, rating, calories, prepMinutes, description] */
type Spec = [Category, string, number, number, number, number, string];

const MORE_FOOD: Spec[] = [
  // Specials
  ["Specials", "Miso Black Cod", 27, 4.8, 300, 16, "Marinated black cod glazed in sweet white miso, broiled to a caramelised finish with pickled ginger."],
  ["Specials", "Wagyu Sliders", 24, 4.7, 480, 12, "Three mini A5 wagyu sliders, smoked cheddar and caramelised onion on toasted brioche."],
  ["Specials", "Lobster Thermidor", 42, 4.9, 520, 24, "Whole lobster in a brandy-cream sauce, gratinéed with gruyère."],
  ["Specials", "Venison Loin", 39, 4.8, 410, 22, "Roasted venison loin, juniper jus, celeriac purée and blackberries."],
  ["Specials", "Octopus à la Plancha", 28, 4.7, 260, 15, "Charred Spanish octopus, smoked paprika oil and confit potato."],
  ["Specials", "Foie Gras Torchon", 33, 4.8, 440, 18, "Silky foie gras torchon, toasted brioche and fig compote."],
  ["Specials", "King Crab Legs", 46, 4.9, 300, 14, "Steamed Alaskan king crab, drawn garlic butter and lemon."],
  ["Specials", "Branzino al Sale", 31, 4.7, 290, 20, "Whole Mediterranean sea bass baked in a salt crust with herb oil."],
  ["Specials", "Black Truffle Gnocchi", 29, 4.8, 560, 16, "Pillowy potato gnocchi, black truffle cream and aged parmesan."],
  ["Specials", "Surf & Turf", 49, 4.9, 640, 26, "Grilled filet and butter-poached lobster tail with béarnaise."],
  // Main
  ["Main", "Dry-Aged Ribeye", 41, 4.8, 680, 22, "21-day dry-aged ribeye, smoked Maldon salt and roasted bone marrow."],
  ["Main", "Osso Buco", 34, 4.7, 590, 30, "Braised veal shank, saffron risotto milanese and gremolata."],
  ["Main", "Rack of Lamb", 37, 4.8, 520, 24, "Herb-crusted rack of lamb, ratatouille and rosemary jus."],
  ["Main", "Chicken Marsala", 26, 4.6, 440, 18, "Pan-seared chicken in a marsala wine and wild mushroom sauce."],
  ["Main", "Braised Pork Belly", 27, 4.7, 560, 28, "Slow-braised pork belly, apple purée, crackling and cider glaze."],
  ["Main", "Bouillabaisse", 33, 4.7, 420, 25, "Provençal seafood stew, saffron broth and rouille croutons."],
  ["Main", "Eggplant Parmigiana", 22, 4.5, 480, 20, "Layered eggplant, San Marzano tomato, basil and mozzarella."],
  ["Main", "Lobster Ravioli", 32, 4.8, 540, 18, "House ravioli filled with lobster in saffron beurre blanc."],
  ["Main", "Cioppino", 35, 4.7, 460, 24, "San Francisco seafood stew, tomato-fennel broth and grilled bread."],
  ["Main", "Braised Short Rib", 36, 4.9, 700, 32, "Red-wine braised beef short rib, truffle mash and glazed carrots."],
  ["Main", "Sole Meunière", 30, 4.7, 380, 16, "Dover sole in brown butter with capers, lemon and parsley."],
  ["Main", "Coq au Vin", 28, 4.6, 520, 30, "Burgundy-braised chicken with lardons, pearl onions and mushrooms."],
  ["Main", "Vegetable Wellington", 24, 4.6, 470, 26, "Roasted vegetables and mushroom duxelles in golden puff pastry."],
  ["Main", "Tandoori Salmon", 27, 4.7, 360, 18, "Yogurt-spiced grilled salmon, mint raita and charred lemon."],
  // Seasonal
  ["Seasonal", "Butternut Squash Soup", 14, 4.6, 220, 12, "Velvety roasted squash, sage brown butter and toasted seeds."],
  ["Seasonal", "Spring Pea Risotto", 23, 4.6, 460, 18, "Carnaroli rice with sweet peas, mint and pecorino."],
  ["Seasonal", "Burrata & Peach", 17, 4.7, 290, 8, "Creamy burrata, grilled peaches, basil and aged balsamic."],
  ["Seasonal", "Wild Mushroom Tart", 19, 4.6, 380, 16, "Flaky tart with foraged mushrooms, thyme and gruyère."],
  ["Seasonal", "Cauliflower Steak", 18, 4.5, 240, 17, "Charred cauliflower steak, tahini, pomegranate and dukkah."],
  ["Seasonal", "Asparagus & Egg", 16, 4.6, 260, 10, "Grilled asparagus, soft poached egg, hollandaise and crumbs."],
  ["Seasonal", "Heirloom Tomato Tart", 17, 4.6, 300, 14, "Heirloom tomatoes, ricotta, puff pastry and basil oil."],
  ["Seasonal", "Corn & Crab Chowder", 18, 4.7, 340, 16, "Sweet corn chowder, lump crab and smoked paprika."],
  // Appetizers
  ["Appetizers", "French Onion Soup", 13, 4.7, 320, 14, "Caramelised onion broth with a gruyère crouton gratiné."],
  ["Appetizers", "Garlic Prawns", 18, 4.8, 280, 10, "Sizzling prawns with garlic, chili and white wine, grilled bread."],
  ["Appetizers", "Beef Carpaccio", 19, 4.7, 240, 9, "Thin-sliced raw beef, capers, arugula, parmesan and truffle oil."],
  ["Appetizers", "Steamed Dumplings", 15, 4.6, 300, 12, "Pork and chive dumplings with a black vinegar dipping sauce."],
  ["Appetizers", "Spinach Artichoke Dip", 14, 4.5, 360, 11, "Creamy spinach-artichoke gratin with crostini."],
  ["Appetizers", "Oysters Rockefeller", 21, 4.8, 220, 12, "Baked oysters, spinach, herbs and parmesan butter."],
  ["Appetizers", "Chicken Liver Pâté", 16, 4.6, 380, 10, "Smooth pâté, cornichons, toasted sourdough and onion jam."],
  ["Appetizers", "Shrimp Cocktail", 17, 4.7, 180, 8, "Chilled jumbo shrimp with classic horseradish cocktail sauce."],
  ["Appetizers", "Stuffed Mushrooms", 13, 4.5, 240, 13, "Mushrooms filled with herbs, garlic and parmesan."],
  ["Appetizers", "Crab Cakes", 20, 4.8, 320, 14, "Lump crab cakes with remoulade and a micro-herb salad."],
  // Desserts
  ["Desserts", "New York Cheesecake", 12, 4.8, 430, 7, "Classic baked cheesecake, graham crust and berry coulis."],
  ["Desserts", "Apple Tarte Tatin", 12, 4.7, 390, 9, "Caramelised upside-down apple tart with crème fraîche."],
  ["Desserts", "Vanilla Panna Cotta", 10, 4.7, 320, 6, "Vanilla bean panna cotta with raspberry gel."],
  ["Desserts", "Profiteroles", 11, 4.7, 410, 8, "Choux puffs, vanilla cream and warm chocolate sauce."],
  ["Desserts", "Lemon Meringue Tart", 11, 4.6, 360, 7, "Tangy lemon curd tart with torched meringue."],
  ["Desserts", "Affogato", 9, 4.8, 240, 4, "Vanilla gelato drowned in hot espresso with amaretti."],
  ["Desserts", "Chocolate Fondant", 12, 4.9, 470, 9, "Molten dark chocolate fondant with salted caramel ice cream."],
  ["Desserts", "Sticky Toffee Pudding", 11, 4.8, 450, 8, "Date sponge, toffee sauce and clotted cream."],
];

const MORE_DRINKS: Spec[] = [
  ["Drinks", "Espresso", 4, 4.8, 5, 3, "Double shot of single-origin espresso with a rich crema."],
  ["Drinks", "Cappuccino", 5, 4.7, 90, 4, "Espresso with steamed milk and velvety microfoam."],
  ["Drinks", "Flat White", 5, 4.7, 110, 4, "Ristretto shots with silky steamed milk."],
  ["Drinks", "Caffè Latte", 5, 4.6, 150, 4, "Smooth espresso, generous steamed milk and light foam."],
  ["Drinks", "Iced Americano", 5, 4.6, 10, 3, "Chilled espresso over ice and cold water."],
  ["Drinks", "Matcha Latte", 6, 4.6, 140, 4, "Ceremonial matcha whisked with steamed milk."],
  ["Drinks", "Hot Chocolate", 6, 4.7, 320, 5, "Belgian dark chocolate, steamed milk and whipped cream."],
  ["Drinks", "English Breakfast Tea", 4, 4.5, 2, 4, "Classic black tea blend served with milk or lemon."],
  ["Drinks", "Fresh Orange Juice", 6, 4.7, 110, 3, "Hand-squeezed seasonal oranges."],
  ["Drinks", "House Lemonade", 5, 4.6, 120, 3, "Fresh lemonade with mint, still or sparkling."],
  ["Drinks", "Berry Smoothie", 7, 4.7, 210, 5, "Mixed berries, banana, yogurt and honey."],
  ["Drinks", "Mango Lassi", 6, 4.6, 240, 4, "Alphonso mango blended with yogurt and cardamom."],
  ["Drinks", "Sparkling Water", 4, 4.5, 0, 1, "Chilled sparkling mineral water with lime."],
  ["Drinks", "Classic Mojito", 12, 4.8, 160, 5, "White rum, lime, mint and soda over crushed ice."],
  ["Drinks", "Margarita", 13, 4.8, 200, 5, "Tequila, triple sec, fresh lime and a salt rim."],
  ["Drinks", "Negroni", 14, 4.7, 210, 4, "Gin, Campari and sweet vermouth with an orange twist."],
  ["Drinks", "Old Fashioned", 15, 4.8, 220, 4, "Bourbon, bitters, sugar and orange peel."],
  ["Drinks", "Aperol Spritz", 12, 4.7, 180, 3, "Aperol, prosecco and soda with an orange slice."],
  ["Drinks", "House Red Wine", 11, 4.7, 150, 2, "A glass of our cellar-selected red blend."],
  ["Drinks", "Craft Lager", 8, 4.6, 190, 2, "Crisp local craft lager on tap."],
];

const MORE_SNACKS: Spec[] = [
  ["Snacks", "Truffle Fries", 9, 4.8, 380, 9, "Skin-on fries with truffle oil, parmesan and herbs."],
  ["Snacks", "Loaded Nachos", 11, 4.6, 540, 12, "Tortilla chips, melted cheese, jalapeños, salsa and sour cream."],
  ["Snacks", "Buffalo Wings", 12, 4.7, 480, 14, "Crispy wings tossed in buffalo sauce with blue cheese dip."],
  ["Snacks", "Mozzarella Sticks", 9, 4.5, 420, 10, "Golden breaded mozzarella with marinara dip."],
  ["Snacks", "Onion Rings", 8, 4.5, 360, 9, "Beer-battered onion rings with smoked aioli."],
  ["Snacks", "Vegetable Spring Rolls", 9, 4.6, 300, 11, "Crispy spring rolls with sweet chili sauce."],
  ["Snacks", "Popcorn Shrimp", 11, 4.6, 340, 10, "Bite-size crispy shrimp with lemon aioli."],
  ["Snacks", "Sliders Trio", 12, 4.7, 520, 12, "Three mini beef sliders with cheese and pickles."],
  ["Snacks", "Hummus & Pita", 8, 4.6, 320, 7, "Creamy hummus, warm pita, olive oil and za'atar."],
  ["Snacks", "Soft Pretzel", 7, 4.5, 380, 8, "Warm salted pretzel with a beer-cheese dip."],
];

function buildDishes(specs: Spec[], pool: string[], prefix: string): Dish[] {
  return specs.map(([category, name, price, rating, calories, prepMinutes, description], i) => ({
    id: `${prefix}${i + 1}`,
    name, price, rating, calories, prepMinutes, description, category,
    image: pool[i % pool.length],
  }));
}

export const DISHES: Dish[] = [
  ...CORE_DISHES,
  ...buildDishes(MORE_FOOD, FOOD_IMG, "f"),
  ...buildDishes(MORE_DRINKS, DRINK_IMG, "dr"),
  ...buildDishes(MORE_SNACKS, SNACK_IMG, "sn"),
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

// Wide panoramic photos for the 360°/AR viewer, per zone — picked to clearly
// show actual restaurant interiors with visible tables.
const PANO: Record<string, string> = {
  Indoor: "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=2400&q=80",
  Outdoor: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2400&q=80",
  "Garden Terrace": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=80",
  "Private Meeting": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80",
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
