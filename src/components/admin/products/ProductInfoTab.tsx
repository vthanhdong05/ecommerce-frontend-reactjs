import { useEffect, useState } from 'react';
import { FormField } from '../../ui/FormField';
import { Button } from '../../ui/Button';
import type { ProductDetail, ProductStatusType } from '../../../types/product.types';
import type { UpdateProductRequest } from '../../../api/admin/products.api';
import type { VendorOption } from '../../../types/admin.types';
import type { CategoryOption } from '../../../types/category.types';

interface ProductInfoTabProps {
  product: ProductDetail;
  vendors: VendorOption[];
  categories: CategoryOption[];
  isSubmitting?: boolean;
  onSubmit: (data: UpdateProductRequest) => Promise<void>;
  onToast: (msg: string, tone: 'success' | 'error') => void;
}

interface FormState {
  name: string;
  description: string;
  sku: string;
  price: string;
  stockQuantity: string;
  status: ProductStatusType;
  categoryIDs: string[];
}

function toFormState(p: ProductDetail): FormState {
  return {
    name: p.name,
    description: p.description ?? '',
    sku: p.sku ?? '',
    price: p.price,
    stockQuantity: String(p.stockQuantity),
    status: p.status,
    categoryIDs: p.productCategories?.map((pc) => pc.categoryID) ?? [],
  };
}

export function ProductInfoTab({
  product,
  vendors,
  categories,
  isSubmitting = false,
  onSubmit,
  onToast,
}: ProductInfoTabProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(product));

  // Reset form khi product đổi (drawer mở row khác).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-seed local form state when parent product changes
    setForm(toFormState(product));
  }, [product.id, product.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      onToast('Vui lòng nhập tên sản phẩm.', 'error');
      return;
    }
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      onToast('Giá không hợp lệ.', 'error');
      return;
    }
    const stock = Number(form.stockQuantity);
    if (Number.isNaN(stock) || stock < 0) {
      onToast('Số lượng tồn kho không hợp lệ.', 'error');
      return;
    }
    try {
      await onSubmit({
        name: form.name,
        description: form.description || undefined,
        sku: form.sku || undefined,
        price,
        stockQuantity: stock,
        status: form.status,
        categoryIDs: form.categoryIDs,
      });
      onToast('Cập nhật sản phẩm thành công.', 'success');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="p-5 space-y-4">
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
        <FormField label="Nhà cung cấp">
          <input
            type="text"
            value={vendors.find((v) => v.id === product.vendorID)?.name ?? '(đã xóa)'}
            disabled
            className="w-full h-10 px-3 border border-gray-300 rounded text-sm bg-gray-100 text-gray-600"
          />
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
        <div className="w-full min-h-24 max-h-48 overflow-y-auto px-3 py-2 border border-gray-300 rounded text-sm space-y-1">
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

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button onClick={handleSubmit} isLoading={isSubmitting}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

export default ProductInfoTab;
