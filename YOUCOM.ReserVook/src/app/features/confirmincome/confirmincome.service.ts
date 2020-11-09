import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../core/network/http.service';
import { ConfirmIncome, IncomeQuery } from './confirmincome.model';

@Injectable({
  providedIn: 'root'
})


export class ConfirmincomeService extends HttpService {
  constructor(public http: HttpClient) {
    super(http);
  }

  // //SAVE COMMODITY
  // deleteActualRoom(actualRoomId: string): Observable<boolean> {
  //   return this.http.delete<boolean>(`${this.baseUrl}/confirmincome/deleteActualRoom/${actualRoomId}`);
  // }

  //SAVE COMMODITY
  getIncomeList(incomeQuery: IncomeQuery): Observable<ConfirmIncome[]> {
    return this.http.post<ConfirmIncome[]>(`${this.baseUrl}/confirmincome/getIncomeList`, incomeQuery);
  }
}
