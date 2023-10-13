import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Member } from '../_models/member.model';
import { PaginatedResults } from '../_models/pagination.model';
import { Photo } from '../_models/photo.model';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseUrl = environment.apiUrl;
  private members: Member[] = [];
  private membersCache = new Map();
  private user: User | undefined;
  private userParams: UserParams | undefined;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.userParams = new UserParams(user);
          }
        }
      });
  }

  get getUserParams() {
    return this.userParams;
  }

  set setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
    }
  }

  getMembers<T>(userParams: UserParams): Observable<PaginatedResults<T>> {
    const membersCacheKey = this.getMembersCacheKey(userParams);
    const membersCacheValue = this.membersCache.get(membersCacheKey);
    if (membersCacheValue) return of(membersCacheValue);

    return this.getPaginatedResults<T>(this.baseUrl + 'users', userParams);
  }

  getMember(username: string): Observable<Member> {
    const membersCacheValues = [...this.membersCache.values()];
    const members: Member[] = membersCacheValues.reduce((arr, element) => arr.concat(element.results), []);
    const member = members.find(m => m.userName === username);

    return member ? of(member) : this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member, updatedValueMember: Member) {
    return this.http.put(this.baseUrl + 'users/', updatedValueMember).pipe(
      map(() => {
        const index = this.members.findIndex(m => m.id === member.id);
        this.members[index] = { ...this.members[index], ...updatedValueMember };
      })
    );
  }

  setMainPhoto(member: Member, photo: Photo) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      map(() => {
        const index = this.members.findIndex(m => m.id === member.id);
        this.members[index].photoUrl = photo.url;
      })
    );
  }

  deletePhoto(member: Member, photo: Photo) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      map(() => {
        const index = this.members.findIndex(m => m.id === member.id);
        const photoIndex = this.members[index].photos.findIndex(p => p.id === photo.id);
        this.members[index].photos.splice(photoIndex, 1);
      })
    );
  }

  private getMembersCacheKey(userParams: UserParams): string {
    return Object.values(userParams).join('-');
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);

    return params;
  }

  private getPaginatedResults<T>(url: string, userParams: UserParams) {
    const paginatedResults: PaginatedResults<T> = new PaginatedResults<T>;

    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return this.http.get<T>(url, { observe: 'response', params: params }).pipe(
      map(response => {
        if (response.body) {
          paginatedResults.results = response.body;
        }

        const pagination = response.headers.get('Pagination');
        if (pagination) {
          paginatedResults.pagination = JSON.parse(pagination);
        }

        this.membersCache.set(this.getMembersCacheKey(userParams), paginatedResults);

        return paginatedResults;
      })
    );
  }
}
