import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';

import { BookingsCondition, BookingsInfo } from '../model/bookings.model';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends HttpService {

  private roominfoUrl: string = 'bookings';
  constructor(public http: HttpClient) {
    super(http);
  }

  getRoomInfo(cond: BookingsCondition): Observable<Array<BookingsInfo>> {
    return this.http.post<Array<BookingsInfo>>(`${this.baseUrl}/${this.roominfoUrl}/getbookingslist`, cond)
    .pipe(
      tap(_ => this.log('fetched rooms')),
      catchError(this.handleError<Array<BookingsInfo>>('getBookingsList', []))
    );
  }

}
