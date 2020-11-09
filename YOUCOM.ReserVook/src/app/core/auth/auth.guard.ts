import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { EnumRole } from './auth.model';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { FunctionId, MessagePrefix } from '../system.const';

/**スーパー管理者ガード
 *
 * スーパー管理者=YOUCOM Only
*/
@Injectable()
export class AuthSuperAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, public dialog: MatDialog,) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      this.authService.Logout().subscribe(() => {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '001' + '】');
      });
      this.authService.RemoveToken();
      return false;
    }
  }

  canActivateChild(state: RouterStateSnapshot): boolean {
    if (this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      this.authService.Logout().subscribe(() => {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '002' + '】');
      });
      this.authService.RemoveToken();
      return false;
    }
  }

  openModal(msg: string, funcId:string) {
    if(!this.dialog.getDialogById('dialogLoginError')) {
        const dialogRef = this.dialog.open(DialogComponent, {
            id: 'dialogLoginError',
            data: { title: '権限エラー', content: `${funcId}<br/>${msg}`, disableClose: true },
        });

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
            this.router.navigate(['/login']);
        });
    }
  }

}

/**管理者ガード*/
@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, public dialog: MatDialog,) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.IsAuthenticationFeatures(EnumRole.Admin) || this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      this.authService.Logout().subscribe(() => {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '003' + '】');
      });
      this.authService.RemoveToken();
      return false;
    }
  }

  canActivateChild(state: RouterStateSnapshot): boolean {
    if (this.authService.IsAuthenticationFeatures(EnumRole.Admin) || this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      this.authService.Logout().subscribe(() => {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '004' + '】');
      });
      this.authService.RemoveToken();
      return false;
    }
  }

  openModal(msg: string, funcId:string) {
    if(!this.dialog.getDialogById('dialogLoginError')) {
        const dialogRef = this.dialog.open(DialogComponent, {
            id: 'dialogLoginError',
            data: { title: '権限エラー', content: `${funcId}<br/>${msg}`, disableClose: true },
        });

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
            this.router.navigate(['/login']);
        });
    }
  }

}

/**一般ユーザーガード*/
@Injectable()
export class AuthStaffGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, public dialog: MatDialog) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.IsAuthenticationFeatures(EnumRole.User) || this.authService.IsAuthenticationFeatures(EnumRole.Admin) || this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      this.authService.Logout().subscribe(() => {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '005' + '】');
      });
      this.authService.RemoveToken();
      this.router.navigate(['/login']);
      return false;
    }
  }

  canActivateChild(state: RouterStateSnapshot): boolean {
    if (this.authService.IsAuthenticationFeatures(EnumRole.User) || this.authService.IsAuthenticationFeatures(EnumRole.Admin) || this.authService.IsAuthenticationFeatures(EnumRole.SuperAdmin)){
      return true;
    } else {
      console.log('Unauthorized to open link: ' + state.url);
      if (!this.authService.getLoginUser()) {
        this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '006' + '】');
        this.router.navigate(['/login']);
        return false;
      }else{
        this.authService.Logout().subscribe(() => {
          this.openModal('ユーザー認証に失敗しました。ログイン画面に戻ります。', '【' + MessagePrefix.ERROR + FunctionId.AUTH + '007' + '】');
        });
        this.authService.RemoveToken();
        this.router.navigate(['/login']);
        return false;
      }
    }
  }

  openModal(msg: string, funcId:string) {
    if(!this.dialog.getDialogById('dialogLoginError')) {
        const dialogRef = this.dialog.open(DialogComponent, {
            id: 'dialogLoginError',
            data: { title: '権限エラー', content: `${funcId}<br/>${msg}`, disableClose: true },
        });

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
            this.router.navigate(['/login']);
        });
    }
  }
}
