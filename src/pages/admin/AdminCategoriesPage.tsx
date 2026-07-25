import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import type { Category } from '../../types/category.types';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
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

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const canCreate = usePermission(PERM.create(ROUTES.categories));
  const canUpdate = usePermission(PERM.update(ROUTES.categoryDetail));
  const canDelete = usePermission(PERM.delete(ROUTES.categoryDetail));

  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCategories({ page: 1, itemPerPage: 500 });
      setData(res.items ?? []);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    void load();
  }, []);

  // Build tree
  const tree = useMemo(() => {
    type CategoryNode = Category & { children: CategoryNode[] };
    const map = new Map<string, CategoryNode>();
    data.forEach((c) => map.set(c.id, { ...c, children: [] } as CategoryNode));
    const roots: CategoryNode[] = [];
    map.forEach((node) => {
      const pid = node.parentID;
      if (pid && map.has(pid)) {
        map.get(pid)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [data]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = (parentID: string | null = null) => {
    setForm({ ...EMPTY_FORM, parentID });
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
      await deleteCategory(confirmDelete.id);
      showToast('Đã xóa danh mục.', 'success');
      setConfirmDelete(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderNode = (node: Category & { children: Category[] }, depth: number) => {
    const isOpen = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    return (
      <div key={node.id}>
        <div
          className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggle(node.id)}
                className="p-0.5 text-gray-500"
                aria-label={isOpen ? 'Thu gọn' : 'Mở rộng'}
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-4 h-4 inline-block" />
            )}
            <span className="font-medium truncate">{node.name}</span>
            {node.description && (
              <span className="text-xs text-gray-500 truncate">— {node.description}</span>
            )}
          </div>
          <div className="inline-flex items-center gap-1 shrink-0">
            {canCreate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openCreate(node.id)}
                aria-label="Thêm danh mục con"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            {canUpdate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(node)}
                aria-label={`Sửa ${node.name}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(node)}
                aria-label={`Xóa ${node.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
        {isOpen &&
          hasChildren &&
          node.children.map((c) => renderNode(c as Category & { children: Category[] }, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">Cây danh mục sản phẩm.</p>
        </div>
        {canCreate && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openCreate(null)}>
            Tạo danh mục gốc
          </Button>
        )}
      </div>

      <Card noPadding>
        {isLoading ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">Đang tải…</div>
        ) : tree.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">Chưa có danh mục nào.</div>
        ) : (
          <div className="divide-y divide-gray-100">{tree.map((root) => renderNode(root, 0))}</div>
        )}
      </Card>

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
              {data
                .filter((c) => c.id !== form.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
