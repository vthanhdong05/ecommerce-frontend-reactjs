import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../ui/DataTable';
import { VariantFormModal } from './VariantFormModal';
import type { ProductVariant } from '../../../types/product.types';
import {
  createProductVariant,
  deleteProductVariant,
  updateProductVariant,
  type CreateVariantRequest,
  type UpdateVariantRequest,
} from '../../../api/admin/product-variants.api';
import { formatVND } from '../../../utils/formatCurrency';

interface ProductVariantsTabProps {
  vendorID: string;
  productID: string;
  variants: ProductVariant[];
  isLoading: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onToast: (msg: string, tone: 'success' | 'error') => void;
  onChanged: () => void;
}

export function ProductVariantsTab({
  vendorID,
  productID,
  variants,
  isLoading,
  canCreate,
  canUpdate,
  canDelete,
  onToast,
  onChanged,
}: ProductVariantsTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: CreateVariantRequest | UpdateVariantRequest) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateProductVariant(vendorID, productID, editing.id, data as UpdateVariantRequest);
        onToast('Đã cập nhật phiên bản.', 'success');
      } else {
        await createProductVariant(vendorID, productID, data as CreateVariantRequest);
        onToast('Đã tạo phiên bản mới.', 'success');
      }
      setFormOpen(false);
      setEditing(null);
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductVariant(vendorID, productID, confirmDelete.id);
      onToast('Đã xóa phiên bản.', 'success');
      setConfirmDelete(null);
      onChanged();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Xóa thất bại', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<ProductVariant>[] = [
    {
      key: 'sku',
      header: 'SKU',
      className: 'w-32',
      cell: (v) => v.sku ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'name',
      header: 'Tên',
      cell: (v) => v.name ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'price',
      header: 'Giá',
      className: 'w-32',
      cell: (v) => formatVND(parseFloat(v.price)),
    },
    {
      key: 'stockQuantity',
      header: 'Tồn kho',
      className: 'w-20 text-right',
      cell: (v) => <span className="font-medium">{v.stockQuantity}</span>,
    },
    {
      key: 'attributes',
      header: 'Attributes',
      cell: (v) =>
        v.attributes ? (
          <code className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded max-w-xs truncate inline-block align-middle">
            {JSON.stringify(v.attributes)}
          </code>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" label="Đang tải phiên bản..." />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Thêm phiên bản
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={variants}
        rowKey={(v) => v.id}
        emptyTitle="Chưa có phiên bản nào"
        emptyDescription="Bấm 'Thêm phiên bản' để tạo phiên bản đầu tiên cho sản phẩm này."
        rowActions={(v) => (
          <>
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(v);
                  setFormOpen(true);
                }}
                aria-label={`Sửa ${v.name ?? v.sku ?? v.id}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(v)}
                aria-label={`Xóa ${v.name ?? v.sku ?? v.id}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      <VariantFormModal
        key={editing?.id ?? 'new'}
        open={formOpen}
        variant={editing}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (isSubmitting) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa phiên bản"
        message={`Bạn có chắc muốn xóa phiên bản "${confirmDelete?.name ?? confirmDelete?.sku ?? 'này'}"?`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default ProductVariantsTab;
