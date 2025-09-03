import { db } from "@/db";
import { inventory, productVariants, products } from "@/db/schema";
import { eq, sql, desc, asc, and, count, type SQL } from "drizzle-orm";
import { z } from "zod";

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
  sellPrice: z.string(),
  lastModified: z.date(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export interface GetInventoryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sortBy?: "productName" | "sku" | "quantityOnHand" | "lastModified";
  sortOrder?: "asc" | "desc";
}

export interface GetInventoryResult {
  items: InventoryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export async function getInventoryData({
  page = 1,
  pageSize = 10,
  category,
  search,
  sortBy = "lastModified",
  sortOrder = "desc",
}: GetInventoryParams = {}): Promise<GetInventoryResult> {
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];

  if (category && category !== "all") {
    conditions.push(
      eq(
        products.category,
        category as "t-shirt" | "polo-shirt" | "hoodie" | "tote-bag",
      ),
    );
  }

  if (search) {
    conditions.push(
      sql`(${products.name} ILIKE ${`%${search}%`} OR ${productVariants.sku} ILIKE ${`%${search}%`})`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const direction = sortOrder === "desc" ? desc : asc;
  let orderByClause: SQL;

  switch (sortBy) {
    case "productName":
      orderByClause = direction(products.name);
      break;
    case "sku":
      orderByClause = direction(productVariants.sku);
      break;
    case "quantityOnHand":
      orderByClause = direction(inventory.quantityOnHand);
      break;
    default:
      orderByClause = direction(inventory.lastModifiedAt);
      break;
  }

  // Get total count
  const [totalCountResult] = await db
    .select({ count: count() })
    .from(inventory)
    .innerJoin(
      productVariants,
      eq(inventory.productVariantId, productVariants.id),
    )
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(whereClause);

  const totalCount = totalCountResult.count;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get paginated data
  const results = await db
    .select({
      id: inventory.id,
      sku: productVariants.sku,
      productName: products.name,
      category: products.category,
      size: productVariants.size,
      color: productVariants.color,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      sellPrice: productVariants.sellPrice,
      lastModified: inventory.lastModifiedAt,
    })
    .from(inventory)
    .innerJoin(
      productVariants,
      eq(inventory.productVariantId, productVariants.id),
    )
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  // Transform the data to match our schema
  const items: InventoryItem[] = results.map((row) => ({
    id: row.id,
    sku: row.sku,
    productName: row.productName,
    category: row.category,
    size: row.size,
    color: row.color,
    quantityOnHand: row.quantityOnHand,
    quantityReserved: row.quantityReserved,
    quantityAvailable: row.quantityOnHand - row.quantityReserved,
    sellPrice: row.sellPrice,
    lastModified: row.lastModified,
  }));

  return {
    items,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
}
