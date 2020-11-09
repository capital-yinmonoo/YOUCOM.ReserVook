import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/core/network/http.service';
import { Base } from 'src/app/shared/model/baseinfo.model';
import { CompanyGroupInfo } from '../model/companygroup.model';

@Injectable({
  providedIn: 'root'
})

export class CompanyGroupService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  /** 会社グループのリストを取得 */
  getCompanyGroupList(): Observable<CompanyGroupInfo[]> {
    return this.http.get<CompanyGroupInfo[]>(`${this.baseUrl}/companygroup/getCompanyGroupList`);
  }

  /** 会社グループを取得 */
  getCompanyGroupByPK(companyGroup: CompanyGroupInfo): Observable<CompanyGroupInfo> {
    return this.http.post<CompanyGroupInfo>(`${this.baseUrl}/companygroup/getCompanyGroupByPK/`, companyGroup);
  }

  /** 会社グループ 追加 */
  addCompanyGroup(companyGroup: CompanyGroupInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/companygroup/addCompanyGroup`, companyGroup);
  }

  /** 会社グループ 更新 */
  updateCompanyGroup(companyGroup: CompanyGroupInfo):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/companygroup/updateCompanyGroup`, companyGroup);
  }

  /** 会社グループ 削除 */
  deleteCompanyGroup(companyGroup: CompanyGroupInfo):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/companygroup/deleteCompanyGroup/`, companyGroup);
  }

  /** 会社グループ 削除前チェック */
  checkBeforeDelete(companyGroup: CompanyGroupInfo):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/companygroup/checkBeforeDelete/`, companyGroup);
  }

}
