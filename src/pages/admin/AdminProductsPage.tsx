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
import { formatVND } from '../../utils/formatCurrency';
import type { Product, ProductStatusType, ProductDetail } from '../../types/product.types';
import {
  createProduct,
  deleteProduct,
  getAdminProductById,
  getAdminProducts,
  updateProduct,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '../../api/admin/products.api';
import { getVendorOptions } from '../../api/admin/vendors.api';
import { getCategoryOptions } from '../../api/admin/categories.api';
import type { VendorOption } from '../../types/admin.types';
import type { CategoryOption } from '../../types/category.types';

interface EditFormState {
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: string;
  stockQuantity: string;
  status: ProductStatusType;
  vendorID: string;
  categoryIDs: string[];
}

const EMPTY_FORM: EditFormState = {
  name: '',
  description: '',
  sku: '',
  price: '0',
  stockQuantity: '0',
  status: 'draft',
  vendorID: '',
  categoryIDs: [],
};

export function AdminProductsPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.products));
  const canUpdate = usePermission(PERM.update(ROUTES.productDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.productDetail));

  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusType | ''>('');

  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts({
        page,
        itemPerPage,
        search: search || undefined,
        ...(statusFilter && { status: statusFilter }),
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on filter change
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load reads current page/itemPerPage/search/statusFilter via closure
  }, [page, itemPerPage, search, statusFilter]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [v, c] = await Promise.all([getVendorOptions(), getCategoryOptions()]);
        setVendors(v);
        setCategories(c);
      } catch {
        /* ignore */
      }
    };
    void loadOptions();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, vendorID: vendors[0]?.id ?? '' });
    setFormOpen(true);
  };

  const openEdit = async (p: Product) => {
    let detail: ProductDetail | null = null;
    try {
      detail = await getAdminProductById(p.id);
    } catch {
      /* fall back to list data */
    }
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      sku: p.sku ?? '',
      price: p.price,
      stockQuantity: String(p.stockQuantity),
      status: p.status,
      vendorID: p.vendorID,
      categoryIDs: detail?.productCategories
        ? detail.productCategories.map((pc) => pc.categoryID)
        : [],
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    const price = Number(form.price);
    const stock = Number(form.stockQuantity);
    if (!form.name.trim() || !form.vendorID) {
      showToast('Vui lòng nhập tên và chọn nhà cung cấp.', 'error');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      showToast('Giá không hợp lệ.', 'error');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      showToast('Số lượng tồn kho không hợp lệ.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const payload: UpdateProductRequest = {
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          price,
          stockQuantity: stock,
          status: form.status,
          categoryIDs: form.categoryIDs,
        };
        await updateProduct(form.id, payload);
        showToast('Cập nhật sản phẩm thành công.', 'success');
      } else {
        const payload: CreateProductRequest = {
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          price,
          stockQuantity: stock,
          status: form.status,
          vendorID: form.vendorID,
          categoryIDs: form.categoryIDs,
        };
        await createProduct(payload);
        showToast('Tạo sản phẩm thành công.', 'success');
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
      await deleteProduct(confirmDelete.id);
      showToast('Đã xóa sản phẩm.', 'success');
      setConfirmDelete(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Tên sản phẩm',
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'sku',
      header: 'SKU',
      className: 'w-32',
      cell: (p) => p.sku ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'price',
      header: 'Giá',
      className: 'w-32',
      cell: (p) => formatVND(parseFloat(p.price)),
    },
    {
      key: 'stockQuantity',
      header: 'Tồn kho',
      className: 'w-24 text-right',
      cell: (p) => <span className="font-medium">{p.stockQuantity}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-32',
      cell: (p) => (
        <StatusBadge
          tone={p.status === 'active' ? 'green' : p.status === 'draft' ? 'gray' : 'red'}
          label={p.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách sản phẩm trong hệ thống.</p>
        </div>
        {canCreate && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Tạo sản phẩm
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Tìm theo tên, SKU..."
                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </FormField>
          <FormField label="Trạng thái">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProductStatusType | '');
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </FormField>
        </div>
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

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={form.id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
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
          <FormField label="Tên sản phẩm" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU">
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </FormField>
            <FormField label="Nhà cung cấp" required>
              <select
                value={form.vendorID}
                onChange={(e) => setForm({ ...form, vendorID: e.target.value })}
                disabled={!!form.id}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
              >
                <option value="">— Chọn —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Giá (VND)" required>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </FormField>
            <FormField label="Tồn kho" required>
              <input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              />
            </FormField>
            <FormField label="Trạng thái" required>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatusType })}
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Danh mục">
            <select
              multiple
              value={form.categoryIDs}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryIDs: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
              className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Giữ Ctrl/Command để chọn nhiều.</p>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa sản phẩm "${confirmDelete?.name}"?`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default AdminProductsPage;
