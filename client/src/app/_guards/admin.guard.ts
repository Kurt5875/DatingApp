import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';

import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastrService = inject(ToastrService);

  return accountService.currentUser$.pipe(
    map(user => {
      if (!user) return false;

      if (user.roles && (user.roles.includes('Admin') || user.roles.includes('Moderator'))) {
        return true;
      }
      else {
        toastrService.error('You are not authorized to enter this area!');
        return false;
      }
    })
  );
};
