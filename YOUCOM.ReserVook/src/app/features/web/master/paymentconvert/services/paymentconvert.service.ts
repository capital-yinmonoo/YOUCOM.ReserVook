import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { PaymentConvertInfo } from '../model/paymentconvert.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentConvertService extends HttpService {

  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
   }

   // URLアドレス
  paymentconvertUrl: string = "paymentconvert";
  scnmUrl: string = "scname";
  siteConvertUrl: string = "siteconvert";
  codeNameUrl: string = "codename";
  denominationUrl: string = "denomination";

  // 情報読込-画面表示用
  GetPaymentConvertList(paymentConvert: PaymentConvertInfo): Observable<PaymentConvertInfo[]> {
    return this.http.post<PaymentConvertInfo[]>(`${this.baseUrl}/${this.paymentconvertUrl}/getList`, paymentConvert);
  }

  // 情報読込-編集,削除用
  GetPaymentConvertById(paymentConvert: PaymentConvertInfo): Observable<PaymentConvertInfo> {
    return this.http.post<PaymentConvertInfo>(`${this.baseUrl}/${this.paymentconvertUrl}/getListById`, paymentConvert);
  }

  // 情報追加
  InsertPaymentConvert(paymentConvert: PaymentConvertInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.paymentconvertUrl}/addPaymentConvert`, paymentConvert);
  }

  // 情報更新
  UpdatePaymentConvert(paymentConvert: PaymentConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.paymentconvertUrl}/updatePaymentConvert`, paymentConvert);
  }

  // 情報削除
  DeletePaymentConvert(paymentConvert: PaymentConvertInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.paymentconvertUrl}/delPaymentConvert`, paymentConvert);
  }

  // サイトコントローラー名取得(追加・編集画面用)
  GetScCdList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.scnmUrl}/getScNameList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // サイトコード取得(追加・編集画面用)
  GetSiteCodeList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.siteConvertUrl}/getSiteCodeList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 決済方法取得(追加・編集画面用)
  GetSettlementList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.codeNameUrl}/getSettlementList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }

  // 金種取得(追加・編集画面用)
  GetDenominationList(hParams:HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.denominationUrl}/getDenominationList/`, {params: hParams})
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<any[]>('getHeroes', []))
      );
  }
}
