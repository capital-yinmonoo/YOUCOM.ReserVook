import { TaxServiceDivision } from './../model/item';
import { Base } from './../../../shared/model/baseinfo.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../../core/network/http.service';
import { ItemInfo } from '../../item/model/item';

@Injectable({
  providedIn: 'root'
})

export class itemService extends HttpService {
  constructor(public http: HttpClient) {
    super(http);
  }

  getItemListView(item: ItemInfo): Observable<ItemInfo[]> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/item/getItemListView`,item);
  }

  getItemList(item: ItemInfo): Observable<ItemInfo[]> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/item/getitemlist`,item);
  }

  getItemByPK(item: ItemInfo): Observable<ItemInfo> {
    return this.http.post<ItemInfo>(`${this.baseUrl}/item/getitembyPKview/`,item);
  }

  getTaxServiceListView(base: Base) {
    return this.http.post<TaxServiceDivision[]>(`${this.baseUrl}/taxservice/gettaxservicelistview/`,base);
  }

  addItem(item: ItemInfo): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/item/additem`, item);
  }

  updateItem(item: ItemInfo):Observable<number>{
    return this.http.put<number>(`${this.baseUrl}/item/updateitem`,item);
  }

  deleteItem(item: ItemInfo):Observable<number>{
    return this.http.put<number>(`${this.baseUrl}/item/deleteitem/`,item);
  }

  checkDelete(item: ItemInfo):Observable<number>{
    return this.http.put<number>(`${this.baseUrl}/item/checkDelete/`,item);
  }

}
