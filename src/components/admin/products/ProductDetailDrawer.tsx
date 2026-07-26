import { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, Info, Layers } from 'lucide-react';
import { Drawer } from '../../ui/Drawer';
import { Spinner } from '../../ui/Spinner';
import { StatusBadge } from '../StatusBadge';
import type { ProductDetail, ProductImage, ProductVariant } from '../../../types/product.types';
import { getProductImages } from '../../../api/admin/product-images.api';
import { getProductVariants } from '../../../api/admin/product-variants.api';
import type { UpdateProductRequest } from '../../../api/admin/products.api';
import type { CategoryOption } from '../../../types/category.types';
import type { VendorOption } from '../../../types/admin.types';
import { ProductInfoTab } from './ProductInfoTab';
import { ProductImagesTab } from './ProductImagesTab';
import { ProductVariantsTab } from './ProductVariantsTab';
import { usePermission } from '../../../hooks/usePermission';
import { PERM, ROUTES } from '../../../utils/buildPermissionKey';

type TabKey = 'info' | 'images' | 'variants';

interface ProductDetailDrawerProps {
  open: boolean;
  product: ProductDetail | null;
  vendorOptions: VendorOption[];
  categoryOptions: CategoryOption[];
  onClose: () => void;
  /** Submit update cho tab Info. Throw nếu lỗi. */
  onUpdate: (id: string, data: UpdateProductRequest) => Promise<ProductDetail>;
  onToast: (msg: string, tone: 'success' | 'error') => void;
}

export function ProductDetailDrawer({
  open,
  product,
  vendorOptions,
  categoryOptions,
  onClose,
  onUpdate,
  onToast,
}: ProductDetailDrawerProps) {
  const [tab, setTab] = useState<TabKey>('info');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const canUpdateProduct = usePermission(PERM.update(ROUTES.productDetail));
  const canCreateImages = usePermission(PERM.create(ROUTES.productImages));
  const canUpdateImages = usePermission(PERM.update(ROUTES.productImageDetail));
  const canDeleteImages = usePermission(PERM.delete(ROUTES.productImageDetail));
  const canCreateVariants = usePermission(PERM.create(ROUTES.productVariants));
  const canUpdateVariants = usePermission(PERM.update(ROUTES.productVariantDetail));
  const canDeleteVariants = usePermission(PERM.delete(ROUTES.productVariantDetail));

  const refreshImages = useCallback(async () => {
    if (!product) return;
    setLoadingImages(true);
    try {
      const list = await getProductImages(product.vendorID, product.id);
      setImages(list);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Lỗi tải ảnh', 'error');
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, [product, onToast]);

  const refreshVariants = useCallback(async () => {
    if (!product) return;
    setLoadingVariants(true);
    try {
      // Phase 1: lấy page lớn để render trong tab, không cần pagination.
      const res = await getProductVariants(product.vendorID, product.id, {
        page: 1,
        itemPerPage: 100,
      });
      setVariants(res.items ?? []);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Lỗi tải phiên bản', 'error');
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  }, [product, onToast]);

  // Fire parallel load khi product đổi. Parent truyền `key={product.id}` nên component
  // remount khi switch product → state (tab/images/variants) tự reset, không cần setState ở effect.
  useEffect(() => {
    if (!open || !product) return;
    // refreshImages/refreshVariants setState khi data về — đó là "subscribe for updates from
    // external system" (network response), không phải cascade render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([refreshImages(), refreshVariants()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  if (!product) return null;

  // Initial loading = cả images & variants chưa load xong lần đầu (chưa có data).
  const initialLoading =
    loadingImages && loadingVariants && images.length === 0 && variants.length === 0;

  const tabs: { key: TabKey; label: string; icon: typeof Info; count?: number }[] = [
    { key: 'info', label: 'Thông tin', icon: Info },
    { key: 'images', label: 'Ảnh', icon: ImageIcon, count: images.length },
    { key: 'variants', label: 'Phiên bản', icon: Layers, count: variants.length },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={product.name}
      titleExtra={
        <StatusBadge
          tone={product.status === 'active' ? 'green' : product.status === 'draft' ? 'gray' : 'red'}
          label={product.status}
        />
      }
    >
      {/* Tab strip */}
      <div className="border-b border-gray-100 px-5 flex items-center gap-1 sticky top-0 bg-white z-10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {typeof t.count === 'number' && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    active ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" label="Đang tải chi tiết..." />
        </div>
      ) : tab === 'info' ? (
        <ProductInfoTab
          product={product}
          vendors={vendorOptions}
          categories={categoryOptions}
          onSubmit={async (data) => {
            await onUpdate(product.id, data);
          }}
          onToast={onToast}
        />
      ) : tab === 'images' ? (
        <ProductImagesTab
          vendorID={product.vendorID}
          productID={product.id}
          images={images}
          isLoading={loadingImages}
          canCreate={canCreateImages}
          canUpdate={canUpdateImages}
          canDelete={canDeleteImages}
          onToast={onToast}
          onChanged={refreshImages}
        />
      ) : (
        <ProductVariantsTab
          vendorID={product.vendorID}
          productID={product.id}
          variants={variants}
          isLoading={loadingVariants}
          canCreate={canCreateVariants}
          canUpdate={canUpdateVariants}
          canDelete={canDeleteVariants}
          onToast={onToast}
          onChanged={refreshVariants}
        />
      )}

      {/* Hidden label để giữ TS happy nếu canUpdateProduct không dùng trực tiếp ở đây */}
      <span className="hidden" aria-hidden>
        {canUpdateProduct ? 'updatable' : 'readonly'}
      </span>
    </Drawer>
  );
}

export default ProductDetailDrawer;
