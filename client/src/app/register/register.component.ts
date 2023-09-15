import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Output() cancelRegister = new EventEmitter<boolean>();
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;

  constructor(private accountService: AccountService, private toastr: ToastrService, private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  register() {
    const dateOnly = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    const formValues = { ...this.registerForm.value, dateOfBirth: dateOnly };

    this.accountService.register(formValues).subscribe({
      next: () => {
        this.router.navigateByUrl('/members')
      },
      error: error => this.validationErrors = error
    });
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      gender: ['male', Validators.required],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      }
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return ((control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { notMatching: true };
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  getDateOnly(strDate: string) {
    if (!strDate) return;

    let tmpDate = new Date(strDate);
    return new Date(tmpDate.setMinutes(tmpDate.getMinutes() - tmpDate.getTimezoneOffset()))
      .toISOString()
      .slice(0, 10);
  }
}
