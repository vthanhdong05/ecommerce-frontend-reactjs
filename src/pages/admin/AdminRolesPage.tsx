import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import type { Permission, Role, SystemRoleType } from '../../types/admin.types';
import {
  createRole,
  deleteRole,
  exportRoles,
  getRoleById,
  getRoles,
  importRoles,
  updateRole,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from '../../api/admin/roles.api';
import { getPermissions } from '../../api/admin/permissions.api';

interface EditFormState {
  id?: string;
  name: string;
  description: string;
  roleType: SystemRoleType;
  permissionIDs: string[];
}

const EMPTY_FORM: EditFormState = {
  name: '',
  description: '',
  roleType: 'SYSTEM',
  permissionIDs: [],
};

export function AdminRolesPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.roles));
  const canUpdate = usePermission(PERM.update(ROUTES.roleDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.roleDetail));
  const canExport = usePermission(PERM.list('/roles/export'));
  const canImport = usePermission(PERM.create('/roles/import'));

  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState<'default' | SystemRoleType>('default');

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  // Debounced search — chỉ giá trị trim mới gửi backend.
  const [searchApplied, setSearchApplied] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchApplied(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const res = await getRoles({
        page,
        itemPerPage,
        name: searchApplied || undefined,
        ...(roleTypeFilter !== 'default' && { roleType: roleTypeFilter }),
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

  const loadPermissions = async () => {
    try {
      const res = await getPermissions({ page: 1, itemPerPage: 200 });
      setAllPermissions(res.items ?? []);
    } catch {
      setAllPermissions([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on filter change
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadRoles reads current page/itemPerPage/search/roleTypeFilter via closure
  }, [page, itemPerPage, searchApplied, roleTypeFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    void loadPermissions();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = async (role: Role) => {
    setIsLoadingRole(true);
    try {
      // Single-role endpoint include rolePermissions — list endpoint thì không.
      const full = await getRoleById(role.id);
      setForm({
        id: full.id,
        name: full.name,
        description: full.description ?? '',
        roleType: full.roleType,
        permissionIDs: (full.rolePermissions ?? []).map((rp) => rp.permission.id),
      });
      setFormOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tải được vai trò';
      showToast(msg, 'error');
    } finally {
      setIsLoadingRole(false);
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const togglePermission = (id: string) => {
    setForm((prev) => ({
      ...prev,
      permissionIDs: prev.permissionIDs.includes(id)
        ? prev.permissionIDs.filter((x) => x !== id)
        : [...prev.permissionIDs, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên vai trò.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        // Update: luôn gửi permissionIDs (kể cả rỗng) để backend thay thế toàn bộ mapping.
        const payload: UpdateRoleRequest = {
          name: form.name,
          description: form.description || undefined,
          roleType: form.roleType,
          permissionIDs: form.permissionIDs,
        };
        await updateRole(form.id, payload);
        showToast('Cập nhật vai trò thành công.', 'success');
      } else {
        const payload: CreateRoleRequest = {
          name: form.name,
          description: form.description || undefined,
          roleType: form.roleType,
          permissionIDs: form.permissionIDs,
        };
        await createRole(payload);
        showToast('Tạo vai trò thành công.', 'success');
      }
      closeForm();
      await loadRoles();
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
      await deleteRole(confirmDelete.id);
      showToast('Đã xóa vai trò.', 'success');
      setConfirmDelete(null);
      await loadRoles();
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
      const blob = await exportRoles();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `roles-${ts}.xlsx`;
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
      await importRoles(importFile);
      showToast('Import vai trò thành công.', 'success');
      closeImportModal();
      await loadRoles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      showToast(msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Tên vai trò',
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: 'roleType',
      header: 'Loại',
      className: 'w-32',
      cell: (r) => (
        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{r.roleType}</span>
      ),
    },
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách vai trò trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void loadRoles();
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
              Tạo vai trò
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
          <FormField label="Loại">
            <select
              value={roleTypeFilter}
              onChange={(e) => {
                setRoleTypeFilter(e.target.value as 'default' | SystemRoleType);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="default">Tất cả</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="VENDOR">VENDOR</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </FormField>
        </div>
        {(searchApplied || roleTypeFilter !== 'default') && (
          <p className="text-xs text-gray-500 mt-2">
            Tổng cộng <strong className="text-gray-900">{totalCount}</strong> vai trò khớp
            {searchApplied && (
              <>
                {' '}
                tên có chứa "<span className="text-gray-900">{searchApplied}</span>"
              </>
            )}
            {roleTypeFilter !== 'default' && (
              <>
                {' '}
                thuộc loại <span className="text-gray-900">{roleTypeFilter}</span>
              </>
            )}
          </p>
        )}
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(r) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(r)}
                disabled={isLoadingRole}
                aria-label={`Sửa ${r.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(r)}
                aria-label={`Xóa ${r.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      {/* Edit Form */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={form.id ? 'Chỉnh sửa vai trò' : 'Tạo vai trò'}
        size="2xl"
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
          <FormField label="Tên vai trò" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              placeholder="VD: Content Manager"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              placeholder="Mô tả ngắn về vai trò..."
            />
          </FormField>
          <FormField label="Loại vai trò" required>
            <select
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value as SystemRoleType })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="SYSTEM">SYSTEM</option>
              <option value="VENDOR">VENDOR</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </FormField>

          <FormField label="Quyền được cấp">
            <div className="border border-gray-200 rounded max-h-60 overflow-y-auto p-2 space-y-1">
              {allPermissions.length === 0 ? (
                <p className="text-xs text-gray-500 p-2">Không có quyền nào.</p>
              ) : (
                allPermissions.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissionIDs.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      className="mt-1"
                    />
                    <div>
                      <code className="text-xs">{p.key}</code>
                      {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Thay đổi sẽ được lưu kèm theo khi bạn bấm "Lưu thay đổi".
            </p>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa vai trò"
        message={`Bạn có chắc muốn xóa vai trò "${confirmDelete?.name}"? Hành động này không thể hoàn tác.`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import roles từ Excel"
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
              <p className="font-medium">File Excel (.xlsx) theo template Roles</p>
              <p className="mt-1 text-xs text-blue-700">
                Mỗi dòng là 1 vai trò. Sheet phải tên là <code>Role</code>. Các cột bắt buộc:{' '}
                <code>name</code>; các cột khác (description, roleType) để trống nếu không cần. Vai
                trò trùng tên sẽ bị bỏ qua tùy theo rule của backend.
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

export default AdminRolesPage;
