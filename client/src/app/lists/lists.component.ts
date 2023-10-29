import { Component, OnInit } from '@angular/core';

import { LikeParams } from '../_models/likeParams.model';
import { Member } from '../_models/member.model';
import { MembersService } from '../_services/members.service';
import { Pagination } from '../_models/pagination.model';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  predicate = 'liked';
  members: Member[] | undefined;
  pagination: Pagination | undefined;
  likeParams = new LikeParams();

  constructor(private membersService: MembersService) { }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this.membersService.getLikes(this.predicate, this.likeParams.pageNumber, this.likeParams.pageSize)
      .subscribe({
        next: (response) => {
          this.members = response.results;
          this.pagination = response.pagination;
        }
      });
  }

  pageChanged(event: { itemsPerPage: number, page: number }) {
    const pageNumber = event.page;

    if (this.likeParams.pageNumber !== pageNumber) {
      this.likeParams.pageNumber = pageNumber;
      this.likeParams.pageSize = event.itemsPerPage;

      this.loadLikes();
    }
  }
}
