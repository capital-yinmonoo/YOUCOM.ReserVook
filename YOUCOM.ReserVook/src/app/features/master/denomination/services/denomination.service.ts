import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/network/http.service';
import { DenominationInfo} from '../model/denominationinfo.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DenominationService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  denominationUrl: string = "denomination";

  // 情報読込-画面表示用
  GetDenominationList(denomination: DenominationInfo): Observable<DenominationInfo[]> {
    return this.http.post<DenominationInfo[]>(`${this.baseUrl}/${this.denominationUrl}/getList`, denomination);
  }

  // 情報読込-編集,削除用
  GetDenominationById(denomination: DenominationInfo): Observable<DenominationInfo> {
    return this.http.post<DenominationInfo>(`${this.baseUrl}/${this.denominationUrl}/getListbyid`, denomination);
  }

  // 情報追加
  InsertDenomination(denomination: DenominationInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.denominationUrl}/addDenomination`, denomination);
  }

  // 情報更新
  UpdateDenomination(denomination: DenominationInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.denominationUrl}/updateDenomination`, denomination);
  }

  // 情報削除
  DeleteDenominationInfoById(denomination: DenominationInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.denominationUrl}/delDenomination`, denomination);
  }

  // 情報削除チェック
  DeleteDenominationCheck(denomination: DenominationInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.denominationUrl}/deleteDenominationCheck`,denomination);
  }
}
