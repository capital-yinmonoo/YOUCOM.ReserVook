import { Message, DBUpdateResult, MessagePrefix, FunctionId } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { SiteConvertInfo } from '../model/siteconvert.model';
import { SiteConvertService } from '../services/siteconvert.service';
import { SiteConvertCommon } from '../../siteconvert/siteconvert.common';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-siteconvert-list',
  templateUrl: './siteconvert-list.component.html',
  styleUrls: ['./siteconvert-list.component.scss']
})
export class SiteConvertListComponent implements OnInit {

  private currentUser : User;
  siteconverts: SiteConvertInfo[];

  constructor(private route: ActivatedRoute,private siteConvertService: SiteConvertService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // 情報読込
    var condition = new SiteConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.siteConvertService.GetSiteConvertList(condition).subscribe((res: SiteConvertInfo[]) => {
      this.siteconverts = res;
    });
  }

  // 人数計算区分表示用
  divisionName(value){
    var divisionName = SiteConvertCommon.PeopleDivision.find(x => x.key == value).value;
    return divisionName;
  }

  // 利用人数取込設定表示用
  position(value){
    var position = SiteConvertCommon.PosisionsRadio.find(x => x.key == value).value;
    return position;
  }

  // 情報削除
  delete(scCd:string,scSiteCd: string): void {
    var delData = new SiteConvertInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.siteconverts.find(element => element.companyNo == companyNo && element.scCd == scCd && element.scSiteCd == scSiteCd);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, 'サイトコード:'+ delData.scSiteCd + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.SITECONVERT_LIST + '001').then((result) => {
      if(result){
        // OK
        this.siteConvertService.DeleteSiteCdCheck(delData).pipe().subscribe(check => {
          switch(check){
            case 0:
              // 削除可
              delData.updateClerk = this.currentUser.userName;

              this.siteConvertService.DeleteSiteConvert(delData).pipe().subscribe(result => {
                if (result == DBUpdateResult.VersionError) {
                  // バージョンError
                  Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.SITECONVERT_LIST + '001')
                }
                if (result == DBUpdateResult.Error) {
                  // Error
                  Common.modalMessageError(Message.TITLE_ERROR, 'サイト変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SITECONVERT_LIST + '001');
                }
                delData.companyNo = this.currentUser.displayCompanyNo;
                this.siteConvertService.GetSiteConvertList(delData).subscribe((res: SiteConvertInfo[]) => {
                  this.siteconverts = res;
                });
              });
              break;

            case 1:
              // 削除不可(支払方法変換マスタで使用中)
              Common.modalMessageError(Message.TITLE_ERROR, '支払方法変換マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.SITECONVERT_LIST + '002');
              return;

            case 2:
              // 削除不可(ポイント変換マスタで使用中)
              Common.modalMessageError(Message.TITLE_ERROR, 'ポイント変換マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.SITECONVERT_LIST + '003');
              return;
          }
        });
      }else{
        // Cancel
        return;
      }
    });
  }
}
