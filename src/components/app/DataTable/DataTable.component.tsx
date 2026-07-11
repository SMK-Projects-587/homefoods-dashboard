import { useState } from 'react';

import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableFilter {
  columnId: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Controlled state for server-driven mode. When provided, the table stops
 * doing any client-side filtering/sorting/pagination and simply renders the
 * page of rows it is given, delegating every control to these callbacks.
 */
export interface DataTableServer {
  search: string;
  onSearchChange: (value: string) => void;
  filterValues: Record<string, string | undefined>;
  onFilterChange: (columnId: string, value: string | undefined) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  isFetching?: boolean;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  renderMobileCard?: (row: TData) => React.ReactNode;
  pageSize?: number;
  /** Opt into server-driven filtering/sorting/pagination. */
  server?: DataTableServer;
  className?: string;
}

const ALL = 'all';

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No results.',
  onRowClick,
  searchPlaceholder,
  filters,
  renderMobileCard,
  pageSize = 10,
  server,
  className,
}: DataTableProps<TData>) {
  const isServer = !!server;
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: isServer
      ? { sorting: server.sorting }
      : { globalFilter, columnFilters, sorting },
    onGlobalFilterChange: isServer ? undefined : setGlobalFilter,
    onColumnFiltersChange: isServer ? undefined : setColumnFilters,
    onSortingChange: isServer ? server.onSortingChange : setSorting,
    globalFilterFn: 'includesString',
    manualPagination: isServer,
    manualFiltering: isServer,
    manualSorting: isServer,
    pageCount: isServer ? server.pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
    initialState: isServer ? undefined : { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const hasToolbar = !!searchPlaceholder || !!filters?.length;
  const pageCount = isServer ? server.pageCount : table.getPageCount();
  const pageIndex = isServer
    ? server.pageIndex
    : table.getState().pagination.pageIndex;
  const searchValue = isServer ? server.search : globalFilter;
  const onSearch = isServer ? server.onSearchChange : setGlobalFilter;
  const bodyDimmed = isServer && server.isFetching;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {hasToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {searchPlaceholder && (
            <Input
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="sm:max-w-64"
            />
          )}
          {filters?.map((filter) => {
            const column = table.getColumn(filter.columnId);
            const value = isServer
              ? (server.filterValues[filter.columnId] ?? ALL)
              : ((column?.getFilterValue() as string) ?? ALL);
            return (
              <Select
                key={filter.columnId}
                value={value}
                onValueChange={(next) => {
                  const parsed = next === ALL ? undefined : next;
                  if (isServer) server.onFilterChange(filter.columnId, parsed);
                  else column?.setFilterValue(parsed);
                }}
              >
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>
      )}

      {renderMobileCard && (
        <div
          className={cn(
            'flex flex-col gap-2 transition-opacity sm:hidden',
            bodyDimmed && 'opacity-60',
          )}
        >
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(e) => {
                  if (!onRowClick) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row.original);
                  }
                }}
                className={cn(
                  'border-border bg-card rounded-md border p-3',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {renderMobileCard(row.original)}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {emptyMessage}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          'border-border overflow-x-auto rounded-md border transition-opacity',
          renderMobileCard && 'hidden sm:block',
          bodyDimmed && 'opacity-60',
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                          ) : sortDirection === 'desc' ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="text-muted-foreground/50 size-3.5" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isServer ? pageIndex <= 0 : !table.getCanPreviousPage()}
              onClick={() =>
                isServer
                  ? server.onPageChange(pageIndex - 1)
                  : table.previousPage()
              }
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                isServer ? pageIndex >= pageCount - 1 : !table.getCanNextPage()
              }
              onClick={() =>
                isServer ? server.onPageChange(pageIndex + 1) : table.nextPage()
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
