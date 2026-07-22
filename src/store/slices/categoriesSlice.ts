import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, CategoryOption, CategoryWithChildren } from '../../types/category.types';
import {
  getCategories,
  getCategoriesWithChildren,
  getCategoryBySlug,
  getCategoryOptions,
  type GetCategoriesParams,
} from '../../api/categories.api';

interface CategoriesState {
  items: Category[];
  selectedCategory: Category | null;
  categoryOptions: CategoryOption[];
  categoriesWithChildren: CategoryWithChildren[];
  pagination: {
    page: number;
    itemPerPage: number;
    pageCount: number;
    totalCount: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  selectedCategory: null,
  categoryOptions: [],
  categoriesWithChildren: [],
  pagination: {
    page: 1,
    itemPerPage: 12,
    pageCount: 0,
    totalCount: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params: GetCategoriesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await getCategories(params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy danh sách danh mục');
    }
  }
);

export const fetchCategoryOptions = createAsyncThunk(
  'categories/fetchCategoryOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoryOptions();
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy options danh mục');
    }
  }
);

export const fetchCategoriesWithChildren = createAsyncThunk(
  'categories/fetchCategoriesWithChildren',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoriesWithChildren();
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy danh mục với children');
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'categories/fetchCategoryBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await getCategoryBySlug(slug);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Không thể lấy thông tin danh mục');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setItemPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemPerPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCategories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.meta.page,
          itemPerPage: action.payload.meta.itemPerPage,
          pageCount: action.payload.meta.pageCount,
          totalCount: action.payload.meta.totalCount,
        };
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCategoryOptions
    builder
      .addCase(fetchCategoryOptions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoryOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryOptions = action.payload;
      })
      .addCase(fetchCategoryOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCategoriesWithChildren
    builder
      .addCase(fetchCategoriesWithChildren.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoriesWithChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesWithChildren = action.payload;
      })
      .addCase(fetchCategoriesWithChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCategoryBySlug
    builder
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, setPage, setItemPerPage, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
