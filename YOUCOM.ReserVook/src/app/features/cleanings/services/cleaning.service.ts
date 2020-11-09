import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';
import { Cleaning, CleaningCondition } from '../model/cleaning.model';
import { RoomsAssignedInfo } from '../../rooms/model/rooms.model';

@Injectable({
  providedIn: 'root'
})

export class CleaningService extends HttpService {

  private readonly cleaningUrl: string = 'cleaningList';

  // 印刷用
  public printDate: Date;
  public header: any[];
  public data: Cleaning[];

  constructor(public http: HttpClient) {
    super(http);
  }

  getCleaningsList(cond: CleaningCondition): Observable<Cleaning[]> {
    return this.http.post<Cleaning[]>(`${this.baseUrl}/${this.cleaningUrl}/getCleaningsList`, cond)
    .pipe(
      tap(_ => this.log('fetched cleaning list')),
      catchError(this.handleError<Cleaning[]>('getCleaningsList', []))
    );
  }

  // 客室状態更新
  UpdateRoomStatus(cond: RoomsAssignedInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.cleaningUrl}/updateRoomStatus`, cond);
  }
}
