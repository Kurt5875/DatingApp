import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';

import { AccountService } from '../_services/account.service';
import { User } from '../_models/user.model';

@Directive({
  selector: '[appHasRole]' // example use : *appHasRole="['Admin', 'Moderator', 'Member']"
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[] = [];
  user: User = {} as User;

  constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>,
    private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) this.user = user;
    });
  }

  ngOnInit(): void {
    if (this.user.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
    else {
      this.viewContainerRef.clear();
    }
  }
}
