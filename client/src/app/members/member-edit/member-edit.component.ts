import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { User } from 'src/app/_models/user.model';
import { Member } from 'src/app/_models/member.model';
import { Subscription, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm: NgForm | undefined;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    $event.returnValue = this.editForm?.dirty;
  }
  member: Member | undefined;
  user: User | null = null;
  subscriptions: Subscription[] = [];

  constructor(private accountService: AccountService, private memberService: MembersService, private toastr: ToastrService) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe({
        next: user => this.user = user
      });
  }

  ngOnInit(): void {
    if (!this.user) return;

    const subscription = this.memberService.getMember(this.user.userName).subscribe({
      next: member => this.member = member
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  updateProfile() {
    if (!this.member) {
      return;
    }

    const subscription = this.memberService.updateMember(this.member, this.editForm?.value).subscribe({
      next: () => {
        this.toastr.success('Your profile was successfully updated!');
        this.editForm?.reset(this.member);
      }
    });

    this.subscriptions.push(subscription);
  }
}
