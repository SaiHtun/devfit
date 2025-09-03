import { type NextRequest, NextResponse } from "next/server";
import { getInventoryData } from "@/lib/inventory";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  category: z.string().nullish(),
  search: z.string().nullish(),
  sortBy: z
    .enum(["productName", "sku", "quantityOnHand", "lastModified"])
    .nullish()
    .default("lastModified"),
  sortOrder: z.enum(["asc", "desc"]).nullish().default("desc"),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const query = querySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    const inventoryData = await getInventoryData({
      page: query.page,
      pageSize: query.pageSize,
      category: query.category || undefined,
      search: query.search || undefined,
      sortBy: query.sortBy || "lastModified",
      sortOrder: query.sortOrder || "desc",
    });

    return NextResponse.json(inventoryData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "POST method not implemented for inventory endpoint" },
    { status: 405 },
  );
}
