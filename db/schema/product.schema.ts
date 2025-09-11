import {
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import {
  inventory,
  inventoryReservations,
  inventoryTransactions,
} from "./inventory.schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

// ==================
// PRODUCTS & VARIANTS
// ==================
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category").notNull(),
    tags: text("tags").array(),
    customizableAreas:
      jsonb("customizable_areas").$type<
        Array<{
          area: string;
          maxSize: { width: number; height: number };
        }>
      >(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("name_index").on(t.name),
    index("category_index").on(t.category),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    sku: varchar("sku", { length: 100 }).unique().notNull(),
    size: varchar("size", { length: 20 }),
    color: varchar("color", { length: 20 }),
    colorHex: varchar("color_hex", { length: 20 }),
    weightGrams: integer("weight_grams"),
    dimensions: jsonb("dimensions").$type<{
      length: number;
      width: number;
      height: number;
      unit: "cm" | "in";
    }>(),
    imageUrls: jsonb("image_urls").$type<string[]>().default([]),

    material: varchar("material", { length: 100 }),
    gender: varchar("gender", { length: 20 }).notNull(),

    buyPrice: decimal("buy_price", { precision: 10, scale: 2 }).notNull(),
    sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("sku_index").on(t.sku),
    index("product_variants_product_id_index").on(t.productId),
    index("unique_product_variant").on(t.productId, t.size, t.color),
  ],
);

// ==================
// RELATIONS
// ==================

export const productsRelations = relations(products, ({ many }) => ({
  productVariants: many(productVariants),
}));

export const productVairantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    products: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    inventory: many(inventory),
    inventoryReservations: many(inventoryReservations),
    inventoryTransactions: many(inventoryTransactions),
  }),
);

// ==================
// ZOD VALIDATOR EXPORTS
// ==================
export const productInsertSchema = createInsertSchema(products);
export const productUpdateSchema = createUpdateSchema(products);

export const productVariantInsertSchema = createInsertSchema(productVariants);
export const productVariantUpdateSchema = createUpdateSchema(productVariants);
// ==================
// TYPE EXPORTS
// ==================
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
