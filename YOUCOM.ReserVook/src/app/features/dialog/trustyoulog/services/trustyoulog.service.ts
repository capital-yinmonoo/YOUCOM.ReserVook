import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../core/network/http.service';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TrustyouLogCondition, TrustyouLog } from 'src/app/features/trustyou/model/trustyou.model';

@Injectable({
  providedIn: 'root'
})
export class TrustyouLogService extends HttpService  {

  constructor(public http: HttpClient) {
    super(http);
  }

  getTrustyouLogList(cond: TrustyouLogCondition): Observable<TrustyouLog[]> {
    return this.http.post<TrustyouLog[]>(`${this.baseUrl}/trustyou/getTrustyouLogList`, cond)
    .pipe(
      tap(_ => this.log('fetched trustyou log list')),
      catchError(this.handleError<TrustyouLog[]>('getTrustyouLogList', []))
    );
  }
}
