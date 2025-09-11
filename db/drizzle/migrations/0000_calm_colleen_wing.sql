CREATE TYPE "public"."reservation_type" AS ENUM('cart', 'order_pending', 'order_confirmed', 'quote', 'hold');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('sale', 'return', 'receipt', 'adjustment', 'damange', 'transfer', 'production');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"last_counted_at" timestamp with time zone,
	"last_modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "non_negative_on_hand" CHECK (quantity_on_hand >= 0),
	CONSTRAINT "non_negative_reserved" CHECK (quantity_reserved >= 0),
	CONSTRAINT "reserved_not_exceed_on_hand" CHECK (quantity_reserved <= quantity_on_hand)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity" integer,
	"reservation_type" "reservation_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"reference_type" varchar(20),
	"customer_id" uuid NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "positive_reservation_quantity" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity" integer,
	"transaction_type" "transaction_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"reference_type" varchar(20),
	"customer_id" uuid NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"notes" text,
	"quantity_before" integer,
	"quantity_after" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"sku" varchar(100) NOT NULL,
	"size" varchar(20),
	"color" varchar(20),
	"color_hex" varchar(20),
	"weight_grams" integer,
	"dimensions" jsonb,
	"image_urls" jsonb DEFAULT '[]'::jsonb,
	"material" varchar(100),
	"gender" varchar(20) NOT NULL,
	"buy_price" numeric(10, 2) NOT NULL,
	"sell_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"tags" text[],
	"customizable_areas" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_variant_index" ON "inventory" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "inventory_availability_index" ON "inventory" USING btree ("quantity_on_hand");--> statement-breakpoint
CREATE INDEX "reservations_expires_index" ON "inventory_reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "reference_id" ON "inventory_reservations" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "active_reservations_index" ON "inventory_reservations" USING btree ("product_variant_id","expires_at");--> statement-breakpoint
CREATE INDEX "transactions_variant_index" ON "inventory_transactions" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "transactions_created_index" ON "inventory_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_type_index" ON "inventory_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "transactions_reference_index" ON "inventory_transactions" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "sku_index" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_index" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "unique_product_variant" ON "product_variants" USING btree ("product_id","size","color");--> statement-breakpoint
CREATE INDEX "name_index" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "category_index" ON "products" USING btree ("category");