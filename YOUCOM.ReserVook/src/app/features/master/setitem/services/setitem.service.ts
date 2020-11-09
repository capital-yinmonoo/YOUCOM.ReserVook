import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/core/network/http.service';
import { ItemInfo } from 'src/app/features/item/model/item';
import { Base } from 'src/app/shared/model/baseinfo.model';
import { SetItem } from '../model/setitem.model';

@Injectable({
  providedIn: 'root'
})

export class SetItemService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  /** セット商品(親)のリストを取得 */
  getSetItemParentList(cond: Base): Observable<ItemInfo[]> {
    return this.http.post<ItemInfo[]>(`${this.baseUrl}/setitem/getSetItemParentList`, cond);
  }

  /** セット商品を取得 */
  getSetItemByPK(key: ItemInfo): Observable<SetItem> {
    return this.http.post<SetItem>(`${this.baseUrl}/setitem/getSetItemByPK/`, key);
  }

  /** セット商品 追加 */
  addSetItem(setItem: SetItem): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/setitem/addSetItem`, setItem);
  }

  /** セット商品 更新 */
  updateSetItem(setItem: SetItem):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/setitem/updateSetItem`,setItem);
  }

  /** セット商品 削除 */
  deleteSetItem(key: ItemInfo):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/setitem/deleteSetItem/`,key);
  }

  /** セット商品 削除前チェック */
  checkBeforeDelete(key: ItemInfo):Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/setitem/checkBeforeDelete/`,key);
  }

}
