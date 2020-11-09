import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { RoomTypeConvertInfo} from '../model/roomtypeconvert.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeConvertService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }


  // URLアドレス
  roomtypeconvertUrl: string = "roomtypeconvert";
  scnmUrl: string = "scname";
  codenameUrl: string = "codename";

  // 情報読込-画面表示用
  GetRoomTypeConvertList(roomTypeConvert: RoomTypeConvertInfo): Observable<RoomTypeConvertInfo[]> {
    return this.http.post<RoomTypeConvertInfo[]>(`${this.baseUrl}/${this.roomtypeconvertUrl}/getlist`, roomTypeConvert);
  }

  // 情報読込-編集,削除用
  GetRoomTypeConvertById(roomTypeConvert: RoomTypeConvertInfo): Observable<RoomTypeConvertInfo> {
    return this.http.post<RoomTypeConvertInfo>(`${this.baseUrl}/${this.roomtypeconvertUrl}/getlistbyid`, roomTypeConvert);
  }

  // 情報追加
  InsertRoomTypeConvert(roomTypeConvert: RoomTypeConvertInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.roomtypeconvertUrl}/addroomtypeconvert`, roomTypeConvert);
  }

  // 情報更新
  UpdateRoomTypeConvert(roomTypeConvert: RoomTypeConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.roomtypeconvertUrl}/updateroomtypeconvert`, roomTypeConvert);
  }

  // 情報削除
  DeleteRoomTypeConvert(roomTypeConvert: RoomTypeConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.roomtypeconvertUrl}/delroomtypeconvert`, roomTypeConvert);
  }


  // サイトコントローラー名取得(追加・編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 部屋タイプ取得(追加・編集画面用)
  GetRoomTypeList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codenameUrl}/getTypeList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }
}
