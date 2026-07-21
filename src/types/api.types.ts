// Standard API Response
export interface ApiResponse<T = unknown> {
  errors: string[] | null;
  data: T | null;
  message: string | null;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    itemPerPage: number;
    pageCount: number;
    totalCount: number;
  };
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
}

// Request config
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}
