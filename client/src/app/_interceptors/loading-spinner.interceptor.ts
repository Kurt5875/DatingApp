import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, delay, finalize } from 'rxjs';

import { LoadingSpinnerService } from '../_services/loading-spinner.service';

@Injectable()
export class LoadingSpinnerInterceptor implements HttpInterceptor {

  constructor(private loadingSpinnerService: LoadingSpinnerService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loadingSpinnerService.busy();

    return next.handle(request).pipe(
      delay(1000),
      finalize(() => {
        this.loadingSpinnerService.idle();
      })
    );
  }
}
