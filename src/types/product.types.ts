// Product status enum
export type ProductStatusType = 'active' | 'inactive' | 'draft';

export interface Product {
  id: string;
  vendorID: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: string; // Prisma Decimal returns as string
  stockQuantity: number;
  status: ProductStatusType;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
  productImages?: ProductImage[];
  productCategories?: ProductCategory[];
}

export interface ProductVariant {
  id: string;
  productID: string;
  name: string | null;
  sku: string | null;
  price: string; // Prisma Decimal returns as string
  stockQuantity: number;
  attributes: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
  productImages?: ProductImage[];
}

export interface ProductImage {
  id: string;
  name: string;
  description: string | null;
  productID: string | null;
  productVariantID: string | null;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProductCategory {
  productID: string;
  categoryID: string;
}

// Product with full details (for detail page)
export interface ProductDetail extends Product {
  productImages: ProductImage[];
  productCategories: ProductCategory[];
  productVariants?: ProductVariant[];
  vendor?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}
