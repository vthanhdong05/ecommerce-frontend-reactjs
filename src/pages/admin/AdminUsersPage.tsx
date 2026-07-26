import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { useToast } from '../../hooks/toastContext';
import { useAuth } from '../../hooks/useAuth';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import type { User } from '../../types/auth.types';
import { formatBackendDate } from '../../utils/formatDate';
import {
  createUser,
  deleteUser,
  exportUsers,
  getUsers,
  importUsers,
  updateUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '../../api/admin/users.api';

interface EditFormState {
  id?: string;
  email: string;
  fullName: string; // → firstName on submit
  fullAddress: string;
  phone: string;
  password: string;
}

const EMPTY_FORM: EditFormState = {
  email: '',
  fullName: '',
  fullAddress: '',
  phone: '',
  password: '',
};

type SortOption = 'default' | 'newest' | 'oldest' | 'email-asc';
type RoleFilterOption = 'default' | 'USER' | 'VENDOR' | 'SYSTEM' | 'SUPER_ADMIN';

const ROLE_TONE: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  SYSTEM: 'bg-blue-100 text-blue-700',
  VENDOR: 'bg-amber-100 text-amber-700',
  USER: 'bg-gray-100 text-gray-700',
};

function roleTone(roleType: string | null | undefined): string {
  return ROLE_TONE[roleType ?? 'USER'] ?? ROLE_TONE.USER;
}

/**
 * Server-side sort: backend handles ordering.
 * - `default`: createdAt desc (backend default when sortBy absent).
 * - `newest`: createdAt desc
 * - `oldest`: createdAt asc
 * - `email-asc`: email asc
 *
 * Map FE sort option → backend `sortBy` + `sortOrder` query params.
 */
function toBackendSort(opt: SortOption): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  switch (opt) {
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    case 'email-asc':
      return { sortBy: 'email', sortOrder: 'asc' };
    case 'default':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
}

export function AdminUsersPage() {
  const { showToast } = useToast();
  const { user: self } = useAuth();
  const canCreate = usePermission(PERM.create(ROUTES.users));
  const canUpdate = usePermission(PERM.update(ROUTES.userDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.userDetail));
  const canExport = usePermission(PERM.list('/users/export'));
  const canImport = usePermission(PERM.create('/users/import'));

  const [pageData, setPageData] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [emailSearch, setEmailSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [roleFilter, setRoleFilter] = useState<RoleFilterOption>('default');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced email search — only the trimmed value is sent to the backend.
  const [emailSearchApplied, setEmailSearchApplied] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setEmailSearchApplied(emailSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [emailSearch]);

  // Sort đẩy lên backend — append sortBy/sortOrder cho cross-page ordering.
  const fetchPage = async (overrides?: { page?: number; itemPerPage?: number }) => {
    const reqPage = overrides?.page ?? page;
    const reqPerPage = overrides?.itemPerPage ?? itemPerPage;
    const { sortBy, sortOrder } = toBackendSort(sortOption);
    setIsLoading(true);
    try {
      const res = await getUsers({
        page: reqPage,
        itemPerPage: reqPerPage,
        sortBy,
        sortOrder,
        ...(emailSearchApplied && { email: emailSearchApplied }),
        ...(roleFilter !== 'default' && {
          roleType: roleFilter as 'USER' | 'VENDOR' | 'SYSTEM' | 'SUPER_ADMIN',
        }),
      });
      setPageData(res.items ?? []);
      setTotalCount(res.meta.totalCount);
      setPageCount(Math.max(1, res.meta.pageCount));
    } catch {
      setPageData([]);
      setTotalCount(0);
      setPageCount(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when page, itemPerPage, applied email, role or sort changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch driven by query params
    void fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate: re-fetch on filter/sort/pagination change
  }, [page, itemPerPage, emailSearchApplied, roleFilter, sortOption]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (u: User) => {
    setForm({
      id: u.id,
      email: u.email,
      fullName: u.firstName + (u.lastName ? ' ' + u.lastName : ''),
      fullAddress: u.fullAddress ?? '',
      phone: u.phone ?? '',
      password: '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.fullName.trim()) {
      showToast('Vui lòng nhập email và họ tên.', 'error');
      return;
    }
    if (!form.id && !form.password) {
      showToast('Vui lòng nhập mật khẩu cho user mới.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const payload: UpdateUserRequest = {
          firstName: form.fullName.trim(),
          fullAddress: form.fullAddress || undefined,
          phone: form.phone || undefined,
          ...(form.password && { password: form.password }),
        };
        await updateUser(form.id, payload);
      } else {
        const payload: CreateUserRequest = {
          email: form.email,
          password: form.password,
          firstName: form.fullName.trim(),
          fullAddress: form.fullAddress || undefined,
          phone: form.phone || undefined,
        };
        await createUser(payload);
      }

      // Server is the source of truth — refetch the current page so cache & lists stay consistent.
      await fetchPage();
      closeForm();
      showToast(form.id ? 'Cập nhật user thành công.' : 'Tạo user thành công.', 'success');
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
    const targetId = confirmDelete.id;
    try {
      await deleteUser(targetId);
      setConfirmDelete(null);
      showToast('Đã xóa user.', 'success');
      // After delete the current page may be empty; server-side pagination will clamp.
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
      const blob = await exportUsers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `users-${ts}.xlsx`;
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
      await importUsers(importFile);
      showToast('Import user thành công.', 'success');
      closeImportModal();
      await fetchPage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      showToast(msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortKey: 'email',
      cell: (u) => <span className="font-medium">{u.email}</span>,
    },
    {
      key: 'name',
      header: 'Họ tên',
      cell: (u) =>
        [u.firstName, u.lastName].filter(Boolean).join(' ') || (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'phone',
      header: 'SĐT',
      className: 'w-32',
      cell: (u) => u.phone || <span className="text-gray-400">—</span>,
    },
    {
      key: 'role',
      header: 'Role',
      className: 'w-36',
      cell: (u) => {
        const label = u.roleType ?? 'USER';
        return (
          <span className={`px-2 py-0.5 text-xs rounded ${roleTone(label)}`}>
            {label}
            {self?.email === u.email && <span className="ml-1 text-[10px] opacity-70">(bạn)</span>}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      sortKey: 'createdAt',
      className: 'w-44',
      cell: (u) => formatBackendDate(u.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách tài khoản người dùng trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
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
              Tạo user
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Tìm kiếm theo email">
            <input
              type="email"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              placeholder="Nhập email để lọc..."
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
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
              <option value="email-asc">Email (A → Z)</option>
            </select>
          </FormField>
          <FormField label="Role">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as RoleFilterOption);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="default">Tất cả</option>
              <option value="USER">USER</option>
              <option value="VENDOR">VENDOR</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </FormField>
        </div>
        {(emailSearchApplied || roleFilter !== 'default') && (
          <p className="text-xs text-gray-500 mt-2">
            Tổng cộng <strong className="text-gray-900">{totalCount}</strong> user khớp
            {emailSearchApplied && (
              <>
                {' '}
                email "<span className="text-gray-900">{emailSearchApplied}</span>"
              </>
            )}
            {roleFilter !== 'default' && (
              <>
                {' '}
                với role <span className="text-gray-900">{roleFilter}</span>
              </>
            )}
          </p>
        )}
      </Card>

      <DataTable
        columns={columns}
        data={pageData}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(u) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(u)}
                aria-label={`Sửa ${u.email}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(u)}
                aria-label={`Xóa ${u.email}`}
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
        title={form.id ? 'Chỉnh sửa user' : 'Tạo user'}
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
          <FormField label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!form.id}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
          </FormField>
          <FormField label="Họ tên" required>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
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
          <FormField label="Địa chỉ">
            <input
              type="text"
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField
            label={form.id ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            required={!form.id}
          >
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa user"
        message={`Bạn có chắc muốn xóa user "${confirmDelete?.email}"? Hành động này không thể hoàn tác.`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import users từ Excel"
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
              <p className="font-medium">File Excel (.xlsx) theo template Users</p>
              <p className="mt-1 text-xs text-blue-700">
                Mỗi dòng là 1 user. Cột <code>password</code> bắt buộc (sẽ được hash tự động),{' '}
                <code>email</code> bắt buộc và đúng định dạng. Các cột khác (firstName, lastName,
                phone, fullAddress…) để trống nếu không cần.
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

export default AdminUsersPage;
