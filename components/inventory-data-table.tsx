"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronUp,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconPackage,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";

import {
  type InventorySearchParams,
  type InventoryItem,
  inventorySearchParamsSchema,
} from "@/lib/inventory/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sortable header component
interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: InventorySearchParams["sortBy"];
  currentSort: InventorySearchParams["sortBy"];
  currentOrder: InventorySearchParams["sortOrder"];
  onSort: (sortKey: InventorySearchParams["sortBy"]) => void;
}

function SortableHeader({
  children,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}: SortableHeaderProps) {
  const isSorted = currentSort === sortKey;
  const isAsc = isSorted && currentOrder === "asc";
  const _isDesc = isSorted && currentOrder === "desc";

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(sortKey)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      <span className="ml-2">
        {isSorted ? (
          isAsc ? (
            <IconChevronUp className="h-4 w-4" />
          ) : (
            <IconChevronDown className="h-4 w-4" />
          )
        ) : (
          <IconSelector className="h-4 w-4 opacity-50" />
        )}
      </span>
    </Button>
  );
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Create columns function to pass sorting props
const createColumns = (
  currentSort: InventorySearchParams["sortBy"],
  currentOrder: InventorySearchParams["sortOrder"],
  onSort: (sortKey: InventorySearchParams["sortBy"]) => void,
): ColumnDef<InventoryItem>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "productName",
    header: () => (
      <SortableHeader
        sortKey="productName"
        currentSort={currentSort}
        currentOrder={currentOrder}
        onSort={onSort}
      >
        Product
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.productName}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "sku",
    header: () => (
      <SortableHeader
        sortKey="sku"
        currentSort={currentSort}
        currentOrder={currentOrder}
        onSort={onSort}
      >
        SKU
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
        {row.original.sku}
      </code>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.category.replace("-", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => row.original.size || "-",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => row.original.color || "-",
  },
  {
    accessorKey: "quantityOnHand",
    header: () => (
      <div className="text-right">
        <SortableHeader
          sortKey="quantityOnHand"
          currentSort={currentSort}
          currentOrder={currentOrder}
          onSort={onSort}
        >
          On Hand
        </SortableHeader>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.quantityOnHand}</div>
    ),
  },
  {
    accessorKey: "quantityReserved",
    header: () => <div className="text-right">Reserved</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.quantityReserved}
      </div>
    ),
  },
  {
    accessorKey: "quantityAvailable",
    header: () => <div className="text-right">Available</div>,
    cell: ({ row }) => {
      const available = row.original.quantityAvailable;
      const isLow = available < 5;
      const isOut = available === 0;

      return (
        <div
          className={`text-right font-mono ${
            isOut ? "text-red-600" : isLow ? "text-yellow-600" : ""
          }`}
        >
          {available}
        </div>
      );
    },
  },
  {
    accessorKey: "buyPrice",
    header: () => <div className="text-right">BPrice</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">${row.original.sellPrice}</div>
    ),
  },
  {
    accessorKey: "sellPrice",
    header: () => <div className="text-right">SPrice</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">${row.original.sellPrice}</div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Stock</DropdownMenuItem>
          <DropdownMenuItem>View History</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Reserve</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<InventoryItem> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

interface InventoryDataTableProps {
  data: InventoryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function InventoryDataTable({
  data: initialData,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
}: InventoryDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState(initialData);
  const [parsedParams, setParsedParams] = React.useState<InventorySearchParams>(
    inventorySearchParamsSchema.parse({}),
  );

  React.useEffect(() => {
    const searchParamsObj = Object.fromEntries(searchParams.entries());
    const parsedObj = inventorySearchParamsSchema.parse(searchParamsObj);
    setParsedParams(parsedObj);
  }, [searchParams]);

  // Update data when initialData changes (from server)
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  // Handle URL updates for pagination and filtering
  const updateUrl = React.useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Handle sorting
  const handleSort = React.useCallback(
    (sortKey: InventorySearchParams["sortBy"]) => {
      let newSortOrder = "desc";
      if (parsedParams.sortBy === sortKey) {
        // Toggle between asc/desc if clicking the same column
        newSortOrder = parsedParams.sortOrder === "asc" ? "desc" : "asc";
      }

      updateUrl({ sortBy: sortKey, sortOrder: newSortOrder, page: 1 });
    },
    [updateUrl, parsedParams],
  );

  // Generate columns with sorting props
  const columns = React.useMemo(
    () =>
      createColumns(parsedParams.sortBy, parsedParams.sortOrder, handleSort),
    [parsedParams.sortBy, parsedParams.sortOrder, handleSort],
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Handle search input with debouncing
  const [searchValue, setSearchValue] = React.useState("");

  // Debounce search updates
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentSearch = parsedParams.search || "";
      if (searchValue !== currentSearch) {
        updateUrl({ search: searchValue, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, updateUrl, parsedParams.search]);

  // Handle category filter
  const handleCategoryChange = React.useCallback(
    (category: string) => {
      updateUrl({ category, page: 1 });
    },
    [updateUrl],
  );

  // Handle pagination
  const handlePageChange = React.useCallback(
    (page: number) => {
      updateUrl({ page });
    },
    [updateUrl],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or SKU..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 pl-8"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={parsedParams.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="t-shirt">T-Shirt</SelectItem>
              <SelectItem value="polo-shirt">Polo Shirt</SelectItem>
              <SelectItem value="hoodie">Hoodie</SelectItem>
              <SelectItem value="tote-bag">Tote Bag</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 justify-end sm:justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPackage />
            <span className="hidden lg:inline">Add Stock</span>
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {totalCount}{" "}
            row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) =>
                  updateUrl({ pageSize: Number(value), page: 1 })
                }
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
