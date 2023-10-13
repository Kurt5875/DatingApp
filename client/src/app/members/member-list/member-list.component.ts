import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { AccountService } from 'src/app/_services/account.service';
import { Member } from 'src/app/_models/member.model';
import { MembersService } from 'src/app/_services/members.service';
import { PaginatedResults, Pagination } from 'src/app/_models/pagination.model';
import { User } from 'src/app/_models/user.model';
import { UserParams } from 'src/app/_models/userParams';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  pagination: Pagination | undefined;
  genderList = [{ value: 'male', display: 'Males' }, { value: 'female', display: 'Females' }];
  userParams: UserParams | undefined;
  activePage: number = 1;

  constructor(private membersService: MembersService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.userParams = this.membersService.getUserParams;
    if (!this.userParams) return;

    this.membersService.getMembers<Member[]>(this.userParams).subscribe({
      next: (response: PaginatedResults<Member[]>) => {
        if (response.results && response.pagination) {
          this.members = response.results;
          this.pagination = response.pagination;
          this.activePage = this.userParams ? this.userParams.pageNumber : 1;
        }
      }
    });
  }

  pageChanged(event: { itemsPerPage: number, page: number }) {
    const pageNumber = event.page;

    if (this.userParams && this.userParams.pageNumber !== pageNumber) {
      this.userParams.pageNumber = pageNumber;
      this.userParams.pageSize = event.itemsPerPage;
      this.membersService.setUserParams = this.userParams;

      this.loadMembers();
    }
  }

  resetFilters() {
    this.membersService.resetUserParams();
    this.loadMembers();
  }
}
