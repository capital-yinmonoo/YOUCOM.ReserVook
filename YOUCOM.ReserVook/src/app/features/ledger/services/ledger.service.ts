import { LedgerInfo } from './../model/ledger.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';

@Injectable({
  providedIn: 'root'
})
export class LedgerService extends HttpService {


  constructor(public http: HttpClient) {
    super(http);
  }

  /** 台帳情報 取得 */
  public getLedgerReport(cond: LedgerInfo): Observable<Array<LedgerInfo>> {
    return this.http.post<Array<LedgerInfo>>(`${this.baseUrl}/ledger/getLedgerReport/`, cond);
  }

}
