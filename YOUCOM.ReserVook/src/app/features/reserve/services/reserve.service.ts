import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../core/network/http.service';
import { Base } from '../../../shared/model/baseinfo.model'
import { Reserve, AdjustmentUpdateInfo, ResultInfo } from '../model/reserve.model';
import { ItemInfo, TaxServiceDivision, SetItemInfo } from '../../item/model/item';
import { TaxRateInfo } from '../../master/taxrate/model/taxrateinfo.model';
import { CodeNameInfo } from '../../master/codename/model/codename.model';

@Injectable({
  providedIn: 'root'
})

export class ReserveService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  // URLアドレス
  reserveUrl: string = "reserve";
  codeNameUrl: string = "codename";

  /** 予約データ 取得 */
  getReserveInfoByPK(cond:Reserve): Observable<Reserve> {
    return this.http.post<Reserve>(`${this.baseUrl}/${this.reserveUrl}/getReserveInfoByPK`, cond);
  }

  /** 新規登録 */
  insertInfo(reserve: Reserve): Observable<ResultInfo>  {
    return this.http.post<ResultInfo>(`${this.baseUrl}/${this.reserveUrl}/insertInfo`, reserve);
  }

  /** 更新 */
  updateInfo(reserve: Reserve): Observable<ResultInfo>  {
    return this.http.post<ResultInfo>(`${this.baseUrl}/${this.reserveUrl}/updateInfo`, reserve);
  }

  /** 予約取消 */
  updateInfo_ReserveCancel(cond: Base): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.reserveUrl}/updateInfo_ReserveCancel`, cond);
  }

  /** 精算/精算取消 */
  updateInfo_Adjustment(cond: AdjustmentUpdateInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.reserveUrl}/updateInfo_Adjustment`, cond);
  }

  //#region マスタ類取得
  /** 部屋タイプ 取得 */
  getMasterRoomTypeList(cond:Base): Observable<any> {
    return this.http.post( `${this.baseUrl}/${this.reserveUrl}/getMasterRoomTypeList/`, cond);
  }

  /** エージェント 取得 */
  getMasterAgentList(cond:Base): Observable<any> {
    return this.http.post( `${this.baseUrl}/${this.reserveUrl}/getMasterAgentList/`, cond);
  }

  /** 金種 取得 */
  getMasterDenominationCodeList(cond:Base): Observable<any> {
    return this.http.post( `${this.baseUrl}/${this.reserveUrl}/getMasterDenominationCodeList/`, cond);
  }

  /** 宿泊商品 取得 */
  getMasterItemList_StayItem(cond:Base): Observable<ItemInfo[]> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/${this.reserveUrl}/getMasterItemList_Stay`, cond);
  }

  /** その他商品 取得 */
  getMasterItemList_OtherItem(cond:Base): Observable<any> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/${this.reserveUrl}/getMasterItemList_Other`, cond);
  }

  /** セット商品(親) 取得 */
  getMasterItemList_SetItem(cond:Base): Observable<any> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/${this.reserveUrl}/getMasterItemList_Set`, cond);
  }

  /** セット商品(子) 取得 */
  getMasterSetItemList(cond:Base): Observable<any> {
    return this.http.post<SetItemInfo[]>(`${this.baseUrl}/${this.reserveUrl}/getMasterSetItemList`, cond);
  }

  /** コード名称マスタ 取得 */
  getCodeNameInfo(divisionCode:string, base:Base){
    let cond = new CodeNameInfo();
    cond.companyNo = base.companyNo;
    cond.divisionCode = divisionCode;
    return this.http.post<CodeNameInfo[]>(`${this.baseUrl}/${this.codeNameUrl}/getlist`, cond);
  }

  /** 税サ区分 取得 */
  getTaxServiceListView(cond: Base) {
    return this.http.post<TaxServiceDivision[]>(`${this.baseUrl}/taxservice/gettaxservicelistview/`, cond);
  }

  /** 税率 取得 */
  getTaxRate(cond: Base) {
    return this.http.post<TaxRateInfo[]>(`${this.baseUrl}/taxrate/getTaxRateList/`, cond);
  }

  /** サービス料率 取得 */
  getServiceRate(cond: Base) {
    return this.http.post<number>(`${this.baseUrl}/company/getServiceRate/`, cond);
  }
  //#endregion

}
