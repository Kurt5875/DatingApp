import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent implements OnInit {
  username = '';
  availableRoles: string[] = [];
  selectedRoles: string[] = [];

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
  }

  onClickRole(role: string) {
    const index = this.selectedRoles.indexOf(role);
    index !== -1 ? this.selectedRoles.splice(index, 1) : this.selectedRoles.push(role);
  }
}
