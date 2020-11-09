import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { FunctionId, MessagePrefix } from '../system.const';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService,private router: Router,public dialog: MatDialog,) {  }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authService.RemoveToken();
                this.openModal('ユーザー認証に失敗しました。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '008' + '】');
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }

    openModal(msg: string, funcId:string) {
      if(!this.dialog.getDialogById('dialogLoginError')) {
          const dialogRef = this.dialog.open(DialogComponent, {
              id: 'dialogLoginError',
              data: { title: 'ログイン', content: `${funcId}<br/>${msg}`, disableClose: true },
          });

          dialogRef.afterClosed().subscribe(() => {
              console.log('The dialog was closed');
              this.router.navigate(['/login']);
          });
      }
    }
}
