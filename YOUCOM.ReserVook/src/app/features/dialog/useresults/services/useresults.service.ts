import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../core/network/http.service';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UseResultsInfo } from '../model/useresults.model';

@Injectable({
  providedIn: 'root'
})
export class UseResultsService extends HttpService  {

  constructor(public http: HttpClient) {
    super(http);
  }

  getUseResultsList(cond: UseResultsInfo): Observable<UseResultsInfo[]> {
    return this.http.post<UseResultsInfo[]>(`${this.baseUrl}/useresults/getUseResultsList`, cond)
    .pipe(
      tap(_ => this.log('fetched useresults list')),
      catchError(this.handleError<UseResultsInfo[]>('getUseResultsList', []))
    );
  }
}
