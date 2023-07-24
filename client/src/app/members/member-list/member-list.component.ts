import { Component, OnInit } from '@angular/core';
import { Member } from 'src/app/_models/member.model';

import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];

  ngOnInit(): void {
    this.getMembers();
  }

  constructor(private membersService: MembersService) { }

  getMembers() {
    this.membersService.getMembers().subscribe({
      next: members => this.members = members
    });
  }
}
