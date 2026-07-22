import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  type GetProductsParams,
} from '../../api/products.api';
import type { Product, ProductDetail } from '../../types/product.types';

interface ProductsState {
  items: Product[];
  featuredProducts: Product[];
  selectedProduct: ProductDetail | null;
  relatedProducts: Product[];
  pagination: {
    page: number;
    itemPerPage: number;
    pageCount: number;
    totalCount: number;
  };
  filters: {
    search: string;
    categoryID: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    sortBy: 'createdAt' | 'price' | 'name';
    sortOrder: 'asc' | 'desc';
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  featuredProducts: [],
  selectedProduct: null,
  relatedProducts: [],
  pagination: {
    page: 1,
    itemPerPage: 12,
    pageCount: 0,
    totalCount: 0,
  },
  filters: {
    search: '',
    categoryID: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: GetProductsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await getProducts(params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy danh sách sản phẩm');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (itemPerPage: number = 12, { rejectWithValue }) => {
    try {
      const response = await getFeaturedProducts(itemPerPage);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy sản phẩm nổi bật');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await getProductBySlug(slug);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy thông tin sản phẩm');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async (
    {
      productId,
      categoryID,
      itemPerPage = 6,
    }: { productId: string; categoryID: string; itemPerPage?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRelatedProducts(productId, categoryID, itemPerPage);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy sản phẩm liên quan');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<ProductDetail | null>) => {
      state.selectedProduct = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setItemPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemPerPage = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset page when filters change
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.meta.page,
          itemPerPage: action.payload.meta.itemPerPage,
          pageCount: action.payload.meta.pageCount,
          totalCount: action.payload.meta.totalCount,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchFeaturedProducts
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchProductBySlug
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchRelatedProducts
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProducts,
  setSelectedProduct,
  setPage,
  setItemPerPage,
  setFilters,
  clearFilters,
  clearError,
} = productsSlice.actions;
export default productsSlice.reducer;
