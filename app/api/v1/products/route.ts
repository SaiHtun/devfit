import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  productInsertSchema,
  type productCategoryEnum,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const queryOptions = {
      with: {
        productVariants: {},
      },
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    if (category) {
      const productsWithCategory = await db.query.products.findMany({
        where: eq(
          products.category,
          category as (typeof productCategoryEnum.enumValues)[number],
        ),
        with: {
          productVariants: {},
        },
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });
      return NextResponse.json({ data: productsWithCategory });
    }

    const allProducts = await db.query.products.findMany(queryOptions);

    return NextResponse.json({ data: allProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, tags, customizableAreas } =
      productInsertSchema.parse(body);

    const newProduct = await db
      .insert(products)
      .values({
        name,
        description,
        category,
        tags,
        customizableAreas,
      })
      .returning();

    return NextResponse.json({ data: newProduct[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
