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

/**
 * Summary counts the backend attaches to every dashboard list response
 * (`app/core/services/stats.py`), shown as the stat cards above each table.
 *
 * Computed over everything the caller's role may see, BEFORE the table's own
 * search/status filters — so the cards describe the collection and don't
 * shrink as the user filters. `by_status` keys are lower-cased.
 */
export interface ListStats {
  total: number;
  new_this_month: number;
  by_status?: Record<string, number>;
  /** Leads only: "store" | "partner". */
  by_source_tab?: Record<string, number>;
  /** Parcel feed only: rows per flow ("pudo" | "warehouse"). */
  by_flow?: Record<string, number>;
  /** Parcel feed only. */
  created_today?: number;
}
