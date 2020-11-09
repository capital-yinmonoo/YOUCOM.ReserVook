import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { catchError, map, tap } from 'rxjs/operators';

import { WebReserveBaseInfo } from '../model/webreservebase.model';
import { WebReserveInfo } from '../model/webreserve.model';

@Injectable({
  providedIn: 'root'
})

export class WebreserveService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  getWebReserveBaseList(webReserveBase:WebReserveBaseInfo): Observable<WebReserveBaseInfo[]> {
    return this.http.post<WebReserveBaseInfo[]>(`${this.baseUrl}/webreserve/getwebreservelist`, webReserveBase);
  }

  getWebreserveInfo(webReserveBase:WebReserveBaseInfo): Observable<WebReserveInfo> {
    return this.http.post<WebReserveInfo>(`${this.baseUrl}/webreserve/getwebreserveinfo`, webReserveBase);
  }

}
