import { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import type { Category, CategoryOption } from '../../types/category.types';
import { formatBackendDate } from '../../utils/formatDate';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategoryOptions,
  updateCategory,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from '../../api/admin/categories.api';

interface EditFormState {
  id?: string;
  name: string;
  description: string;
  parentID: string | null;
  imageUrl: string;
}

const EMPTY_FORM: EditFormState = {
  name: '',
  description: '',
  parentID: null,
  imageUrl: '',
};

// Parent filter giá trị đặc biệt: '' = tất cả, '__ROOT__' = danh mục gốc (parentID null), uuid = parent cụ thể.
const PARENT_ALL = '';
const PARENT_ROOT = '__ROOT__';

type ParentFilter = typeof PARENT_ALL | typeof PARENT_ROOT | string;

type SortOption = 'default' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';

/**
 * Map FE sort option → backend `sortBy` + `sortOrder` query params.
 * Whitelist theo CATEGORY_SORTABLE_FIELDS ở backend (get-category.dto.ts).
 */
function toBackendSort(opt: SortOption): {
  sortBy: 'name' | 'slug' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
} {
  switch (opt) {
    case 'name-asc':
      return { sortBy: 'name', sortOrder: 'asc' };
    case 'name-desc':
      return { sortBy: 'name', sortOrder: 'desc' };
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    case 'default':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
}

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.categories));
  const canUpdate = usePermission(PERM.update(ROUTES.categoryDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.categoryDetail));

  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [parentFilter, setParentFilter] = useState<ParentFilter>(PARENT_ALL);

  // Options cho dropdown lọc theo parent + lookup name → render cột "Danh mục cha".
  // Load 1 lần lúc mount; thêm vào sau khi tạo/sửa/xóa (refetch options thay vì patch local).
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lưu options (kể cả category hiện tại) để chọn parent trong form — tránh chính nó làm parent.
  const [formParentOptions, setFormParentOptions] = useState<CategoryOption[]>([]);
  const optionsLoadedRef = useRef(false);

  // Debounced search — chỉ giá trị trim() mới được gửi lên backend (tránh refetch mỗi keystroke).
  const [nameSearchApplied, setNameSearchApplied] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setNameSearchApplied(nameSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [nameSearch]);

  const fetchOptions = async () => {
    try {
      const opts = await getCategoryOptions();
      setCategoryOptions(opts);
    } catch {
      // Im lặng — dropdown filter sẽ rỗng nhưng trang vẫn hoạt động.
    }
  };

  const fetchPage = async () => {
    const { sortBy, sortOrder } = toBackendSort(sortOption);
    // parentFilter: PARENT_ALL → không gửi; PARENT_ROOT → parentID=null; uuid → parentID=uuid.
    let parentIDParam: string | null | undefined;
    if (parentFilter === PARENT_ALL) parentIDParam = undefined;
    else if (parentFilter === PARENT_ROOT) parentIDParam = null;
    else parentIDParam = parentFilter;
    setIsLoading(true);
    try {
      const res = await getAdminCategories({
        page,
        itemPerPage,
        sortBy,
        sortOrder,
        ...(nameSearchApplied && { name: nameSearchApplied }),
        ...(parentIDParam !== undefined && { parentID: parentIDParam }),
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot bootstrap fetch of category options for filter/parent lookups
    void fetchOptions();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch driven by query params
    void fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPage reads current page/itemPerPage/nameSearchApplied/sortOption/parentFilter via closure
  }, [page, itemPerPage, nameSearchApplied, sortOption, parentFilter]);

  // Sau khi load options lần đầu → cho phép dùng cho form parent select.
  useEffect(() => {
    if (!optionsLoadedRef.current && categoryOptions.length > 0) {
      optionsLoadedRef.current = true;
    }
  }, [categoryOptions]);

  // Helper: tìm name theo id để render cột "Danh mục cha".
  const parentNameById = (id: string | null): string => {
    if (!id) return '—';
    return categoryOptions.find((o) => o.id === id)?.name ?? '(đã xóa)';
  };

  const openCreate = (parentID: string | null = null) => {
    setForm({ ...EMPTY_FORM, parentID });
    // Khi tạo mới: parent có thể là bất kỳ category nào.
    setFormParentOptions(categoryOptions);
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      description: c.description ?? '',
      parentID: c.parentID ?? null,
      imageUrl: c.imageUrl ?? '',
    });
    // Khi sửa: loại bỏ chính nó khỏi danh sách parent (tránh tự làm cha của mình).
    setFormParentOptions(categoryOptions.filter((o) => o.id !== c.id));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên danh mục.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const payload: UpdateCategoryRequest = {
          name: form.name,
          description: form.description || undefined,
          parentID: form.parentID,
          imageUrl: form.imageUrl || undefined,
        };
        await updateCategory(form.id, payload);
        showToast('Cập nhật danh mục thành công.', 'success');
      } else {
        const payload: CreateCategoryRequest = {
          name: form.name,
          description: form.description || undefined,
          parentID: form.parentID,
          imageUrl: form.imageUrl || undefined,
        };
        await createCategory(payload);
        showToast('Tạo danh mục thành công.', 'success');
      }
      closeForm();
      // Refresh cả options (có thể có category mới / tên đổi) và page hiện tại.
      await Promise.all([fetchOptions(), fetchPage()]);
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
      await deleteCategory(confirmDelete.id);
      showToast('Đã xóa danh mục.', 'success');
      setConfirmDelete(null);
      await Promise.all([fetchOptions(), fetchPage()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Tên',
      sortKey: 'name',
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'w-44',
      cell: (c) => (
        <code className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">{c.slug}</code>
      ),
    },
    {
      key: 'parent',
      header: 'Danh mục cha',
      className: 'w-44',
      cell: (c) =>
        c.parentID ? (
          <span className="text-gray-700">{parentNameById(c.parentID)}</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
            Gốc
          </span>
        ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      cell: (c) =>
        c.description ? (
          <span className="text-gray-600 line-clamp-2">{c.description}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      sortKey: 'createdAt',
      className: 'w-44 text-right',
      cell: (c) => formatBackendDate(c.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">Danh mục sản phẩm trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNameSearch('');
              setParentFilter(PARENT_ALL);
              setSortOption('default');
              setPage(1);
              void fetchPage();
            }}
          >
            Làm mới
          </Button>
          {canCreate && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openCreate(null)}>
              Tạo danh mục
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
          <FormField label="Danh mục cha">
            <select
              value={parentFilter}
              onChange={(e) => {
                setParentFilter(e.target.value as ParentFilter);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value={PARENT_ALL}>Tất cả</option>
              <option value={PARENT_ROOT}>— Danh mục gốc —</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
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
              <option value="name-asc">Tên (A → Z)</option>
              <option value="name-desc">Tên (Z → A)</option>
            </select>
          </FormField>
        </div>
        {(nameSearchApplied || parentFilter !== PARENT_ALL) && (
          <p className="text-xs text-gray-500 mt-2">
            Tổng cộng <strong className="text-gray-900">{totalCount}</strong> danh mục khớp
            {nameSearchApplied && (
              <>
                {' '}
                tên "<span className="text-gray-900">{nameSearchApplied}</span>"
              </>
            )}
            {parentFilter !== PARENT_ALL && (
              <>
                {' '}
                {parentFilter === PARENT_ROOT ? (
                  <span className="text-gray-900">là danh mục gốc</span>
                ) : (
                  <>
                    thuộc cha "<span className="text-gray-900">{parentNameById(parentFilter)}</span>
                    "
                  </>
                )}
              </>
            )}
          </p>
        )}
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(c) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(c)}
                aria-label={`Sửa ${c.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(c)}
                aria-label={`Xóa ${c.name}`}
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
        title={form.id ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
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
          <FormField label="Tên danh mục" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <FormField label="Danh mục cha">
            <select
              value={form.parentID ?? ''}
              onChange={(e) => setForm({ ...form, parentID: e.target.value || null })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">— Không có (danh mục gốc) —</option>
              {formParentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="URL ảnh">
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              placeholder="https://..."
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${confirmDelete?.name}"? Các danh mục con có thể bị ảnh hưởng.`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default AdminCategoriesPage;
