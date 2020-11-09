import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/network/http.service';
import { CompanyInfo } from '../model/company.model';

@Injectable({
  providedIn: 'root'
})

export class CompanyService extends HttpService {

  constructor(public http: HttpClient) {
    super(http);
  }

  getCompanyList(): Observable<CompanyInfo[]> {
    return this.http.get<CompanyInfo[]>(`${this.baseUrl}/company/getCompanyList`);
  }

  getCompanyListByCompanyGroupId(companyGroupId: string): Observable<CompanyInfo[]> {
    return this.http.get<CompanyInfo[]>(`${this.baseUrl}/company/getCompanyListByCompanyGroupId/${companyGroupId}`);
  }

  getCompany(companyNo: string): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(`${this.baseUrl}/company/getCompanyByPK/${companyNo}`);
  }

  addCompany(company: CompanyInfo): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/company/addCompany`, company);
  }

  deleteCompany(company: CompanyInfo): Observable<number>{
    return this.http.put<number>(`${this.baseUrl}/company/deleteCompany/`,company);
  }

  updateCompany(company: CompanyInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/company/updateCompany`, company);
  }

  updateImage(formData: FormData): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/company/updateImage`, formData);
  }

  getCompanyImage(id: string){
    const url = `${this.baseUrl}/company/getCompanyImage/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

}
