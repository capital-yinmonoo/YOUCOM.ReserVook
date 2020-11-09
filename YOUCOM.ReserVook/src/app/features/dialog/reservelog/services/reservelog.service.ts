import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../core/network/http.service';
import { Observable } from 'rxjs';
import { ReserveLogInfo } from '../model/reservelog.model';

@Injectable({
  providedIn: 'root'
})
export class ReserveLogService extends HttpService  {

  constructor(public http: HttpClient) {
    super(http);
  }

  /** 予約変更履歴 一覧取得 */
  getList(cond: ReserveLogInfo): Observable<ReserveLogInfo[]> {
    return this.http.post<ReserveLogInfo[]>(`${this.baseUrl}/reserveLog/getReserveLogList/`, cond);
  }

}
