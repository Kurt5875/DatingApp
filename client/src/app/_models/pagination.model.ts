export interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export class PaginatedResults<T> {
  results?: T;
  pagination?: Pagination;
}
