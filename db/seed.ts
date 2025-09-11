import { getInitials } from "@/lib/utils";
import { db } from "./index";
import { inventory, products, productVariants } from "./schema";

const seedData = async () => {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(inventory);
    await db.delete(productVariants);
    await db.delete(products);

    // Seed Products
    console.log("📦 Seeding products...");
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          name: "Classic Cotton T-Shirt",
          description:
            "Comfortable 100% cotton t-shirt perfect for everyday wear",
          category: "t-shirt",
          tags: ["cotton", "casual", "basic"],
          customizableAreas: [
            {
              area: "front",
              maxSize: { width: 25, height: 30 },
            },
            {
              area: "back",
              maxSize: { width: 30, height: 35 },
            },
          ],
        },
        {
          name: "Premium Polo Shirt",
          description: "Professional polo shirt with collar and button placket",
          category: "polo-shirt",
          tags: ["polo", "professional", "collared"],
          customizableAreas: [
            {
              area: "left_hand",
              maxSize: { width: 10, height: 8 },
            },
            {
              area: "back",
              maxSize: { width: 25, height: 30 },
            },
          ],
        },
        {
          name: "Cozy Pullover Hoodie",
          description: "Warm and comfortable hoodie with front pocket",
          category: "hoodie",
          tags: ["hoodie", "warm", "casual"],
          customizableAreas: [
            {
              area: "front",
              maxSize: { width: 20, height: 25 },
            },
            {
              area: "back",
              maxSize: { width: 30, height: 35 },
            },
          ],
        },
        {
          name: "Eco Canvas Tote Bag",
          description: "Sustainable canvas tote bag for daily use",
          category: "tote-bag",
          tags: ["eco-friendly", "canvas", "reusable"],
          customizableAreas: [
            {
              area: "front",
              maxSize: { width: 30, height: 35 },
            },
          ],
        },
      ])
      .returning();

    console.log(`✅ Created ${insertedProducts.length} products`);

    // Seed Product Variants
    console.log("🎨 Seeding product variants...");
    const variantData = [];

    // T-Shirt variants
    const tshirtProduct = insertedProducts.find(
      (p) => p.category === "t-shirt",
    );
    if (!tshirtProduct) throw new Error("T-shirt product not found");
    const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const tshirtColors = [
      { color: "White", hex: "#FFFFFF" },
      { color: "Black", hex: "#000000" },
      { color: "Navy", hex: "#1f2937" },
      { color: "Gray", hex: "#6b7280" },
    ];

    for (const size of tshirtSizes) {
      for (const colorInfo of tshirtColors) {
        variantData.push({
          productId: tshirtProduct.id,
          sku: `${getInitials(
            tshirtProduct.name,
          )}-${size}-${colorInfo.color.toUpperCase()}`,
          size,
          color: colorInfo.color,
          colorHex: colorInfo.hex,
          weightGrams: 150,
          dimensions: {
            length: 70,
            width: 50,
            height: 1,
            unit: "cm" as const,
          },
          material: "100% Cotton",
          gender: "unisex",
          buyPrice: "8.99",
          sellPrice: "19.99",
          imageUrls: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bW9kZWx8ZW58MHx8MHx8fDA%3D",
          ],
        });
      }
    }

    // Polo Shirt variants
    const poloProduct = insertedProducts.find(
      (p) => p.category === "polo-shirt",
    );
    if (!poloProduct) throw new Error("Polo product not found");
    const poloSizes = ["S", "M", "L", "XL", "XXL"];
    const poloColors = [
      { color: "White", hex: "#FFFFFF" },
      { color: "Black", hex: "#000000" },
      { color: "Navy", hex: "#1f2937" },
    ];

    for (const size of poloSizes) {
      for (const colorInfo of poloColors) {
        variantData.push({
          productId: poloProduct.id,
          sku: `${getInitials(
            poloProduct.name,
          )}-${size}-${colorInfo.color.toUpperCase()}`,
          size,
          color: colorInfo.color,
          colorHex: colorInfo.hex,
          weightGrams: 200,
          dimensions: {
            length: 72,
            width: 52,
            height: 1,
            unit: "cm" as const,
          },
          material: "Cotton Blend",
          gender: "unisex",
          buyPrice: "12.99",
          sellPrice: "29.99",
          imageUrls: [
            "https://images.unsplash.com/photo-1625910513520-bed0389ce32f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9sbyUyMHNoaXJ0fGVufDB8fDB8fHww",
            "https://plus.unsplash.com/premium_photo-1683147816511-932c9cc82881?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHBvbG8lMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
          ],
        });
      }
    }

    // Hoodie variants
    const hoodieProduct = insertedProducts.find((p) => p.category === "hoodie");
    if (!hoodieProduct) throw new Error("Hoodie product not found");
    const hoodieSizes = ["S", "M", "L", "XL", "XXL"];
    const hoodieColors = [
      { color: "Black", hex: "#000000" },
      { color: "Gray", hex: "#6b7280" },
      { color: "Navy", hex: "#1f2937" },
    ];

    for (const size of hoodieSizes) {
      for (const colorInfo of hoodieColors) {
        variantData.push({
          productId: hoodieProduct.id,
          sku: `${getInitials(
            hoodieProduct.name,
          )}-${size}-${colorInfo.color.toUpperCase()}`,
          size,
          color: colorInfo.color,
          colorHex: colorInfo.hex,
          weightGrams: 500,
          dimensions: {
            length: 75,
            width: 60,
            height: 3,
            unit: "cm" as const,
          },
          material: "Cotton/Polyester Blend",
          gender: "unisex",
          buyPrice: "18.99",
          sellPrice: "49.99",
          imageUrls: [
            "https://plus.unsplash.com/premium_photo-1726930176764-82601e0159df?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aG9vZGllcyUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
            "https://images.unsplash.com/photo-1677706195015-c8d077b0a62d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG9vZGllcyUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
          ],
        });
      }
    }

    // Tote Bag variants
    const toteProduct = insertedProducts.find((p) => p.category === "tote-bag");
    if (!toteProduct) throw new Error("Tote product not found");
    const toteColors = [
      { color: "Natural", hex: "#f5f5dc" },
      { color: "Black", hex: "#000000" },
    ];

    for (const colorInfo of toteColors) {
      variantData.push({
        productId: toteProduct.id,
        sku: `${getInitials(
          toteProduct.name,
        )}-${colorInfo.color.toUpperCase()}`,
        color: colorInfo.color,
        colorHex: colorInfo.hex,
        weightGrams: 120,
        dimensions: {
          length: 40,
          width: 35,
          height: 10,
          unit: "cm" as const,
        },
        material: "Canvas",
        gender: "unisex",
        buyPrice: "5.99",
        sellPrice: "16.99",
        imageUrls: [
          "https://images.unsplash.com/photo-1663573690125-d326a87a2535?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dG90ZSUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
          "https://images.unsplash.com/photo-1623222403596-d0255da44c0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRvdGUlMjBiYWd8ZW58MHx8MHx8fDA%3D",
        ],
      });
    }

    const insertedVariants = await db
      .insert(productVariants)
      .values(variantData)
      .returning();

    console.log(`✅ Created ${insertedVariants.length} product variants`);

    // Seed Inventory
    console.log("📊 Seeding inventory...");
    const inventoryData = insertedVariants.map((variant) => ({
      productVariantId: variant.id,
      quantityOnHand: Math.floor(Math.random() * 50) + 10, // Random between 10-59
      quantityReserved: 0,
      lastCountedAt: new Date(),
    }));

    const insertedInventory = await db
      .insert(inventory)
      .values(inventoryData)
      .returning();

    console.log(`✅ Created ${insertedInventory.length} inventory records`);

    console.log("🎉 Database seeding completed successfully!");

    // Summary
    console.log("\n📋 Seeding Summary:");
    console.log(`   Products: ${insertedProducts.length}`);
    console.log(`   Variants: ${insertedVariants.length}`);
    console.log(`   Inventory: ${insertedInventory.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log("✅ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding process failed:", error);
      process.exit(1);
    });
}

export { seedData };
