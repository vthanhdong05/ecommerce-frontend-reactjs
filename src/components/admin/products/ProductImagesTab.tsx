import { useState } from 'react';
import { ImageIcon, Pencil, Save, Trash2, X } from 'lucide-react';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ImageUploader } from './ImageUploader';
import type { ProductImage } from '../../../types/product.types';
import {
  deleteProductImage,
  updateProductImage,
  uploadProductImage,
} from '../../../api/admin/product-images.api';

interface ProductImagesTabProps {
  vendorID: string;
  productID: string;
  images: ProductImage[];
  isLoading: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onToast: (msg: string, tone: 'success' | 'error') => void;
  onChanged: () => void;
}

/**
 * Grid ảnh + uploader. Mỗi card có:
 * - Preview, tên (input), description (input), sortOrder (input number), nút Lưu/Xóa.
 * Sort mặc định theo sortOrder asc, id desc.
 */
export function ProductImagesTab({
  vendorID,
  productID,
  images,
  isLoading,
  canCreate,
  canUpdate,
  canDelete,
  onToast,
  onChanged,
}: ProductImagesTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSort, setEditSort] = useState('0');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedImages = [...images].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return b.id.localeCompare(a.id);
  });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadProductImage(vendorID, productID, file);
      onToast('Upload ảnh thành công.', 'success');
      onChanged();
    } finally {
      setIsUploading(false);
    }
  };

  const startEdit = (img: ProductImage) => {
    setEditingID(img.id);
    setEditName(img.name);
    setEditDesc(img.description ?? '');
    setEditSort(String(img.sortOrder));
  };

  const cancelEdit = () => {
    setEditingID(null);
  };

  const saveEdit = async () => {
    if (!editingID) return;
    setIsSavingEdit(true);
    try {
      await updateProductImage(vendorID, productID, editingID, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        sortOrder: Number(editSort) || 0,
      });
      onToast('Đã lưu thông tin ảnh.', 'success');
      setEditingID(null);
      onChanged();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Lưu thất bại', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductImage(vendorID, productID, confirmDelete.id);
      onToast('Đã xóa ảnh.', 'success');
      setConfirmDelete(null);
      onChanged();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Xóa thất bại', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" label="Đang tải ảnh..." />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {canCreate && (
        <ImageUploader onUpload={handleUpload} isUploading={isUploading} disabled={!canCreate} />
      )}

      {sortedImages.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          Sản phẩm này chưa có ảnh nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedImages.map((img) => {
            const isEditing = editingID === img.id;
            return (
              <div
                key={img.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                <div className="aspect-video bg-gray-50 overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 space-y-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên ảnh"
                        className="w-full h-9 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Mô tả"
                        className="w-full h-9 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 shrink-0">Thứ tự:</label>
                        <input
                          type="number"
                          min="0"
                          value={editSort}
                          onChange={(e) => setEditSort(e.target.value)}
                          className="w-20 h-9 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                          onClick={saveEdit}
                          isLoading={isSavingEdit}
                          disabled={!canUpdate}
                        >
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<X className="w-3.5 h-3.5" />}
                          onClick={cancelEdit}
                        >
                          Hủy
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate">{img.name}</p>
                        {img.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{img.description}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Thứ tự: <span className="text-gray-700">{img.sortOrder}</span>
                      </p>
                      <div className="flex items-center gap-1 pt-1">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Pencil className="w-3.5 h-3.5" />}
                            onClick={() => startEdit(img)}
                            aria-label={`Sửa ${img.name}`}
                          >
                            Sửa
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                            onClick={() => setConfirmDelete(img)}
                            aria-label={`Xóa ${img.name}`}
                          >
                            <span className="text-red-500">Xóa</span>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa ảnh"
        message={`Bạn có chắc muốn xóa ảnh "${confirmDelete?.name}"? Hành động này không thể hoàn tác.`}
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default ProductImagesTab;
