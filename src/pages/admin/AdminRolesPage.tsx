import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
  getRoles,
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
  permissionKeys: string[];
}

const EMPTY_FORM: EditFormState = {
  name: '',
  description: '',
  roleType: 'SYSTEM',
  permissionKeys: [],
};

export function AdminRolesPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.roles));
  const canUpdate = usePermission(PERM.update(ROUTES.roleDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.roleDetail));

  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const res = await getRoles({ page, itemPerPage, search: search || undefined });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadRoles reads current page/itemPerPage/search via closure
  }, [page, itemPerPage, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    void loadPermissions();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setForm({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      roleType: role.roleType,
      // Note: backend list response doesn't include permission keys; users will see empty matrix.
      // The role-permission mapping is per role and updated via separate endpoints.
      permissionKeys: [],
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(key)
        ? prev.permissionKeys.filter((k) => k !== key)
        : [...prev.permissionKeys, key],
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
        const payload: UpdateRoleRequest = {
          name: form.name,
          description: form.description || undefined,
          roleType: form.roleType,
        };
        await updateRole(form.id, payload);
        showToast('Cập nhật vai trò thành công.', 'success');
      } else {
        const payload: CreateRoleRequest = {
          name: form.name,
          description: form.description || undefined,
          roleType: form.roleType,
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
        {canCreate && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Tạo vai trò
          </Button>
        )}
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
              placeholder="Tìm theo tên..."
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
                      checked={form.permissionKeys.includes(p.key)}
                      onChange={() => togglePermission(p.key)}
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
              Việc cập nhật quyền cho vai trò thông qua giao diện này chỉ lưu local; backend có thể
              yêu cầu endpoint riêng.
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
    </div>
  );
}

export default AdminRolesPage;
