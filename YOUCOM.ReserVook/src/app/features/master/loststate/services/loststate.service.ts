import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/network/http.service';
import { LostStateInfo } from '../model/loststate.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LostStateService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

  // URLアドレス
  stateUrl: string = "state";

  // 情報読込-画面表示用
  GetLostStateList(lostState: LostStateInfo): Observable<LostStateInfo[]> {
    return this.http.post<LostStateInfo[]>(`${this.baseUrl}/${this.stateUrl}/getList`, lostState);
  }

  // 情報読込-編集,削除用
  GetLostStateById(lostState: LostStateInfo): Observable<LostStateInfo> {
    return this.http.post<LostStateInfo>(`${this.baseUrl}/${this.stateUrl}/getListById`, lostState);
  }

  // 情報追加
  InsertLostState(lostState: LostStateInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.stateUrl}/addLostPlace`, lostState);
  }

  // 情報更新
  UpdateLostState(lostState: LostStateInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.stateUrl}/updateLostPlace`, lostState);
  }

  // 情報削除
  DeleteLostStateInfoById(lostState: LostStateInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.stateUrl}/delLostPlace`, lostState);
  }

  // 情報削除チェック
  DeleteLostStateCheck(lostState: LostStateInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.stateUrl}/deleteLostPlaceCheck`,lostState);
  }
}

