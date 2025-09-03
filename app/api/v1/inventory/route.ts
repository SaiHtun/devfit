import { type NextRequest, NextResponse } from "next/server";
import { getInventoryData } from "@/lib/inventory";
import { inventorySearchParamsSchema } from "@/lib/inventory/schema";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const inventorySearchParams =
      inventorySearchParamsSchema.parse(searchParams);
    const inventoryData = await getInventoryData(inventorySearchParams);

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
