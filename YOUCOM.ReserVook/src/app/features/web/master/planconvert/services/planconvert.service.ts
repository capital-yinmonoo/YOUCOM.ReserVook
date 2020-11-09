import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { PlanConvertInfo } from '../model/planconvert.model';
import { ScNameInfo } from '../../scname/model/scname.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlanConvertService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

   // URLアドレス
  planconvertUrl: string = "planconvert";
  scnmUrl: string = "scname";

  // 情報読込-画面表示用
  GetPlanConvertList(planConvert: PlanConvertInfo): Observable<PlanConvertInfo[]> {
    return this.http.post<PlanConvertInfo[]>(`${this.baseUrl}/${this.planconvertUrl}/getList`, planConvert);
  }

  // 情報読込-編集,削除用
  GetPlanConvertById(planConvert: PlanConvertInfo): Observable<PlanConvertInfo> {
    return this.http.post<PlanConvertInfo>(`${this.baseUrl}/${this.planconvertUrl}/getListById`, planConvert);
  }

  // 情報追加
  InsertPlanConvert(planConvert: PlanConvertInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.planconvertUrl}/addPlanConvert`, planConvert);
  }

  // 情報更新
  UpdatePlanConvert(planConvert: PlanConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.planconvertUrl}/updatePlanConvert`, planConvert);
  }

  // 情報削除
  DeletePlanConvert(planConvert: PlanConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.planconvertUrl}/delPlanConvert`, planConvert);
  }

  // サイトコントローラー名取得(追加・編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('サイトコントローラー名取得')),
        catchError(this.handleError<any[]>('サイトコントローラー名取得エラー', []))
      );
  }

  // SC名称マスタ取得(追加・編集画面用)
  GetScNameList(scName: ScNameInfo): Observable<ScNameInfo[]> {
    return this.http.post<ScNameInfo[]>(`${this.baseUrl}/${this.scnmUrl}/getList`, scName);
  }
}
