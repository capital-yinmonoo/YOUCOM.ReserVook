import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/network/http.service';
import { CodeNameInfo } from '../model/codename.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class CodenameService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  codeNameUrl: string = "codename";

  // 情報読込-画面表示用
  GetCodeNameList(codeName: CodeNameInfo): Observable<CodeNameInfo[]> {
    return this.http.post<CodeNameInfo[]>(`${this.baseUrl}/${this.codeNameUrl}/getlist`, codeName);
  }

  // 情報読込-編集,削除用
  GetCodeNameById(codeName: CodeNameInfo): Observable<CodeNameInfo> {
    return this.http.post<CodeNameInfo>(`${this.baseUrl}/${this.codeNameUrl}/getlistbyid`,codeName);
  }

  // 追加
  InsertCodeName(codeName: CodeNameInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.codeNameUrl}/addcodename`, codeName);
  }

  // 更新
  UpdateCodeName(codeName: CodeNameInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.codeNameUrl}/updatecodename`, codeName);
  }

  // 削除チェック
  DeleteCodeNameCheck(codeName: CodeNameInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.codeNameUrl}/deletecodenamecheck/`,codeName);
  }

  // 削除
  DeleteCodeNameById(codeName: CodeNameInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.codeNameUrl}/delcodename`,codeName);
  }

  // 部屋タイプ区分取得
  getRoomTypeDivisionList(cond:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codeNameUrl}/getRoomTypeDivisionList/`, {params: cond});
  }

}
