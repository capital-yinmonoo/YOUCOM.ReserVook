import { Message, DBUpdateResult, FunctionId, MessagePrefix } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { PointConvertInfo } from '../model/pointconvert.model';
import { PointConvertService } from '../services/pointconvert.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-pointconvert-list',
  templateUrl: './pointconvert-list.component.html',
  styleUrls: ['./pointconvert-list.component.scss']
})
export class PointConvertListComponent implements OnInit {

  private currentUser : User;
  pointconverts: PointConvertInfo[];

  constructor(private route: ActivatedRoute,private pointConvertService: PointConvertService,private authService:AuthService, private dialog: MatDialog) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 情報読込
    var condition = new PointConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.pointConvertService.GetPointConvertList(condition).subscribe((res: PointConvertInfo[]) => {
      this.pointconverts = res;
    });
  }

  // 情報削除
  delete(scCd:string,scSiteCd: string,scPntsDiscntNm: string): void {
    var delData = new PointConvertInfo();
    var companyNo = this.currentUser.displayCompanyNo;

    delData = this.pointconverts.find(element => element.companyNo == companyNo && element.scCd == scCd && element.scSiteCd == scSiteCd && element.scPntsDiscntNm == scPntsDiscntNm);

    var dispPntsDiscntName = delData.pntsDiscntName;

    if(dispPntsDiscntName.length == 0){
      dispPntsDiscntName = "[空欄]";
    }

    delData.updateClerk = this.currentUser.userName;

    // 確認メッセージ
    Common.modalMessageConfirm('削除確認', 'サイト名:'+ delData.siteCdName + '<br>' + 'ポイント割引・補助金名:' + dispPntsDiscntName + '<br>' + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.POINTCONVERT_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.pointConvertService.DeletePointConvert(delData).pipe().subscribe(result => {
          switch(result){
            case DBUpdateResult.VersionError:
              // バージョンError
              Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.POINTCONVERT_LIST + '001');
              break;
            case DBUpdateResult.Error:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, 'ポイント変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.POINTCONVERT_LIST + '001');
              break;
          }

          delData.companyNo = this.currentUser.displayCompanyNo;
          this.pointConvertService.GetPointConvertList(delData).subscribe((res: PointConvertInfo[]) => {
            this.pointconverts = res;
          });
        });

      } else {
          // Cancel
          return;
      }
    });

  }
}
