import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, EnumRole, EnumLostFlg } from './auth.model';
import { HttpService } from '../network/http.service';

@Injectable({	providedIn: 'root' })
export class AuthService extends HttpService {
  private currentUserSubject: BehaviorSubject<User>;
  private currentDispCompanyNoSubject: BehaviorSubject<string>;

	constructor(public http: HttpClient) {
		super(http);
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentDispCompanyNoSubject = new BehaviorSubject<string>(localStorage.getItem('dispCompanyNo'));
  }

  /**ログイン*/
	public login(email: string, password: string) {
    let userInfo: User = new User();
    userInfo.userEmail = email;
    userInfo.password = password;

		return this.http.post<any>(`${this.baseUrl}/user/emailAndPwd`,userInfo)
			.pipe(map(user => {
				console.log("user", user);

        this.setcurrentUser(user);
        this.setDispCompanyNo(user.companyNo);

				return user;
			}));
  }

  /**ログアウト*/
	public Logout(): Observable<boolean> {
    if (!this.getLoginUser()) {return null;}
		return this.http.get<boolean>(`${this.baseUrl}/user/logout?id=${this.getLoginUser().userEmail}`, {})
			.pipe(map(result => {
        console.log("this.getLoggedInUser().id", this.getLoginUser());
        this.removecurrentUser();
        this.removeDispCompanyNo();
				return result;
      }));
  }

  /**ログアウト*/
	public SimpleLogout(userEmail :string): Observable<boolean> {
		return this.http.get<boolean>(`${this.baseUrl}/user/logout?id=${userEmail}`, {})
			.pipe(map(result => {
        console.log("this.getLoggedInUser().id", this.getLoginUser());
        localStorage.removeItem('currentUser');
				return result;
      }));
  }

    /**ログアウト*/
	public RemoveToken():boolean  {

    this.removecurrentUser();
    this.removeDispCompanyNo();

    return true;
  }

  /** <Summury> ユーザー権限判定
   *
   *  <Param> role:ユーザー権限区分
   *
   *  <Returns>    True:権限有 , False:権限無し
   */
  public IsAuthenticationFeatures(role: EnumRole): boolean {

    let loggedInUser = this.getLoginUser();
    if (loggedInUser != null && loggedInUser.roleDivision == role.toString() && loggedInUser.lostFlg == EnumLostFlg.UnUsed.toString()) {
      return true;
    } else {
      return false;
    }
  }

  /**ログインユーザ情報 & 画面選択中の会社の取得*/
  public getLoginUser(): User {

    if(isNullOrUndefined(localStorage.getItem('currentUser'))) {
      return null;
    }

    if(isNullOrUndefined(localStorage.getItem('dispCompanyNo'))) {
      return null;
    }

    let userInfo = this.currentUserSubject.value;
    userInfo.displayCompanyNo = this.currentDispCompanyNoSubject.value;

		return userInfo;
	}

  /** ログインユーザ情報をlocalStrageへセット */
  private setcurrentUser(user: User) {

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);

  }

  /** localStrageからログインユーザ情報を削除 */
  private removecurrentUser(){
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return true;
  }

  /** 画面選択中の会社番号をlocalStrageへセット */
  public setDispCompanyNo(dispCompanyNo: string) {

    localStorage.setItem('dispCompanyNo', dispCompanyNo);
    this.currentDispCompanyNoSubject.next(dispCompanyNo);

  }

  /** localStrageから画面選択中の会社番号を削除 */
  public removeDispCompanyNo(){
    localStorage.removeItem('dispCompanyNo');
    this.currentDispCompanyNoSubject.next(null);
    return true;
  }

  /** 画面選択中の会社番号をlocalStrageから取得 */
  public getDispCompanyNo(): string {

    return localStorage.getItem('dispCompanyNo');

  }

}

