import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';
import { ReserveData, ReserveDataCondition, CustomerData, CustomerDataCondition } from '../model/dataexport.model';

@Injectable({
  providedIn: 'root'
})
export class DataExportService extends HttpService {

  private dataexportUrl: string = 'dataexport';
  constructor(public http: HttpClient) {
    super(http);
  }

  getReserveDataList(cond: ReserveDataCondition): Observable<Array<ReserveData>> {
    return this.http.post<Array<ReserveData>>(`${this.baseUrl}/${this.dataexportUrl}/getReserveDataList`, cond)
    .pipe(
      tap(_ => this.log('fetched getReserveDataList')),
      catchError(this.handleError<Array<ReserveData>>('getReserveDataList', []))
    );
  }


  getCustomerDataList(cond: CustomerDataCondition): Observable<Array<CustomerData>> {
    return this.http.post<Array<CustomerData>>(`${this.baseUrl}/${this.dataexportUrl}/getCustomerDataList`, cond)
    .pipe(
      tap(_ => this.log('fetched getCustomerDataList')),
      catchError(this.handleError<Array<CustomerData>>('getCustomerDataList', []))
    );
  }
}
