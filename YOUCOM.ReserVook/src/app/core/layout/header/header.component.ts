import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import * as Screenfull from 'screenfull';
import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { User, EnumRole, EnumLostFlg, EnumTrustYou} from '../../auth/auth.model';
import { SystemConst } from '../../system.const';
import { HeaderService } from './header.service';
import { CompanyInfo } from 'src/app/features/company/model/company.model';
import { CompanyService } from 'src/app/features/company/services/company.service';
import { Common } from '../../common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public loggedInUser: User;
  public loggedInCompany: CompanyInfo;

  public readonly enumRole = EnumRole;
  public readonly enumLostFlg = EnumLostFlg;
  private readonly enumTrustYou = EnumTrustYou;

  public isSuperAdmin : boolean;
  public trustyouFlg : boolean;

  public readonly divisionCode_Roomtype : string = SystemConst.DIVISION_ROOMTYPE;
  public readonly divisionCode_Floor : string = SystemConst.DIVISION_FLOOR;
  public readonly divisionCode_State : string = SystemConst.DIVISION_PLACE;
  public readonly divisionCode_Strage : string = SystemConst.DIVISION_STRAGE;

  public M_CompanyGroups: Array<CompanyInfo>;
  /** 複数施設メニュー切替不可時に使う画面表示会社のみのリスト */
  public M_MyCompanyList: Array<CompanyInfo>;
  public dispCompany: string;
  public visibleCompanySelect: boolean = true;

  constructor(private authService: AuthService
              , private router: Router
              , public header: HeaderService
              , private companyService: CompanyService
              , private route: ActivatedRoute) {

    this.loggedInUser = authService.getLoginUser();

  }

  ngOnInit(): void {

    // Checked user role is SuperAdmin
    if(this.loggedInUser.roleDivision == this.enumRole.SuperAdmin.toString()){
      this.isSuperAdmin = true;
    } else {
      this.isSuperAdmin = false;
    }

    // Checked user company enable TrustYouConnect
    if(this.loggedInUser.companyInfo.trustyouConnectDiv == this.enumTrustYou.Used.toString()){
      this.trustyouFlg = true;
    } else {
      this.trustyouFlg =false;
    }

    // Get Companies by companyGroupId
    this.getCompanyGroup();

    this.loggedInCompany = this.loggedInUser.companyInfo;

  }

  /** 同じ会社グループに属する会社を取得 */
  private getCompanyGroup() {

    // システム管理者のときは複数施設切替はしない
    if (this.isSuperAdmin) { return; }

    if (!Common.IsNullOrEmpty(this.loggedInUser.companyInfo.companyGroupId)) {
      this.companyService.getCompanyListByCompanyGroupId(this.loggedInUser.companyInfo.companyGroupId).pipe().subscribe(res => {
        this.M_CompanyGroups = res;

        // browser devtoolsでvalueを強制変更した場合、グループ外の会社の場合、強制logout
        if (this.M_CompanyGroups.findIndex(f =>f.companyNo == this.loggedInUser.displayCompanyNo) == -1) { this.logout(); }

        const company = this.M_CompanyGroups.find(f => f.companyNo == this.loggedInUser.displayCompanyNo);
        if (isNullOrUndefined(company)) { this.logout(); }
        this.M_MyCompanyList = [];
        this.M_MyCompanyList.push(company);

      });
    }
    else {
      this.M_CompanyGroups.push(this.loggedInUser.companyInfo);
    }

    this.dispCompany = this.loggedInUser.displayCompanyNo;

    return;
  }

  // 複数施設メニュー - ツールチップ文言取得
  getToolTipDEata(data){
    if(!isNullOrUndefined(this.M_CompanyGroups) && this.M_CompanyGroups.length > 0){

      if(this.header.changeableCompany){
        var tooltipCompanyInfo : CompanyInfo[] =  this.M_CompanyGroups.filter(x => x.companyNo == data);

        if(this.GetCompanyNameLength(tooltipCompanyInfo[0].companyName) > 22){
          return tooltipCompanyInfo[0].companyName;
        }else{
          return '';
        }
      }else{
        return '編集中・詳細画面では施設切替はできません。';
      }
    }
  }

  private GetCompanyNameLength (companyName : string) {

    let nameLength: number = 0;

    for (let i = 0; i < companyName.length; i++) {

      let str =  companyName.substr(i, 1);

      if(str.match(/[ -~]/) ) {
        nameLength += 1;
      } else {
        nameLength += 2;
      }
    }
    return(nameLength);
  }

  /** 画面選択会社変更イベント */
  public changeCompany(event: any){
    if(!isNullOrUndefined(event.value)) {

      if(this.authService.getDispCompanyNo() != event.value) {

        this.authService.removeDispCompanyNo();
        this.authService.setDispCompanyNo(event.value);
        location.reload();

      }

    }
  }

  toNameSearch(): void {
    this.router.navigate(['/company/namesearch']);
  }

  isFullScreen() : boolean{
    if (document.fullscreenElement == null) {
      return false;
    }
    return true;
  }

  fullScreenToggle(): void {
    if (Screenfull.isEnabled) {
      Screenfull.toggle();
    }
  }

  logout(): void {
    this.authService.Logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  toAccountSettings(): void {
    this.router.navigate(['/company/staffs/form',this.loggedInUser.companyNo, this.loggedInUser.userEmail]);
  }

  public hideMenu() : boolean{

    const baseWidth : number = 1240;
    const optionWidth : number = 155;
    const masterWidth : number = 125;

    let checkWidth : number = baseWidth;
    if(this.loggedInCompany.lostFlg == this.enumLostFlg.Used.toString() || this.trustyouFlg) checkWidth += optionWidth;
    if(this.loggedInUser.roleDivision == this.enumRole.Admin.toString()) checkWidth += masterWidth;

    if (document.documentElement.clientWidth <= checkWidth) {
      return true;
    }else{
      return false;
    }
  }

}
