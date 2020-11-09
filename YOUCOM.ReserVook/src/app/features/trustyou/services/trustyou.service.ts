import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';
import { Trustyou, TrustyouCondition, TrustyouLog, TrustyouSendRecvCondition, TrustyouLogCondition } from '../model/trustyou.model';

@Injectable({
  providedIn: 'root'
})

export class TrustyouService extends HttpService {

  private readonly trustyouUrl: string = 'trustyou';

  constructor(public http: HttpClient) {
    super(http);
  }

  getTrustyouList(cond: TrustyouCondition): Observable<Trustyou[]> {
    return this.http.post<Trustyou[]>(`${this.baseUrl}/${this.trustyouUrl}/getTrustyouList`, cond)
    .pipe(
      tap(_ => this.log('fetched trustyou list')),
      catchError(this.handleError<Trustyou[]>('getTrustyouList', []))
    );
  }

  sendRecvTrustyouData(sendRecvCond: TrustyouSendRecvCondition): Observable<TrustyouLog[]> {
    return this.http.post<TrustyouLog[]>(`${this.baseUrl}/${this.trustyouUrl}/sendRecvTrustyouData`, sendRecvCond)
    .pipe(
      tap(_ => this.log('fetched sendRecvTrustyouData')),
      catchError(this.handleError<TrustyouLog[]>('sendRecvTrustyouData', []))
    );
  }

  saveTemporarilyData(tempList: Trustyou[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.trustyouUrl}/saveTemporarilyData`, tempList);
  }

}
