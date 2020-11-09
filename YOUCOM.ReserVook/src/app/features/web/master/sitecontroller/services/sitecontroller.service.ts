import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../../core/network/http.service';
import { SiteControllerInfo} from '../model/sitecontroller.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class SiteControllerService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  siteControllerUrl: string = "sitecontroller";

  // 情報読込-一覧用
  GetSiteControllerList(sitecontroller: SiteControllerInfo): Observable<SiteControllerInfo[]> {
    return this.http.post<SiteControllerInfo[]>(`${this.baseUrl}/${this.siteControllerUrl}/getSiteControllerList`, sitecontroller);
  }

  // 情報読込-編集用
  GetSiteControllerById(sitecontroller: SiteControllerInfo): Observable<SiteControllerInfo> {
    return this.http.post<SiteControllerInfo>(`${this.baseUrl}/${this.siteControllerUrl}/getlistbyid`, sitecontroller);
  }

  // 情報更新
  UpdateSiteController(sitecontroller: SiteControllerInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.siteControllerUrl}/updatesitecontroller`, sitecontroller);
  }
}
