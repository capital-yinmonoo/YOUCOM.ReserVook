import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpService } from '../../../core/network/http.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LostItemListInfo } from '../../lostitemlist/model/lostitemlist.model';

@Injectable({
  providedIn: 'root'
})
export class LumpDeleteService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  // URLアドレス
  lostItemListUrl: string = "lostitemlist";
  stateUrl: string = "state";

  // 情報一括削除
  LumpDeleteLostItem(lostItemList: LostItemListInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.lostItemListUrl}/lumpDelLostItem`, lostItemList);
  }

  // 忘れ物状態
  GetStateList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.stateUrl}/getStateList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched states')),
        catchError(this.handleError<any[]>('getStates', []))
      );
  }
}
