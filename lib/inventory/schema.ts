import { z } from "zod";

export const inventorySearchParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  category: z
    .enum(["all", "t-shirt", "polo-shirt", "hoodie", "tote-bag"])
    .default("all"),
  search: z.string().nullish(),
  sortBy: z
    .enum(["productName", "sku", "quantityOnHand", "lastModified"])
    .default("lastModified"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type InventorySearchParams = z.infer<typeof inventorySearchParamsSchema>;

export const inventoryItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  productName: z.string(),
  category: z.enum(["t-shirt", "polo-shirt", "hoodie", "tote-bag"]),
  size: z.string().nullable(),
  color: z.string().nullable(),
  quantityOnHand: z.number(),
  quantityReserved: z.number(),
  quantityAvailable: z.number(),
  buyPrice: z.string(),
  sellPrice: z.string(),
  lastModified: z.date(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
