import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service'
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoaderComponent } from '../../shared/loader/loader.component'

@Injectable({
    providedIn: 'root'
})
export class RequestInterceptor implements HttpInterceptor {

    constructor(public http: HttpClient,
        public auth: AuthService,
        public dialog: MatDialog,
        private router: Router,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // loading Circle On
        let dialogLoader;
        if (this.dialog.openDialogs.length == 0) {
            dialogLoader = this.dialog.open(LoaderComponent);
        }

        console.log('intercept', request);
        console.log('this.auth.getLoggedInUser()', this.auth.getLoginUser());
        if (this.auth.getLoginUser() && this.auth.getLoginUser().jwtToken) {
            console.log('this.auth.getLoggedInUser().jwtToken', this.auth.getLoginUser().jwtToken);
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.auth.getLoginUser().jwtToken}`,
                    //"Content-Type": "application/json"
                }
            });
        }

        // loading Circle Off
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            if(dialogLoader){ dialogLoader.close(); }
          }
        },
          (err: any) => {
            if(dialogLoader){ dialogLoader.close(); }
        }));

    }

}
