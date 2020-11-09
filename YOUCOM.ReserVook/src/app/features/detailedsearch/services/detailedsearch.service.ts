import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpService } from '../../../core/network/http.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DetailedSearchService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  // URLアドレス
  codenameUrl: string = "codename";

  // 忘れ物発見場所分類取得
  GetFoundPlaceList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getFoundPlaceList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 忘れ物保管分類
  GetStorageList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getStorageList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }
}
