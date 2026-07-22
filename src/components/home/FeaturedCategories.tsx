import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

// Skeleton loading placeholder
function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100">
      <div className="w-14 h-14 rounded-full bg-gray-200 mb-3 animate-pulse" />
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

// Empty state placeholder
function CategoryEmpty() {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="w-14 h-14 rounded-full bg-gray-200 mb-3" />
      <div className="w-20 h-3 bg-gray-200 rounded" />
    </div>
  );
}

export function FeaturedCategories() {
  const { categoriesWithChildren, isLoading, error } = useAppSelector((state) => state.categories);

  // Filter only parent categories (parentID is null) and take first 8
  const parentCategories = Array.isArray(categoriesWithChildren)
    ? categoriesWithChildren.filter((cat) => cat.parentID === null).slice(0, 8)
    : [];

  // Show skeleton while loading OR when no data yet
  const showSkeleton = isLoading || (parentCategories.length === 0 && !error);
  const showEmpty = !isLoading && parentCategories.length === 0 && error;

  return (
    <section className="py-5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Danh mục nổi bật</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 min-h-35">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, index) => <CategorySkeleton key={index} />)
            : showEmpty
              ? Array.from({ length: 8 }).map((_, index) => <CategoryEmpty key={index} />)
              : parentCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="group flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    {/* Category Icon/Image Placeholder */}
                    <div className="w-14 h-14 rounded-full bg-gray-50 group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-3 overflow-hidden">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-300 group-hover:text-primary transition-colors">
                          {category.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {/* Category Name */}
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors text-center line-clamp-2">
                      {category.name}
                    </span>
                  </Link>
                ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;
