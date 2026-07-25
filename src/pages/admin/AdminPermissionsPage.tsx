import { Pencil, Plus, Trash2, Download, Upload, FileSpreadsheet, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  createPermission,
  deletePermission,
  exportPermissions,
  getPermissions,
  importPermissions,
  updatePermission,
  type CreatePermissionRequest,
  type UpdatePermissionRequest,
} from '../../api/admin/permissions.api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/toastContext';
import { usePermission } from '../../hooks/usePermission';
import type { Permission } from '../../types/admin.types';
import { formatBackendDate } from '../../utils/formatDate';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';

interface EditFormState {
  id?: string;
  name: string;
  key: string;
  description: string;
  isSystemPermission: boolean;
}

const EMPTY_FORM: EditFormState = {
  name: '',
  key: '',
  description: '',
  isSystemPermission: false,
};

type SortOption = 'default' | 'newest' | 'oldest' | 'name-asc';
type TypeFilterOption = 'default' | 'SYSTEM' | 'VENDOR';

/**
 * Server-side sort — map FE sort option → backend `sortBy` + `sortOrder`.
 * Whitelist field `PERMISSION_SORTABLE_FIELDS` ở backend đảm bảo Prisma không throw.
 */
function toBackendSort(
  opt: SortOption
): { sortBy: 'createdAt' | 'name'; sortOrder: 'asc' | 'desc' } | null {
  switch (opt) {
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    case 'name-asc':
      return { sortBy: 'name', sortOrder: 'asc' };
    case 'default':
    default:
      return null;
  }
}

export function AdminPermissionsPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.permissions));
  const canUpdate = usePermission(PERM.update(ROUTES.permissionDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.permissionDetail));
  const canExport = usePermission(PERM.list('/permissions/export'));
  const canImport = usePermission(PERM.create('/permissions/import'));

  const [data, setData] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [nameSearch, setNameSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>('default');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Permission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  // Debounced name search — chỉ giá trị trim mới gửi backend.
  const [nameSearchApplied, setNameSearchApplied] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setNameSearchApplied(nameSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [nameSearch]);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      const sort = toBackendSort(sortOption);
      const res = await getPermissions({
        page,
        itemPerPage,
        name: nameSearchApplied || undefined,
        ...(typeFilter !== 'default' && { isSystemPermission: typeFilter === 'SYSTEM' }),
        ...(sort && { sortBy: sort.sortBy, sortOrder: sort.sortOrder }),
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on filter/pagination/sort change
    void loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadPermissions reads current page/itemPerPage/search/type/sort via closure
  }, [page, itemPerPage, nameSearchApplied, typeFilter, sortOption]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (p: Permission) => {
    setForm({
      id: p.id,
      name: p.name,
      key: p.key,
      description: p.description ?? '',
      isSystemPermission: p.isSystemPermission,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.key.trim()) {
      showToast('Vui lòng nhập tên và key.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const payload: UpdatePermissionRequest = {
          name: form.name,
          key: form.key,
          description: form.description || undefined,
          isSystemPermission: form.isSystemPermission,
        };
        await updatePermission(form.id, payload);
        showToast('Cập nhật quyền thành công.', 'success');
      } else {
        const payload: CreatePermissionRequest = {
          name: form.name,
          key: form.key,
          description: form.description || undefined,
          isSystemPermission: form.isSystemPermission,
        };
        await createPermission(payload);
        showToast('Tạo quyền thành công.', 'success');
      }
      closeForm();
      await loadPermissions();
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
      await deletePermission(confirmDelete.id);
      showToast('Đã xóa quyền.', 'success');
      setConfirmDelete(null);
      await loadPermissions();
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
      const blob = await exportPermissions();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `permissions-${ts}.xlsx`;
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
      await importPermissions(importFile);
      showToast('Import quyền thành công.', 'success');
      closeImportModal();
      await loadPermissions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      showToast(msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: DataTableColumn<Permission>[] = [
    {
      key: 'name',
      header: 'Tên',
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'key',
      header: 'Key',
      cell: (p) => <code className="text-xs">{p.key}</code>,
    },
    {
      key: 'isSystemPermission',
      header: 'Permission Type',
      className: 'w-48',
      cell: (p) =>
        p.isSystemPermission ? (
          <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">SYSTEM</span>
        ) : (
          <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">VENDOR</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44',
      cell: (p) => formatBackendDate(p.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách quyền trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void loadPermissions();
            }}
          >
            Làm mới
          </Button>
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              isLoading={isExporting}
              onClick={handleExport}
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
              Tạo quyền
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Tìm kiếm theo tên">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Nhập tên để lọc..."
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
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
            </select>
          </FormField>
          <FormField label="Permission Type">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as TypeFilterOption);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="default">Tất cả</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="VENDOR">VENDOR</option>
            </select>
          </FormField>
        </div>
        {(nameSearchApplied || typeFilter !== 'default') && (
          <p className="text-xs text-gray-500 mt-2">
            Tổng cộng <strong className="text-gray-900">{totalCount}</strong> quyền khớp
            {nameSearchApplied && (
              <>
                {' '}
                tên có chứa "<span className="text-gray-900">{nameSearchApplied}</span>"
              </>
            )}
            {typeFilter !== 'default' && (
              <>
                {' '}
                thuộc loại <span className="text-gray-900">{typeFilter}</span>
              </>
            )}
            .
          </p>
        )}
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(p) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(p)}
                aria-label={`Sửa ${p.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(p)}
                aria-label={`Xóa ${p.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      {/* Create / Edit Form */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={form.id ? 'Chỉnh sửa quyền' : 'Tạo quyền'}
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
              placeholder="VD: Create user"
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField
            label="Key"
            required
            hint="Định dạng chuẩn: [/route]_[action]. VD: [/users]_[create]"
          >
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="[/users]_[create]"
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary font-mono"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Mô tả ngắn về quyền..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Loại quyền">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isSystemPermission}
                onChange={(e) => setForm({ ...form, isSystemPermission: e.target.checked })}
                className="mt-0.5"
              />
              <span>Permission Type</span>
              <span className="text-xs text-gray-500">(true = SYSTEM, false = VENDOR)</span>
            </label>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa quyền"
        message={`Bạn có chắc muốn xóa quyền "${confirmDelete?.name}"? Hành động này không thể hoàn tác.`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import permissions từ Excel"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeImportModal} disabled={isImporting}>
              Hủy
            </Button>
            <Button onClick={handleImportSubmit} isLoading={isImporting} disabled={!importFile}>
              Upload & Import
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <FileSpreadsheet className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">File Excel (.xlsx) theo template Permissions</p>
              <p className="mt-1 text-xs text-blue-700">
                Mỗi dòng là 1 quyền. Sheet phải tên là <code>Permission</code>. Các cột bắt buộc:{' '}
                <code>name</code>, <code>key</code>; các cột khác (description, isSystemPermission)
                để trống nếu không cần. Key trùng với quyền đã có sẽ bị bỏ qua tùy theo rule của
                backend.
              </p>
            </div>
          </div>

          <FormField label="Chọn file">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
          </FormField>

          {importFile && (
            <p className="text-xs text-gray-600">
              Đã chọn: <strong className="text-gray-900">{importFile.name}</strong> (
              {(importFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AdminPermissionsPage;
