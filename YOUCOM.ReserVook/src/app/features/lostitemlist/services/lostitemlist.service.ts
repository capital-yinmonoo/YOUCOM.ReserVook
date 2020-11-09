import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { LostItemListInfo, LostItemPictureInfo } from '../model/lostitemlist.model';
import { AuthService } from '../../../core/auth/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LostItemListService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  lostItemListUrl: string = "lostitemlist";
  codenameUrl: string = "codename";
  stateUrl: string = "state";
  roomUrl: string = "rooms";

  // 情報読込-画面表示用
  GetLostItemListList(lostItemList: LostItemListInfo): Observable<LostItemListInfo[]> {
    return this.http.post<LostItemListInfo[]>(`${this.baseUrl}/${this.lostItemListUrl}/getList`, lostItemList);
  }

  // 情報読込-編集,削除用
  GetLostItemListById(lostItemList: LostItemListInfo): Observable<LostItemListInfo> {
    return this.http.post<LostItemListInfo>(`${this.baseUrl}/${this.lostItemListUrl}/getListById`, lostItemList);
  }

  // 画像読込-編集用
  GetLostItemImage(lostItemList: LostItemListInfo): Observable<LostItemPictureInfo[]> {
    return this.http.post<LostItemPictureInfo[]>(`${this.baseUrl}/${this.lostItemListUrl}/getImage`, lostItemList);
  }

  // 現在使用容量取得
  GetUsingCapacity(lostItemList: LostItemListInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.lostItemListUrl}/getUsingCapacity`, lostItemList);
  }

  // 追加
  addLostItem(lostItemList: LostItemListInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.lostItemListUrl}/addLostItem`, lostItemList);
  }

  // 画像サイズのチェック
  isOverMaxCapacity(formData: LostItemPictureInfo[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.lostItemListUrl}/isOverMaxCapacity`, formData);
  }

  // 更新
  updateLostItem(lostItemList: LostItemListInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.lostItemListUrl}/updateLostItem`, lostItemList);
  }

  // 画像登録
  updateImage(formData: LostItemPictureInfo[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.lostItemListUrl}/updateImage`, formData);
  }

  // 情報削除
  DeleteLostItem(lostItemList: LostItemListInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.lostItemListUrl}/delLostItem`, lostItemList);
  }

  // 忘れ物状態
  GetStateList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.stateUrl}/getStateList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched states')),
        catchError(this.handleError<any[]>('getStates', []))
      );
  }

  // 忘れ物発見場所分類取得
  GetFoundPlaceList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getFoundPlaceList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched FoundPlace')),
        catchError(this.handleError<any[]>('getFoundPlace', []))
      );
  }

  // 忘れ物保管分類
  GetStorageList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getStorageList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched Storage')),
        catchError(this.handleError<any[]>('getStorage', []))
      );
  }

  // 部屋
  GetRoomList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.roomUrl}/getRoomList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched Room')),
        catchError(this.handleError<any[]>('getRoom', []))
      );
  }
}
