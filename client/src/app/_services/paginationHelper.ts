import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs";

import { PaginatedResults } from "../_models/pagination.model";

export function getPaginationHeaders(pageNumber: number, pageSize: number) {
  let params = new HttpParams();
  params = params.append('pageNumber', pageNumber);
  params = params.append('pageSize', pageSize);

  return params;
}

export function getPaginatedResults<T>(url: string, params: HttpParams, http: HttpClient) {
  const paginatedResults: PaginatedResults<T> = new PaginatedResults<T>;
  return http.get<T>(url, { observe: 'response', params: params }).pipe(
    map(response => {
      if (response.body) {
        paginatedResults.results = response.body;
      }

      const pagination = response.headers.get('Pagination');
      if (pagination) {
        paginatedResults.pagination = JSON.parse(pagination);
      }

      return paginatedResults;
    })
  );
}
