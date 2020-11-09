import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/network/http.service';
import { CustomerInfo, CustomerRegInfo} from '../model/customerinfo.model';
import { AuthService } from '../../../../core/auth/auth.service';


@Injectable({
  providedIn: 'root'
})

export class CustomerService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  customerUrl: string = "customer";

  // 顧客情報読込-画面表示用
  GetCustomerList(customer: CustomerInfo): Observable<CustomerInfo[]> {
    return this.http.post<CustomerInfo[]>(`${this.baseUrl}/${this.customerUrl}/getCustomerList`, customer);
  }

  // 顧客情報読込-編集,削除用
  GetCustomerById(customer: CustomerInfo): Observable<CustomerInfo> {
    return this.http.post<CustomerInfo>(`${this.baseUrl}/${this.customerUrl}/getCustomerById`, customer);
  }

  // 顧客情報追加
  InsertCustomer(customer: CustomerInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.customerUrl}/addCustomer`, customer);
  }

  // 顧客情報追加(顧客番号を返す)
  InsertCustomerForReserve(customer: CustomerInfo): Observable<CustomerRegInfo> {
    return this.http.post<CustomerRegInfo>(`${this.baseUrl}/${this.customerUrl}/addCustomerForReserve`, customer);
  }

  // 顧客情報更新
  UpdateCustomer(customer: CustomerInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.customerUrl}/updateCustomer`, customer);
  }

  // 顧客情報削除
  DeleteCustomerInfoById(customer: CustomerInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.customerUrl}/delCustomer`, customer);
  }
}
