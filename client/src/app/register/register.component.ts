import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  model: any = {};
  @Output() cancelRegister = new EventEmitter<boolean>();

  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  register() {
    this.accountService.register(this.model).subscribe({
      next: () => {
        this.cancel();
      },
      error: error => this.toastr.error(error.error)
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
