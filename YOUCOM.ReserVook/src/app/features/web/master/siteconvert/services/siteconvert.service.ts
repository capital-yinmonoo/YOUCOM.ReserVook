import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { SiteConvertInfo} from '../model/siteconvert.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SiteConvertService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

  // URLアドレス
  siteConvertUrl: string = "siteconvert";
  scnmUrl: string = "scname";
  agentUrl: string = "agent";

  // 情報読込-画面表示用
  GetSiteConvertList(siteconvert: SiteConvertInfo): Observable<SiteConvertInfo[]> {
    return this.http.post<SiteConvertInfo[]>(`${this.baseUrl}/${this.siteConvertUrl}/getlist`, siteconvert);
  }

  // 情報読込-編集,削除用
  GetSiteConvertById(siteConvert: SiteConvertInfo): Observable<SiteConvertInfo> {
    return this.http.post<SiteConvertInfo>(`${this.baseUrl}/${this.siteConvertUrl}/getlistbyid`, siteConvert);
  }

  // 情報追加
  InsertSiteConvert(siteConvert: SiteConvertInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.siteConvertUrl}/addsiteconvert`, siteConvert);
  }

  // 情報更新
  UpdateSiteConvert(siteConvert: SiteConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.siteConvertUrl}/updatesiteconvert`, siteConvert);
  }

  // 情報削除
  DeleteSiteConvert(siteConvert: SiteConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.siteConvertUrl}/delsiteconvert`, siteConvert);
  }

  // サイトコントローラー名取得(追加・編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // エージェント取得(追加・編集画面用)
  GetAgentList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.agentUrl}/getagentslist/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 情報削除チェック
  DeleteSiteCdCheck(siteConvert: SiteConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.siteConvertUrl}/deleteSiteCdCheck`,siteConvert);
  }
}
