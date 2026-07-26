import { Download, FileSpreadsheet, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  createVendor,
  deleteVendor,
  exportVendors,
  getVendors,
  importVendors,
  updateVendor,
  type CreateVendorRequest,
  type UpdateVendorRequest,
} from '../../api/admin/vendors.api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/toastContext';
import { usePermission } from '../../hooks/usePermission';
import type { Vendor } from '../../types/admin.types';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { formatBackendDate } from '../../utils/formatDate';

interface EditFormState {
  id?: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  logoUrl: string;
  status: 'active' | 'inactive' | 'pending';
}

const EMPTY_FORM: EditFormState = {
  name: '',
  email: '',
  phone: '',
  description: '',
  logoUrl: '',
  status: 'active',
};

const STATUS_TONE: Record<'active' | 'inactive' | 'pending', 'green' | 'red' | 'yellow'> = {
  active: 'green',
  inactive: 'red',
  pending: 'yellow',
};

// Server-side sort options cho AdminVendorsPage.
// `default` = createdAt desc (backend mặc định khi sortBy absent).
type SortOption = 'default' | 'products-desc' | 'orders-desc';

/**
 * Map FE sort option → backend `sortBy` + `sortOrder` query params.
 * Whitelist theo VENDOR_SORTABLE_FIELDS ở backend (get-vendor.dto.ts).
 */
function toBackendSort(opt: SortOption): {
  sortBy: 'name' | 'status' | 'totalProducts' | 'totalOrders' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
} {
  switch (opt) {
    case 'products-desc':
      return { sortBy: 'totalProducts', sortOrder: 'desc' };
    case 'orders-desc':
      return { sortBy: 'totalOrders', sortOrder: 'desc' };
    case 'default':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
}

export function AdminVendorsPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.vendors));
  const canUpdate = usePermission(PERM.update(ROUTES.vendorDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.vendorDetail));
  const canExport = usePermission(PERM.list('/vendors/export'));
  const canImport = usePermission(PERM.create('/vendors/import'));

  const [data, setData] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced search — chỉ giá trị trim() mới được gửi lên backend (tránh refetch mỗi keystroke).
  const [searchApplied, setSearchApplied] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchApplied(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchPage = async () => {
    const { sortBy, sortOrder } = toBackendSort(sortOption);
    setIsLoading(true);
    try {
      const res = await getVendors({
        page,
        itemPerPage,
        sortBy,
        sortOrder,
        ...(searchApplied && { name: searchApplied }),
      });
      setData(res.items ?? []);
      setTotalCount(res.meta?.totalCount ?? 0);
      setPageCount(Math.max(1, res.meta?.pageCount ?? 1));
    } catch {
      setData([]);
      setTotalCount(0);
      setPageCount(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch driven by query params
    void fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPage reads current page/itemPerPage/searchApplied/sortOption via closure
  }, [page, itemPerPage, searchApplied, sortOption]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setForm({
      id: v.id,
      name: v.name,
      email: v.email ?? '',
      phone: v.phone ?? '',
      description: v.description ?? '',
      logoUrl: v.logoUrl ?? '',
      status: v.status,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên nhà cung cấp.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const payload: UpdateVendorRequest = {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          description: form.description || undefined,
          logoUrl: form.logoUrl || undefined,
          status: form.status,
        };
        await updateVendor(form.id, payload);
        showToast('Cập nhật nhà cung cấp thành công.', 'success');
      } else {
        const payload: CreateVendorRequest = {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          description: form.description || undefined,
          logoUrl: form.logoUrl || undefined,
        };
        await createVendor(payload);
        showToast('Tạo nhà cung cấp thành công.', 'success');
      }
      closeForm();
      await fetchPage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteVendor(confirmDelete.id);
      showToast('Đã xóa nhà cung cấp.', 'success');
      setConfirmDelete(null);
      await fetchPage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportVendors();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `vendors-${ts}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Xuất file thành công.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xuất file thất bại';
      showToast(msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const openImportModal = () => {
    setImportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setImportOpen(true);
  };

  const closeImportModal = () => {
    setImportOpen(false);
    setImportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showToast('Vui lòng chọn file Excel.', 'error');
      return;
    }
    setIsImporting(true);
    try {
      await importVendors(importFile);
      showToast('Import nhà cung cấp thành công.', 'success');
      closeImportModal();
      await fetchPage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      showToast(msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: DataTableColumn<Vendor>[] = [
    { key: 'name', header: 'Tên', cell: (v) => <span className="font-medium">{v.name}</span> },
    {
      key: 'description',
      header: 'Mô tả',
      cell: (v) =>
        v.description ? (
          <span className="text-gray-600 line-clamp-2">{v.description}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'totalProducts',
      header: 'Tổng sản phẩm',
      className: 'w-36 text-center',
      cell: (v) => (
        <span className="tabular-nums">{(v.totalProducts ?? 0).toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'totalOrders',
      header: 'Tổng order',
      className: 'w-32 text-center',
      cell: (v) => (
        <span className="tabular-nums">{(v.totalOrders ?? 0).toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-32 text-center',
      cell: (v) => <StatusBadge label={v.status} tone={STATUS_TONE[v.status]} />,
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44 text-right',
      cell: (v) => formatBackendDate(v.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách nhà cung cấp trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => {
              setSearch('');
              setPage(1);
              void fetchPage();
            }}
          >
            Làm mới
          </Button>
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              isLoading={isExporting}
            >
              Export
            </Button>
          )}
          {canImport && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={openImportModal}
            >
              Import
            </Button>
          )}
          {canCreate && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Tạo nhà cung cấp
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tìm kiếm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </FormField>
          <FormField label="Sắp xếp">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="default">Mặc định</option>
              <option value="products-desc">Sản phẩm (cao → thấp)</option>
              <option value="orders-desc">Order (cao → thấp)</option>
            </select>
          </FormField>
        </div>
        {searchApplied && (
          <p className="text-xs text-gray-500 mt-2">
            Tổng cộng <strong className="text-gray-900">{totalCount}</strong> nhà cung cấp khớp tên
            "<span className="text-gray-900">{searchApplied}</span>"
          </p>
        )}
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(v) => v.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(v) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(v)}
                aria-label={`Sửa ${v.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(v)}
                aria-label={`Xóa ${v.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={form.id ? 'Chỉnh sửa nhà cung cấp' : 'Tạo nhà cung cấp'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {form.id ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Tên" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Logo URL">
            <input
              type="text"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          {form.id && (
            <FormField label="Trạng thái" required>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as 'active' | 'inactive' | 'pending',
                  })
                }
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </FormField>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa nhà cung cấp"
        message={`Bạn có chắc muốn xóa nhà cung cấp "${confirmDelete?.name}"?`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import nhà cung cấp"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeImportModal} disabled={isImporting}>
              Hủy
            </Button>
            <Button onClick={handleImportSubmit} isLoading={isImporting} disabled={!importFile}>
              Import
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Chọn file Excel (.xlsx) chứa danh sách nhà cung cấp. File cần có các cột:
            <span className="font-medium"> name, email, phone, description, logoUrl, status</span>.
          </p>
          <FormField label="File Excel">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white hover:file:opacity-90"
            />
          </FormField>
          {importFile && (
            <p className="text-xs text-gray-500">
              Đã chọn: <span className="font-medium">{importFile.name}</span> (
              {(importFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AdminVendorsPage;
