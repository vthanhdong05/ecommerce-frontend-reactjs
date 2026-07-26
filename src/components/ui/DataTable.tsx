import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Render cell content. */
  cell: (row: T) => ReactNode;
  /** Tailwind class for the <td>/<th> (e.g. width, alignment). */
  className?: string;
  /** If provided, enables sort. */
  sortKey?: string;
}

export interface DataTablePagination {
  page: number;
  itemPerPage: number;
  pageCount: number;
  totalCount: number;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: DataTablePagination;
  isLoading?: boolean;
  rowKey: (row: T) => string;
  /** Render a row-level action bar (right-most). */
  rowActions?: (row: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onPageChange?: (page: number) => void;
  onItemPerPageChange?: (n: number) => void;
  onSortChange?: (sortKey: string) => void;
  /** Click vào row (mở drawer/detail). */
  onRowClick?: (row: T) => void;
  /** Currently active sort key. */
  sortKey?: string;
  /** Currently active sort direction. */
  sortDir?: 'asc' | 'desc';
  /** Action bar rendered above the table (right side). */
  toolbar?: ReactNode;
  /** Bật table-fixed + chia đều width cho từng cột (kể cả rowActions). */
  equalWidth?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  isLoading = false,
  rowKey,
  rowActions,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  onPageChange,
  onItemPerPageChange,
  onSortChange,
  onRowClick,
  sortKey,
  sortDir,
  toolbar,
  equalWidth = false,
}: DataTableProps<T>) {
  // Tổng số cột = columns + 1 cột rowActions (nếu có). Khi equalWidth=true: dùng table-fixed
  // + mỗi cột nhận width fraction tương ứng (whitelist để tránh tailwind purge class động).
  const totalCols = columns.length + (rowActions ? 1 : 0);
  const EQUAL_WIDTH_CLASS: Record<number, string> = {
    1: 'w-full',
    2: 'w-1/2',
    3: 'w-1/3',
    4: 'w-1/4',
    5: 'w-1/5',
    6: 'w-1/6',
    7: 'w-1/7',
    8: 'w-1/8',
  };
  const equalWidthClass = EQUAL_WIDTH_CLASS[totalCols] ?? '';
  const colWidthClass = equalWidth ? equalWidthClass : '';
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {(toolbar || onItemPerPageChange) && (
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-sm text-gray-500">
            {pagination && (
              <>
                Tổng <strong className="text-gray-900">{pagination.totalCount}</strong> bản ghi
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onItemPerPageChange && pagination && (
              <select
                value={pagination.itemPerPage}
                onChange={(e) => onItemPerPageChange(Number(e.target.value))}
                className="h-9 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / trang
                  </option>
                ))}
              </select>
            )}
            {toolbar}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${equalWidth ? 'table-fixed' : ''}`}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => {
                const sortable = col.sortKey && onSortChange;
                const isActive = sortKey === col.sortKey;
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap ${colWidthClass} ${col.className || ''}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange!(col.sortKey!)}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        {col.header}
                        {isActive && (
                          <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th className={`px-4 py-3 text-right font-semibold text-gray-700 ${colWidthClass}`}>
                  {' '}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <Spinner size="md" label="Đang tải…" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-2">
                  <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${colWidthClass} ${col.className || ''}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className={`px-4 py-3 text-right ${colWidthClass}`}>
                      <div className="inline-flex items-center gap-1">{rowActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm flex-wrap gap-2">
          <div className="text-gray-500">
            Trang <strong className="text-gray-900">{pagination.page}</strong> /{' '}
            {pagination.pageCount}
          </div>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang đầu"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pageCount}
              className="p-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.pageCount)}
              disabled={pagination.page >= pagination.pageCount}
              className="p-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang cuối"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
