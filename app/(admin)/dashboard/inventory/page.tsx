import { getInventoryData } from "@/lib/inventory";
import { InventoryDataTable } from "@/components/inventory-data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const category = params.category;
  const search = params.search;
  const sortBy = params.sortBy as
    | "productName"
    | "sku"
    | "quantityOnHand"
    | "lastModified";
  const sortOrder = params.sortOrder as "asc" | "desc";

  const inventoryData = await getInventoryData({
    page,
    pageSize,
    category,
    search,
    sortBy,
    sortOrder,
  });

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6 md:py-6">
        <InventoryDataTable
          data={inventoryData.items}
          totalCount={inventoryData.totalCount}
          totalPages={inventoryData.totalPages}
          currentPage={inventoryData.currentPage}
          pageSize={inventoryData.pageSize}
        />
      </div>
    </SidebarInset>
  );
}
