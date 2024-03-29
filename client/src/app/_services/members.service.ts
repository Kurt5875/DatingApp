import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, take, tap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Member } from '../_models/member.model';
import { PaginatedResults } from '../_models/pagination.model';
import { Photo } from '../_models/photo.model';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user.model';
import { getPaginatedResults, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseUrl = environment.apiUrl;
  private members: Member[] = [];
  private cache = new Map();
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
    const paramsKey = 'members';

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    const membersCacheValue = this.cache.get(this.getCacheKey(paramsKey, params));
    if (membersCacheValue) return of(membersCacheValue);

    return getPaginatedResults<T>(this.baseUrl + 'users', params, this.http).pipe(
      tap(response => {
        this.cache.set(this.getCacheKey(paramsKey, params), response);
      }));
  }

  getMember(username: string): Observable<Member> {
    const membersCacheValues = [...this.cache.values()];
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

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    const paramsKey = 'likes';

    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);

    // const likesCacheValue = this.cache.get(this.getCacheKey(paramsKey, params));
    // if (likesCacheValue) return of(likesCacheValue);

    return getPaginatedResults<Member[]>(this.baseUrl + 'likes', params, this.http).pipe(
      tap(response => {
        // this.cache.set(this.getCacheKey(paramsKey, params), response);
      }));
  }

  private getCacheKey(paramsKey: string, params: HttpParams): string {
    const paramsValue = params.keys().map(x => params.get(x));
    paramsValue.unshift(paramsKey);

    return paramsValue.join('-');
  }
}
