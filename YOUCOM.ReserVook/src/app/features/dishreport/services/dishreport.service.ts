import { ColumnProperty } from './../model/dishreport.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';
import { DishInfo, DishReportCondition } from '../model/dishreport.model';

@Injectable({
  providedIn: 'root'
})

export class DishReportService extends HttpService {

  private readonly dishReportUrl: string = 'dishreport';

  // 印刷用パラメータ
  /** 対象日付(開始日) */
  public printDate: Date;
  /** 表示範囲(日) */
  public days: number;
  /** ヘッダ情報 */
  public header: ColumnProperty[];
  /** 料理日報 一覧情報 */
  public data: DishInfo[];

  constructor(public http: HttpClient) {
    super(http);
  }

  getDishReportList(cond: DishReportCondition): Observable<DishInfo[]> {
    return this.http.post<DishInfo[]>(`${this.baseUrl}/${this.dishReportUrl}/getList`, cond)
    .pipe(
      tap(_ => this.log('fetched dishreport list')),
      catchError(this.handleError<DishInfo[]>('getList', []))
    );
  }

}
