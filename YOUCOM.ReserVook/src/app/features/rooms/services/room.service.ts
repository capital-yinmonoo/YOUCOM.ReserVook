import { AssignInfo, Reserve } from './../../reserve/model/reserve.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { RoomInfo, RoomsAssignCondition, RoomsAssignedInfo, NotAssignedInfo, RoomChangeResult, RoomDetailsInfo, UpdateRoomDetails } from '../model/rooms.model';

@Injectable({
  providedIn: 'root'
})

export class RoomService extends HttpService {

  // URLアドレス
  private dictionaryUrl: string = "codename";
  private roomUrl: string = "rooms";

  constructor(public http: HttpClient) {
    super(http);
  }

  /**アサイン情報を取得 */
  public getDailyAssignInfo(cond: RoomsAssignCondition): Observable<RoomsAssignedInfo[][]> {
    return this.http.post<RoomsAssignedInfo[][]>(`${this.baseUrl}/${this.roomUrl}/getDailyAssignInfo`, cond);
  }

  /**未アサインリストを取得 */
  public getDailyNotAssignInfo(cond: RoomsAssignCondition): Observable<NotAssignedInfo[]> {
    return this.http.post<NotAssignedInfo[]>(`${this.baseUrl}/${this.roomUrl}/getDailyNotAssignInfo`, cond);
  }

  /**予約番号の指定日以降の未アサインを取得 */
  public getReserveNotAssignInfo(info: AssignInfo): Observable<AssignInfo[]> {
    return this.http.post<AssignInfo[]>(`${this.baseUrl}/${this.roomUrl}/getReserveNotAssignInfo`, info);
  }

  /**アサイン */
  public assignRoom(list: AssignInfo[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/assignRoom`, list);
  }

  /**アサイン解除 */
  public assignCancel(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/assignCancel`, cond);
  }

  /**チェックイン */
  public checkIn(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/checkIn`, cond);
  }

  /**チェックイン取消 */
  public checkInCancel(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/checkInCancel`, cond);
  }

  /**チェックアウト */
  public checkOut(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/checkOut`, cond);
  }

  /**チェックアウト取消 */
  public checkOutCancel(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/checkOutCancel`, cond);
  }

  /**清掃完了 */
  public cleaningRoom(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/cleaningRoom`, cond);
  }

  /**清掃完了(滞在部屋) */
  public cleaningStayRoom(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/cleaningStayRoom`, cond);
  }

  /**中抜け */
  public hollow(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/hollow`, cond);
  }

  /**中抜け取消 */
  public hollowCancel(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/hollowCancel`, cond);
  }

  /**中抜けC/I */
  public hollowCheckin(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/hollowCheckin`, cond);
  }

  public hollowIsCheckin(cond: AssignInfo): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${this.roomUrl}/hollowIsCheckin`, cond);
  }

  /**中抜けC/I取消 */
  public hollowCheckinCancel(cond: AssignInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/hollowCheckinCancel`, cond);
  }

  public hollowIsCheckinCancel(cond: AssignInfo): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${this.roomUrl}/hollowIsCheckinCancel`, cond);
  }

  /**ルームチェンジ */
  public roomChange(cond: RoomsAssignedInfo[]): Observable<RoomChangeResult> {
    return this.http.post<RoomChangeResult>(`${this.baseUrl}/${this.roomUrl}/roomChange`, cond);
  }

  /**部屋の画面位置更新 */
  public updateRoomDispLocation(list: RoomInfo[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/updateRoomDispLocation`, list);
  }


  // 部屋情報削除チェック
  deleteRoomCheckAssin(room: RoomInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.roomUrl}/deleteroomcheckassign/`,room);
  }

  // 部屋情報削除チェック
  deleteRoomCheckCleaned(room: RoomInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/deleteroomcheckcleaned/`,room);
  }

  // 部屋情報削除
  deleteRoomInfoById(room: RoomInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.roomUrl}/delroomInfo/`,room);
  }

  // 部屋情報更新
  updateRoomInfo(room: RoomInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.roomUrl}/updateroominfo`, room);
  }

  // 部屋情報選択
  getRoomInfoById(room: RoomInfo): Observable<RoomInfo> {
    return this.http.post<RoomInfo>(`${this.baseUrl}/${this.roomUrl}/getroominfobyid/`,room);
  }

  // 部屋情報追加
  getRoomInfoList(room: RoomInfo): Observable<RoomInfo[]> {
    return this.http.post<RoomInfo[]>(`${this.baseUrl}/${this.roomUrl}/getlist`,room);
  }

  // 部屋情報追加
  InsertRoomInfo(room: RoomInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/addroominfo`, room);
  }

  // フロア
  GetFloorList(cond:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.dictionaryUrl}/getFloorList/`, {params: cond});
  }

  // 部屋タイプ
  GetTypeList(cond:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.dictionaryUrl}/getTypeList/`, {params: cond});
  }

  // 禁煙/喫煙
  GetIsForbidList(cond:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.dictionaryUrl}/getIsForbidList/`, {params: cond});
  }

//#region ----- 部屋割詳細 --------------------------------------------------
  /** 予約番号でアサインを取得 */
  public getAssignListByReserveNo(cond: RoomDetailsInfo): Observable<Reserve> {
    return this.http.post<Reserve>(`${this.baseUrl}/${this.roomUrl}/getAssignListByReserveNo`, cond);
  }

  /** アサイン/氏名ファイルを更新(部屋割詳細) */
  public UpdateRoomDetails(info: UpdateRoomDetails): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomUrl}/updateRoomDetails`, info);
  }
//#endregion

}
