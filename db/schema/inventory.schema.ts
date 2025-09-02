import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productVariants } from "./product.schema";
import { relations, sql } from "drizzle-orm";

export const reservationTypeEnum = pgEnum("reservation_type", [
  "cart",
  "order_pending",
  "order_confirmed",
  "quote",
  "hold",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "sale",
  "return",
  "receipt",
  "adjustment",
  "damange",
  "transfer",
  "production",
]);

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),

    // Essential quantities
    quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
    quantityReserved: integer("quantity_reserved").default(0).notNull(),

    // Tracking
    lastCountedAt: timestamp("last_counted_at", { withTimezone: true }),
    lastModifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("inventory_variant_index").on(t.productVariantId),
    index("inventory_availability_index").on(t.quantityOnHand),

    // Check constraints
    check("non_negative_on_hand", sql`quantity_on_hand >= 0`),
    check("non_negative_reserved", sql`quantity_reserved >= 0`),
    check(
      "reserved_not_exceed_on_hand",
      sql`quantity_reserved <= quantity_on_hand`,
    ),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),

    // Reservation Details
    quantity: integer("quantity"),
    reservationType: reservationTypeEnum("reservation_type").notNull(),

    // Reference to source
    referenceId: uuid("reference_id").notNull(), // cart_id, order_id
    referenceType: varchar("reference_type", { length: 20 }), // "cart", "order"

    // Customer Info
    customerId: uuid("customer_id").notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),

    // Expiration
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    // Metadata
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("reservations_expires_index").on(t.expiresAt),
    index("reference_id").on(t.referenceId),
    index("active_reservations_index").on(t.productVariantId, t.expiresAt),

    // Check constraints
    check("positive_reservation_quantity", sql`quantity > 0`),
  ],
);

export const inventoryTransactions = pgTable(
  "inventory_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),

    // Reservation Details
    quantity: integer("quantity"),
    transactionType: transactionTypeEnum("transaction_type").notNull(),

    // Reference to source
    referenceId: uuid("reference_id").notNull(),
    referenceType: varchar("reference_type", { length: 20 }), // "order", "manual_adjustment", "po_receipt"

    // Customer Info
    customerId: uuid("customer_id").notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),

    // Expiration
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    // Metadata
    notes: text("notes"),

    // snapshot values (for historical tracking)
    quantityBefore: integer("quantity_before"),
    quantityAfter: integer("quantity_after"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("transactions_variant_index").on(t.productVariantId),
    index("transactions_created_index").on(t.createdAt),
    index("transactions_type_index").on(t.transactionType),
    index("transactions_reference_index").on(t.referenceId),
  ],
);

// ==================
// RELATIONS
// ==================

export const inventoryRelations = relations(inventory, ({ one }) => ({
  productVariants: one(productVariants, {
    fields: [inventory.productVariantId],
    references: [productVariants.id],
  }),
}));

export const inventoryReservationsRelations = relations(
  inventoryReservations,
  ({ one }) => ({
    productVariants: one(productVariants, {
      fields: [inventoryReservations.productVariantId],
      references: [productVariants.id],
    }),
  }),
);

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    productVariants: one(productVariants, {
      fields: [inventoryTransactions.productVariantId],
      references: [productVariants.id],
    }),
  }),
);

// ==================
// TYPE EXPORTS
// ==================

export type Inventory = typeof inventory.$inferInsert;
export type NewInventory = typeof inventory.$inferInsert;

export type InventoryReservation = typeof inventoryReservations.$inferSelect;
export type NewInventoryReservation = typeof inventoryReservations.$inferInsert;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
