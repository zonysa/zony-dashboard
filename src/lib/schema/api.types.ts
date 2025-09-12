export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface FilterParams {
  filters: Record<string, string>;
}

export interface SearchParams {
  search?: string;
}

export type QueryParams = PaginationParams &
  SortParams &
  FilterParams &
  SearchParams;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
