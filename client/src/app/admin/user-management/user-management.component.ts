import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { AdminService } from 'src/app/_services/admin.service';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';
import { User } from 'src/app/_models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();
  users: User[] = [];
  availableRoles = ['Admin', 'Moderator', 'Member'];

  constructor(private adminService: AdminService, private bsModalService: BsModalService) {}

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: users => this.users = users
    });
  }

  editRoles(user: User) {
    const username = user.userName;
    const roles = [...user.roles];

    const options: ModalOptions = {
      class: 'modal-dialog-centered',
      initialState: {
        username: username,
        availableRoles: this.availableRoles,
        selectedRoles: roles,
      }
    };

    this.bsModalRef = this.bsModalService.show(RolesModalComponent, options);
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        const selectedRoles = this.bsModalRef.content?.selectedRoles;
        if (!this.arrayEquals(selectedRoles!, user.roles)) {
          this.adminService.updateUserRoles(username, selectedRoles!).subscribe({
            next: roles => user.roles = roles
          })
        }
      }
    });
  }

  private arrayEquals(arr1: string[], arr2: string[]) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
  }
}
