import { isNullOrUndefined } from 'util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,} from '@angular/forms';
import { first } from 'rxjs/operators';
import { Router, } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { User, EnumRole } from '../../core/auth/auth.model';
import { CustomValidators } from 'ng2-validation';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/dialog.component'
import { Message, FunctionId, MessagePrefix } from 'src/app/core/system.const';
import { BehaviorSubject } from 'rxjs';

class Login{
  count: number;
  dt: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {

  //** 英字、数字、記号(_-.@)を半角で入力してください。 */
  public readonly msgPatternEmail = Message.PATTERN_EMAIL;
  //** 有効なメールアドレスを入力してください。 */
  public readonly msgValidityEmail = Message.VALIDITY_EMAIL;

  public form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog
  ) {
      // redirect to home if already logged in
      if (this.authService.getLoginUser()) {
        this.router.navigate(['/company/rooms']);
      }
  }

  public user: User;
  private loginInfo: Login;
  private readonly WAIT_MINITE: number = 1;
  private readonly TRY_COUNT: number = 5;

  ngOnInit() {
    this.form = this.fb.group({
      Email: [null, Validators.compose([Validators.required, CustomValidators.email, Validators.pattern('^([a-zA-Z0-9_\\-\\.\\@])*$')])],
      Password: [null, Validators.compose([Validators.required])]
    });

    // 画面サイズ(縦)が小さい時はロゴを表示しない
    window.addEventListener("resize", function(event) {
      const checkHeight : number = 550;

      let element = document.getElementById('logo');
      if (isNullOrUndefined(element)) return;

      if (document.documentElement.offsetHeight >= checkHeight) {
        element.style.display = 'flex';
      }else{
        element.style.display = 'none';
      }
    });
  }

  onSubmit() {

    console.log('onSubmit');

    // check already login user
    let loginUser = this.authService.getLoginUser()
    if (loginUser && !loginUser.loginResult) {
      if( loginUser.roleDivision == EnumRole.SuperAdmin.toString()) {
        this.router.navigate(['/master/company/list']);
      } else {
        this.router.navigate(['/company/rooms']);
      }
      return;
    }

    this.tryToLogin();

  }

  openModal(msg: string, funcId:string) {
    if (!DialogComponent.Shown) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { title: 'ログイン', content: `${funcId}<br/>${msg}`, disableClose: true },
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('The dialog was closed');
      });
    }
  }

  private login(){

    let strUser = localStorage.getItem('currentUser');
    let isLogined : boolean = (strUser != null && strUser != "");

    if (isLogined) {

      let parsedUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));

      this.authService.SimpleLogout(parsedUser.value.userEmail).subscribe(() => {
        this.authService.login(this.form.controls['Email'].value, this.form.controls['Password'].value)
        .pipe(first()).subscribe(data => {
          if (data.loginResult != null && data.loginResult != "") {
            this.openModal(data.loginResult, '【' + MessagePrefix.ERROR + FunctionId.LOGIN + '001' + '】');
            this.loginFail();
          } else {
            this.loginSuccess();
            if (data.roleDivision == EnumRole.SuperAdmin.toString()) {
              this.router.navigate(['/master/company/list']);
            } else {
              this.router.navigate(['/company/rooms']);
            }
          }
        });
      });

    }else{
      this.authService.login(this.form.controls['Email'].value, this.form.controls['Password'].value)
        .pipe(first()).subscribe(data => {
          if (data.loginResult != null && data.loginResult != "") {
            this.openModal(data.loginResult, '【' + MessagePrefix.ERROR + FunctionId.LOGIN + '002' + '】');
            this.loginFail();
          } else {
            this.loginSuccess();
            if (data.roleDivision == EnumRole.SuperAdmin.toString()) {
              this.router.navigate(['/master/company/list']);
            } else {
              this.router.navigate(['/company/rooms']);
            }
          }
      });
    }


  }

  private tryToLogin(){

    if (!isNullOrUndefined(this.loginInfo)) {

      if(this.loginInfo.count > this.TRY_COUNT){

        const nowDate = new Date().getTime();

        if(nowDate < this.loginInfo.dt){
          //fail
          this.openModal('ログイン認証に失敗しました。数分後にログインし直してください。', '【' + MessagePrefix.ERROR + FunctionId.LOGIN + '003' + '】');
          return;
        }
      }
    }

    console.log('login!');
    this.login();

  }

  private loginFail() {
    console.log('loginFail');

    const nowDate = new Date();

    if(isNullOrUndefined(this.loginInfo)){
      let info = new Login();
      info.count = 1;
      info.dt = nowDate.setMinutes(nowDate.getMinutes() + this.WAIT_MINITE);
      this.loginInfo = info;
    }
    else{
      this.loginInfo.count++;
      this.loginInfo.dt = nowDate.setMinutes(nowDate.getMinutes() + this.WAIT_MINITE);
    }

  }

  private loginSuccess() {
    this.loginInfo = null;
  }

}
