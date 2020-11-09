import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { ReserveData, CustomerData, ResultData} from '../model/dataimport.model';

@Injectable({
  providedIn: 'root'
})
export class DataImportService extends HttpService {

  private dataimportUrl: string = 'dataimport';
  constructor(public http: HttpClient) {
    super(http);
  }

  importReserveData(reserveList: ReserveData[]): Observable<ResultData> {
    return this.http.post<ResultData>(`${this.baseUrl}/${this.dataimportUrl}/importReserveData`, reserveList);
  }

  importCustomerData(customerList: CustomerData[]): Observable<ResultData> {
    return this.http.post<ResultData>(`${this.baseUrl}/${this.dataimportUrl}/importCustomerData`, customerList);
  }
}
