import { SalesReportInfo, SalesReportCondition } from './../model/salesreport.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';

@Injectable({
  providedIn: 'root'
})
export class SalesReportService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  /** 売上情報 取得 */
  public getSalesReport(cond: SalesReportCondition): Observable<Array<SalesReportInfo>> {
    return this.http.post<Array<SalesReportInfo>>(`${this.baseUrl}/salesreport/getSalesReport/`, cond);
  }

}
