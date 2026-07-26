import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ProductDetailDrawer } from '../../components/admin/products/ProductDetailDrawer';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import { formatVND } from '../../utils/formatCurrency';
import { formatBackendDate } from '../../utils/formatDate';
import type { Product, ProductStatusType, ProductDetail } from '../../types/product.types';
import {
  createProduct,
  deleteProduct,
  exportProducts,
  getAdminProductById,
  getAdminProducts,
  importProducts,
  updateProduct,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '../../api/admin/products.api';
import { getVendorOptions } from '../../api/admin/vendors.api';
import { getCategoryOptions } from '../../api/admin/categories.api';
import type { VendorOption } from '../../types/admin.types';
import type { CategoryOption } from '../../types/category.types';

interface CreateFormState {
  name: string;
  description: string;
  sku: string;
  price: string;
  stockQuantity: string;
  status: ProductStatusType;
  vendorID: string;
  categoryIDs: string[];
}

const EMPTY_FORM: CreateFormState = {
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
  const canExport = usePermission(PERM.list('/products/export'));
  const canImport = usePermission(PERM.create('/products/import'));

  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusType | ''>('');

  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Modal "Tạo mới" — flow create giữ nguyên Modal (không qua Drawer).
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drawer chi tiết — mở khi click row hoặc icon edit.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<ProductDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openDrawer = async (p: Product) => {
    setDrawerOpen(true);
    setDrawerProduct(null);
    setDrawerLoading(true);
    try {
      const detail = await getAdminProductById(p.id);
      setDrawerProduct(detail);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi tải chi tiết sản phẩm', 'error');
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerProduct(null);
  };

  /** Submit update từ tab "Thông tin" của Drawer. Refetch detail để drawer có data mới nhất. */
  const handleDrawerUpdate = async (
    id: string,
    data: UpdateProductRequest
  ): Promise<ProductDetail> => {
    await updateProduct(id, data);
    const fresh = await getAdminProductById(id);
    setDrawerProduct(fresh);
    await load();
    return fresh;
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
      setFormOpen(false);
      setForm(EMPTY_FORM);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportProducts();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `products-${ts}.xlsx`;
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
      await importProducts(importFile);
      showToast('Import sản phẩm thành công.', 'success');
      closeImportModal();
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      showToast(msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  /** Lookup vendor name từ vendors[] state (đã load ở mount). */
  const vendorNameById = (vendorID: string): string => {
    return vendors.find((v) => v.id === vendorID)?.name ?? '(đã xóa)';
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Tên sản phẩm',
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'vendor',
      header: 'Nhà cung cấp',
      cell: (p) => <span className="text-gray-700">{vendorNameById(p.vendorID)}</span>,
    },
    {
      key: 'price',
      header: 'Giá',
      className: 'w-32 text-right',
      cell: (p) => <span className="tabular-nums">{formatVND(parseFloat(p.price))}</span>,
    },
    {
      key: 'stockQuantity',
      header: 'Tồn kho',
      className: 'w-24 text-right',
      cell: (p) => <span className="font-medium tabular-nums">{p.stockQuantity}</span>,
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
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44 text-right',
      cell: (p) => formatBackendDate(p.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách sản phẩm trong hệ thống. Bấm vào sản phẩm để xem chi tiết, ảnh và phiên bản.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setPage(1);
              void load();
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
              Tạo sản phẩm
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
        /** Click vào bất kỳ chỗ nào trên row sẽ mở Drawer chi tiết. */
        onRowClick={openDrawer}
        /** Chia đều width cho 7 cột (6 columns + 1 rowActions) — dễ scan theo chiều ngang. */
        equalWidth
        rowActions={(p) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  void openDrawer(p);
                }}
                aria-label={`Sửa ${p.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(p);
                }}
                aria-label={`Xóa ${p.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      {/* Drawer 3 tab: Thông tin / Ảnh / Phiên bản */}
      <ProductDetailDrawer
        key={drawerProduct?.id ?? 'closed'}
        open={drawerOpen}
        product={drawerProduct}
        vendorOptions={vendors}
        categoryOptions={categories}
        onClose={closeDrawer}
        onUpdate={handleDrawerUpdate}
        onToast={(msg, tone) => showToast(msg, tone)}
      />
      {/* Loading overlay ngắn trong khi chờ detail đầu tiên. */}
      {drawerOpen && drawerLoading && !drawerProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="bg-white rounded-lg px-5 py-3 shadow text-sm text-gray-700">
            Đang tải chi tiết...
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Tạo sản phẩm"
        size="2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Tạo mới
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
                className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
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
            <div className="w-full min-h-24 max-h-48 overflow-y-auto px-3 py-2 border border-gray-300 rounded text-sm space-y-1.5">
              {categories.length === 0 ? (
                <p className="text-gray-400">Chưa có danh mục nào.</p>
              ) : (
                categories.map((c) => {
                  const checked = form.categoryIDs.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm({
                            ...form,
                            categoryIDs: checked
                              ? form.categoryIDs.filter((id) => id !== c.id)
                              : [...form.categoryIDs, c.id],
                          })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Đã chọn: <span className="font-medium text-gray-900">{form.categoryIDs.length}</span>
            </p>
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

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import sản phẩm"
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
            Chọn file Excel (.xlsx) chứa danh sách sản phẩm. File cần có các cột:
            <span className="font-medium">
              {' '}
              name, sku, price, stockQuantity, status, vendorName, categoryNames
            </span>
            .
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

export default AdminProductsPage;
