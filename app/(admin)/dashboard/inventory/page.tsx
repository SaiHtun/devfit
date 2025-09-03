import {
  inventorySearchParamsSchema,
  type InventorySearchParams,
} from "@/lib/inventory/schema";
import { getInventoryData } from "@/lib/inventory";
import { InventoryDataTable } from "@/components/inventory-data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<InventorySearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const inventorySearchParams = inventorySearchParamsSchema.parse(params);
  const inventoryData = await getInventoryData(inventorySearchParams);

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6 py-6">
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
