import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const statusError = error.status;
        switch (statusError) {
          case 500:
            const navigationExtras: NavigationExtras = { state: { error: error.error } };
            this.router.navigateByUrl('/server-error', navigationExtras);
            break;
          case 401:
            this.toastr.error('Unauthorized!', statusError.toString());
            break;
          case 404:
            this.router.navigateByUrl('/not-found');
            break;
          case 400:
            const validateErrors = error.error?.errors;
            if (validateErrors) {
              const modelStateErrors = [];
              for (const key in validateErrors) {
                if (validateErrors[key]) {
                  modelStateErrors.push(validateErrors[key]);
                }
              }

              this.toastr.error(modelStateErrors.join('\r\n'), statusError.toString());
              throw modelStateErrors.flat();
            }
            else {
              this.toastr.error(error.error, statusError.toString());
            }
        }

        throw error;
      })
    );
  }
}
