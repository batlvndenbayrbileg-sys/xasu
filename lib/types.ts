export type Category = "Specials" | "Seasonal" | "Appetizers" | "Main" | "Desserts";

export interface Dish {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: Category;
  calories: number;
  prepMinutes: number;
  description: string;
}

export type Zone = "Indoor" | "Outdoor" | "Garden Terrace" | "Private Meeting";

export type TableShape = "round" | "rect" | "square" | "booth";
export type TableStatus = "available" | "reserved" | "occupied";

export interface RestaurantTable {
  id: string;
  label: string;          // "T-04"
  zone: Zone;
  shape: TableShape;
  seats: number;
  /** Position on a 100x100 grid for resolution-independent layout */
  x: number;
  y: number;
  rotation: number;       // degrees
  /** Free-form descriptor shown in inspector */
  position: string;       // "Near Window · 3m from Kitchen"
  status: TableStatus;
  /** Realistic photo of how this table actually looks (shown after selection). */
  image: string;
  /** Wide panoramic photo used by the 360°/AR "Watch table position" viewer. */
  pano: string;
}

export interface Reservation {
  id: string;
  tableId: string;
  zone: string;
  partySize: number;
  date: string;
  time: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  tableLabel?: string;
  amount?: number;
  paymentStatus?: "unpaid" | "paid" | "refunded" | "failed";
  paymentIntentId?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
