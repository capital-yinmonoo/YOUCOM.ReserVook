import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { PointConvertInfo } from '../model/pointconvert.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PointConvertService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

   // URLアドレス
  pointconvertUrl: string = "pointconvert";
  scnmUrl: string = "scname";
  siteConvertUrl: string = "siteconvert";
  denominationUrl: string = "denomination";

  // 情報読込-画面表示用
  GetPointConvertList(pointConvert: PointConvertInfo): Observable<PointConvertInfo[]> {
    return this.http.post<PointConvertInfo[]>(`${this.baseUrl}/${this.pointconvertUrl}/getList`, pointConvert);
  }

  // 情報読込-編集,削除用
  GetPointConvertById(pointConvert: PointConvertInfo): Observable<PointConvertInfo> {
    return this.http.post<PointConvertInfo>(`${this.baseUrl}/${this.pointconvertUrl}/getListById`, pointConvert);
  }

  // 情報追加
  InsertPointConvert(pointConvert: PointConvertInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.pointconvertUrl}/addPointConvert`, pointConvert);
  }

  // 情報更新
  UpdatePointConvert(pointConvert: PointConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.pointconvertUrl}/updatePointConvert`, pointConvert);
  }

  // 情報削除
  DeletePointConvert(pointConvert: PointConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.pointconvertUrl}/delPointConvert`, pointConvert);
  }

  // サイトコントローラー名取得(追加・編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // サイトコード取得(追加・編集画面用)
  GetSiteCodeList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.siteConvertUrl}/getSiteCodeList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 金種取得(追加・編集画面用)
  GetDenominationList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.denominationUrl}/getDenominationList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }
}
