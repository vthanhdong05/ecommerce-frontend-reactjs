import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { Product } from '../../types/product.types';
import { formatVND } from '../../utils/formatCurrency';

// Skeleton loading placeholder
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-2 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

// Empty state placeholder
function ProductEmpty() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-200" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

interface FeaturedProductsProps {
  itemPerPage?: number;
}

export function FeaturedProducts({ itemPerPage = 6 }: FeaturedProductsProps) {
  const dispatch = useAppDispatch();
  const { featuredProducts, isLoading, error } = useAppSelector((state) => state.products);
  const hasFetched = useRef(false);

  // Ensure featuredProducts is always an array
  const products = Array.isArray(featuredProducts) ? featuredProducts : [];

  // Fetch featured products on mount (only once, prevent double-fetch in StrictMode)
  useEffect(() => {
    if (!hasFetched.current && products.length === 0) {
      hasFetched.current = true;
      dispatch(fetchFeaturedProducts(itemPerPage));
    }
  }, [dispatch, itemPerPage, products.length]);

  // Get thumbnail from productImages
  const getThumbnail = (product: Product): string => {
    if (product.productImages && product.productImages.length > 0) {
      return product.productImages[0].imageUrl;
    }
    return '';
  };

  // Show skeleton while loading OR when no data yet
  const showSkeleton = isLoading || (products.length === 0 && !error);
  const showEmpty = !isLoading && products.length === 0 && error;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Sản phẩm bán chạy</h2>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">
              Hot
            </span>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-70">
          {showSkeleton
            ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
            : showEmpty
              ? Array.from({ length: 6 }).map((_, index) => <ProductEmpty key={index} />)
              : products.map((product: Product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group bg-white rounded-lg border border-gray-100 hover:border-primary hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {getThumbnail(product) ? (
                        <img
                          src={getThumbnail(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-4xl font-bold">{product.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2">
                      {/* Product Name */}
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-primary">
                          {formatVND(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
