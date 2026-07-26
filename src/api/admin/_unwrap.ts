import type { ApiResponse, PaginatedResponse } from '../../types/api.types';

/**
 * Backend list endpoints return this envelope:
 *   { errors, data: { list, totalPages, totalItems }, message }
 *
 * Frontend admin pages consume `PaginatedResponse<T>` = { items, meta: { page, itemPerPage, pageCount, totalCount } }.
 * This adapter unwraps the envelope and maps the field names so pages stay clean.
 */
export interface BackendListEnvelope<T> {
  list: T[];
  totalPages: number;
  totalItems: number;
}

export function unwrapList<T>(
  envelope: ApiResponse<BackendListEnvelope<T>> | null | undefined,
  fallbackPage: number,
  fallbackItemPerPage: number
): PaginatedResponse<T> {
  const inner = envelope?.data;
  const list = inner?.list ?? [];
  const totalItems = inner?.totalItems ?? 0;
  const totalPages =
    inner?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, fallbackItemPerPage)));
  return {
    items: list,
    meta: {
      page: fallbackPage,
      itemPerPage: fallbackItemPerPage,
      pageCount: totalPages,
      totalCount: totalItems,
    },
  };
}
