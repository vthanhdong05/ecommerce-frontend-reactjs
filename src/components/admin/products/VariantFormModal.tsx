import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { FormField } from '../../ui/FormField';
import { Button } from '../../ui/Button';
import type { ProductVariant } from '../../../types/product.types';
import type {
  CreateVariantRequest,
  UpdateVariantRequest,
} from '../../../api/admin/product-variants.api';

interface VariantFormModalProps {
  open: boolean;
  variant?: ProductVariant | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVariantRequest | UpdateVariantRequest) => Promise<void>;
}

interface FormState {
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  /** Raw JSON string cho attributes. */
  attributesRaw: string;
}

const EMPTY: FormState = {
  name: '',
  sku: '',
  price: '',
  stockQuantity: '0',
  attributesRaw: '',
};

/**
 * Parse attributes JSON an toàn. Trả về null nếu rỗng hoặc invalid.
 * Backend chấp nhận Record<string, unknown>.
 */
function parseAttributes(raw: string): Record<string, unknown> | null | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return '__INVALID__'; // sentinel for non-object
  } catch {
    return '__INVALID__';
  }
}

function toFormState(v?: ProductVariant | null): FormState {
  if (!v) return EMPTY;
  return {
    name: v.name ?? '',
    sku: v.sku ?? '',
    price: v.price ?? '',
    stockQuantity: String(v.stockQuantity),
    attributesRaw: v.attributes ? JSON.stringify(v.attributes, null, 2) : '',
  };
}

export function VariantFormModal({
  open,
  variant,
  isSubmitting = false,
  onClose,
  onSubmit,
}: VariantFormModalProps) {
  const [form, setForm] = useState<FormState>(toFormState(variant));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!form.price || Number.isNaN(Number(form.price))) {
      setError('Giá không hợp lệ.');
      return;
    }
    const price = Number(form.price);
    if (price <= 0) {
      setError('Giá phải lớn hơn 0 (theo backend schema).');
      return;
    }
    const stock = Number(form.stockQuantity);
    if (Number.isNaN(stock) || stock < 0) {
      setError('Số lượng tồn kho không hợp lệ.');
      return;
    }
    const attrs = parseAttributes(form.attributesRaw);
    if (attrs === '__INVALID__') {
      setError('Attributes phải là JSON object hợp lệ. Ví dụ: {"color":"red","size":"M"}');
      return;
    }

    const payload: CreateVariantRequest = {
      name: form.name.trim() || null,
      sku: form.sku.trim() || null,
      price,
      stockQuantity: stock,
      ...(attrs !== undefined && { attributes: attrs }),
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={variant ? 'Chỉnh sửa phiên bản' : 'Thêm phiên bản'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {variant ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tên phiên bản">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Đỏ / Size M"
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="SKU">
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="VD: AT-R-M"
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Giá (VND)" required>
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Tồn kho">
            <input
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </FormField>
        </div>
        <FormField
          label="Attributes (JSON)"
          hint='Để trống nếu không có. Ví dụ: {"color":"red","size":"M"}'
        >
          <textarea
            value={form.attributesRaw}
            onChange={(e) => setForm({ ...form, attributesRaw: e.target.value })}
            rows={3}
            placeholder='{"color":"red","size":"M"}'
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-primary"
          />
        </FormField>
      </div>
    </Modal>
  );
}

export default VariantFormModal;
