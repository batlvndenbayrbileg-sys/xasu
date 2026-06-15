// Seed the Table model from the static TABLES const. Idempotent.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// inline duplicate of lib/data.ts TABLES to avoid TS module loading
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
};

const SEEDS = [
  { id: "t01", label: "T-01", zone: "Indoor", shape: "round",  seats: 2, x: 18, y: 30, position: "Window-side · Quiet corner", image: IMG.windowRound },
  { id: "t02", label: "T-02", zone: "Indoor", shape: "rect",   seats: 6, x: 50, y: 22, position: "Center hall · Near kitchen pass", image: IMG.centerHall },
  { id: "t03", label: "T-03", zone: "Indoor", shape: "square", seats: 4, x: 82, y: 30, position: "East wall · Banquette seating", image: IMG.banquette },
  { id: "t04", label: "T-04", zone: "Indoor", shape: "booth",  seats: 5, x: 50, y: 58, position: "Center booth · Velvet upholstery", image: IMG.booth },
  { id: "t05", label: "T-05", zone: "Indoor", shape: "round",  seats: 2, x: 18, y: 72, position: "Near bar · High-energy spot", image: IMG.barside },
  { id: "t06", label: "T-06", zone: "Indoor", shape: "round",  seats: 3, x: 82, y: 72, position: "South wall · Private nook", image: IMG.nook },
  { id: "t07", label: "T-07", zone: "Outdoor", shape: "round", seats: 4, x: 30, y: 35, position: "Patio · Under string lights", image: IMG.patio },
  { id: "t08", label: "T-08", zone: "Outdoor", shape: "rect",  seats: 6, x: 70, y: 50, position: "Patio · Heated, ocean view", image: IMG.ocean },
  { id: "t09", label: "T-09", zone: "Outdoor", shape: "round", seats: 2, x: 40, y: 75, position: "Patio edge · Intimate", image: IMG.patio },
  { id: "t10", label: "T-10", zone: "Garden Terrace", shape: "round", seats: 4, x: 50, y: 35, position: "Garden · Surrounded by greenery", image: IMG.garden },
  { id: "t11", label: "T-11", zone: "Garden Terrace", shape: "rect",  seats: 8, x: 50, y: 70, position: "Garden long-table · Group dining", image: IMG.longtable },
  { id: "t12", label: "T-12", zone: "Private Meeting", shape: "rect", seats: 10, x: 50, y: 50, position: "Private room · Soundproof", image: IMG.private },
];

let created = 0, kept = 0;
for (const [i, t] of SEEDS.entries()) {
  const existed = await prisma.table.findUnique({ where: { id: t.id } });
  if (existed) { kept++; continue; }
  await prisma.table.create({ data: { ...t, rotation: 0, disabled: false, sortOrder: i } });
  created++;
}

console.log(`✓ tables: ${created} created, ${kept} kept`);
await prisma.$disconnect();
