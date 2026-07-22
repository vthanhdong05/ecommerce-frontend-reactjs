import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import productsReducer from './slices/productsSlice';

// Store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export actions and types
export * from './slices/authSlice';
export {
  fetchCategories,
  fetchCategoryOptions,
  fetchCategoriesWithChildren,
  fetchCategoryBySlug,
  setSelectedCategory,
  setPage as setCategoriesPage,
  setItemPerPage as setCategoriesItemPerPage,
  clearError as clearCategoriesError,
} from './slices/categoriesSlice';
export {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  setProducts,
  setSelectedProduct,
  setPage as setProductsPage,
  setItemPerPage as setProductsItemPerPage,
  setFilters,
  clearFilters,
  clearError as clearProductsError,
} from './slices/productsSlice';
