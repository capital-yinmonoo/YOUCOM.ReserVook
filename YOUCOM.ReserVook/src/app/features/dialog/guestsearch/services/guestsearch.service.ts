import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../core/network/http.service';
import { GuestInfo } from '../../../reserve/model/reserve.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestSearchService extends HttpService  {

  constructor(public http: HttpClient) {
    super(http);
  }

  /** 利用者 検索結果 取得 */
  getGuestInfoList(cond: GuestInfo): Observable<any> {
    return this.http.post( `${this.baseUrl}/guestSearch/getGuestInfoList/`, cond);
  }
}
