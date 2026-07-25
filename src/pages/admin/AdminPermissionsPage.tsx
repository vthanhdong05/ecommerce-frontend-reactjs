import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { FormField } from '../../components/ui/FormField';
import type { Permission } from '../../types/admin.types';
import { getPermissions } from '../../api/admin/permissions.api';

export function AdminPermissionsPage() {
  const [data, setData] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getPermissions({
          page,
          itemPerPage,
          search: search || undefined,
        });
        setData(res.items ?? []);
        setTotalCount(res.meta?.totalCount ?? 0);
      } catch {
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, itemPerPage, search]);

  const columns: DataTableColumn<Permission>[] = [
    { key: 'key', header: 'Key', cell: (r) => <code className="text-xs">{r.key}</code> },
    {
      key: 'description',
      header: 'Mô tả',
      cell: (r) => r.description || <span className="text-gray-400">—</span>,
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44',
      cell: (r) => new Date(r.createdAt).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý quyền</h1>
        <p className="text-sm text-gray-500 mt-1">Danh mục quyền trong hệ thống (chỉ đọc).</p>
      </div>

      <Card>
        <FormField label="Tìm kiếm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo key hoặc mô tả..."
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </FormField>
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        pagination={{
          page,
          itemPerPage,
          pageCount,
          totalCount,
        }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
      />
    </div>
  );
}

export default AdminPermissionsPage;
