import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { RemarksConvertInfo } from '../model/remarksconvert.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RemarksConvertService extends HttpService{

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

   // URLアドレス
  remarksconvertUrl: string = "remarksconvert";
  scnmUrl: string = "scname";

  // 情報読込-画面表示用
  GetRemarksConvertList(remarksConvert: RemarksConvertInfo): Observable<RemarksConvertInfo[]> {
    return this.http.post<RemarksConvertInfo[]>(`${this.baseUrl}/${this.remarksconvertUrl}/getList`, remarksConvert);
  }

  // 情報読込-編集用
  GetRemarksConvertById(remarksConvert: RemarksConvertInfo): Observable<RemarksConvertInfo> {
    return this.http.post<RemarksConvertInfo>(`${this.baseUrl}/${this.remarksconvertUrl}/getListById`, remarksConvert);
  }

  // 情報更新
  UpdateRemarksConvert(remarksConvert: RemarksConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.remarksconvertUrl}/updateRemarksConvert`, remarksConvert);
  }

  // サイトコントローラー名取得(編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }
}
