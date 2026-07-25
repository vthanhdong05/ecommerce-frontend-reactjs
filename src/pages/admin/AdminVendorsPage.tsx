import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import type { Vendor } from '../../types/admin.types';
import {
  createVendor,
  deleteVendor,
  getVendors,
  updateVendor,
  type CreateVendorRequest,
  type UpdateVendorRequest,
} from '../../api/admin/vendors.api';

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

export function AdminVendorsPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.vendors));
  const canUpdate = usePermission(PERM.update(ROUTES.vendorDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.vendorDetail));

  const [data, setData] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getVendors({ page, itemPerPage, search: search || undefined });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on filter change
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load reads current page/itemPerPage/search via closure
  }, [page, itemPerPage, search]);

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
      await load();
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
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Vendor>[] = [
    { key: 'name', header: 'Tên', cell: (v) => <span className="font-medium">{v.name}</span> },
    {
      key: 'email',
      header: 'Email',
      cell: (v) => v.email ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'phone',
      header: 'SĐT',
      className: 'w-32',
      cell: (v) => v.phone ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-32',
      cell: (v) => <StatusBadge label={v.status} tone={STATUS_TONE[v.status]} />,
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44',
      cell: (v) => new Date(v.createdAt).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách nhà cung cấp trong hệ thống.</p>
        </div>
        {canCreate && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Tạo nhà cung cấp
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
              placeholder="Tìm theo tên, email..."
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </FormField>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </FormField>
            <FormField label="Số điện thoại">
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </FormField>
          </div>
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
    </div>
  );
}

export default AdminVendorsPage;
