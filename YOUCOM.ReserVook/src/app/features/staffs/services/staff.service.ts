import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { HttpService } from '../../../core/network/http.service';
import { Staff } from '../model/staff.model';
import { AuthService } from 'src/app/core/auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class StaffService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  private userUrl: string = 'user';
  private codenameUrl: string = 'codename';
  private companyUrl: string = 'company';

  // 情報取得(画面表示用)
  GetStaffList(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.baseUrl}/${this.userUrl}/getList`);
  }

  // 情報取得(編集・削除用)
  GetStaff(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(`${this.baseUrl}/${this.userUrl}/getByIdUser`, staff);
  }

  // 追加
  AddStaff(staff: Staff): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.userUrl}/addUser`, staff);
  }

  // 更新
  UpdateStaff(staff: Staff) {
    return this.http.put(`${this.baseUrl}/${this.userUrl}/updateUser`, staff);
  }

  // 削除
  DeleteStaff(staff: Staff) {
    return this.http.post(`${this.baseUrl}/${this.userUrl}/delUser`,staff)
  }

  // 権限取得(新規登録・編集画面用)
  GetRoleList(hParams:HttpParams):Observable<any>{
      return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getRoleList`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched Role')),
        catchError(this.handleError<any[]>('getRoleDid', []))
    );
  }

  // 清掃/忘れ物管理使用許可フラグ取得(新規登録・編集画面用)
  GetLostFlgList(hParams:HttpParams):Observable<any>{
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getLostFlgList`, {params: hParams})
    .pipe(
      tap(_ => this.log('fetched Role')),
      catchError(this.handleError<any[]>('getLostFlgDid', []))
    );
  }

}
