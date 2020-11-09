import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { catchError, map, tap } from 'rxjs/operators';

import { NameSearchInfo, NameSearchCondition } from '../model/namesearch.model';

@Injectable({
  providedIn: 'root'
})

export class NameSearchService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  getNameSearchlist(nameSearchCondition:NameSearchCondition): Observable<NameSearchInfo[]> {
    return this.http.post<NameSearchInfo[]>(`${this.baseUrl}/namesearch/getnamesearchlist`, nameSearchCondition);
  }
}
