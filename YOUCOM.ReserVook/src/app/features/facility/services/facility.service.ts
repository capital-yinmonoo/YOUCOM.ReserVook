import { MstFacilityInfo, ReserveFacilityCondition, TrnFacilityInfo } from './../model/facility.model';
import { Base } from './../../../shared/model/baseinfo.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';

@Injectable({
  providedIn: 'root'
})

export class FacilityService extends HttpService {
  constructor(public http: HttpClient) {
    super(http);
  }

  /** 会場マスタ リスト取得 */
  public getList(cond: Base): Observable<MstFacilityInfo[]> {
    return this.http.post<MstFacilityInfo[]>(`${this.baseUrl}/facility/getFacilityList`, cond);
  }

  /** 会場マスタ 取得 */
  public getFacility(info: MstFacilityInfo): Observable<MstFacilityInfo> {
    return this.http.post<MstFacilityInfo>(`${this.baseUrl}/facility/getFacility/`, info);
  }

  /** 会場マスタ 削除 */
  public delete(info: MstFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/deleteFacility/`, info);
  }

  /** 会場マスタ 更新 */
  public update(info: MstFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/updateFacility`, info);
  }

  /** 会場マスタ 追加 */
  public add(info: MstFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/addFacility`, info);
  }

  /** 会場マスタ 削除チェック */
  public checkBeforeDelete(info: MstFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/checkDelete/`,info);
  }

  /**指定日の予約会場リストを取得 */
  public getReserveFacilityList(cond: ReserveFacilityCondition): Observable<Array<TrnFacilityInfo>> {
    return this.http.post<Array<TrnFacilityInfo>>(`${this.baseUrl}/facility/getReserveFacilityList`, cond);
  }

  /**予約会場 登録 */
  public AddReserveFacility(info: TrnFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/addReserveFacility`, info);
  }

  /**予約会場 更新 */
  public UpdateReserveFacility(info: TrnFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/updateReserveFacility`, info);
  }

  /**予約会場 削除 */
  public DeleteReserveFacility(info: TrnFacilityInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/facility/deleteReserveFacility`, info);
  }

}
