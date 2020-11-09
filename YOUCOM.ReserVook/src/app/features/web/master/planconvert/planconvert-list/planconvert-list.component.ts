import { Message, DBUpdateResult, FunctionId, MessagePrefix } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { PlanConvertInfo } from '../model/planconvert.model';
import { PlanConvertService } from '../services/planconvert.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-planconvert-list',
  templateUrl: './planconvert-list.component.html',
  styleUrls: ['./planconvert-list.component.scss']
})
export class PlanConvertListComponent implements OnInit {

  private currentUser : User;
  planconverts: PlanConvertInfo[];

  constructor(private route: ActivatedRoute,private planConvertService: PlanConvertService,private authService:AuthService, private dialog: MatDialog) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 情報読込
    var condition = new PlanConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.planConvertService.GetPlanConvertList(condition).subscribe((res: PlanConvertInfo[]) => {
      this.planconverts = res;
    });
  }

  // 情報削除
  delete(scCd:string, scPackagePlanCd: string,scMealCond: string,scSpecMealCond: string): void {
    var delData = new PlanConvertInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    var plancode = scPackagePlanCd;
    if(plancode.length == 0){
      plancode = "[空欄]";
    }

    delData = this.planconverts.find(element => element.companyNo == companyNo && element.scCd == scCd
                                    && element.scPackagePlanCd == plancode && element.scMealCond == scMealCond && element.scSpecMealCond == scSpecMealCond);


    delData.updateClerk = this.currentUser.userName;

    // 確認メッセージ
    Common.modalMessageConfirm('削除確認', 'プランコード:' + plancode + '<br>食事条件:' + delData.scMealCond + '<br>食事有無情報:' + delData.scSpecMealCond + '<br>' + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.PLANCONVERT_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.planConvertService.DeletePlanConvert(delData).pipe().subscribe(result => {
          switch(result){
            case DBUpdateResult.VersionError:
              // バージョンError
              Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.PLANCONVERT_LIST + '001');
              break;
            case DBUpdateResult.Error:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, 'プラン変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.PLANCONVERT_LIST + '001');
              break;
          }

          delData.companyNo = this.currentUser.displayCompanyNo;
          this.planConvertService.GetPlanConvertList(delData).subscribe((res: PlanConvertInfo[]) => {
            this.planconverts = res;
          });
        });

      } else {
          // Cancel
          return;
      }
    });

  }
}
