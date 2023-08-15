import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Member } from '../_models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseUrl = environment.apiUrl;
  private members: Member[] = [];

  constructor(private http: HttpClient) { }

  get copyOfMembers() {
    return this.members.map(member => ({ ...member }));
  }

  getMembers(): Observable<Member[]> {
    if (this.members.length > 0) {
      return of(this.copyOfMembers);
    }

    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map(members => this.members = members)
    );
  }

  getMember(username: string) {
    const member = this.copyOfMembers.find(m => m.userName === username);
    if (member) {
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(memberId: number, updatedValueMember: Member) {
    return this.http.put(this.baseUrl + 'users/', updatedValueMember).pipe(
      map(() => {
        const index = this.members.findIndex(m => m.id === memberId);
        this.members[index] = { ...this.members[index], ...updatedValueMember };
      })
    );
  }
}
