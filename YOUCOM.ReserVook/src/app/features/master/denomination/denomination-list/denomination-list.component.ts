import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { DenominationInfo, ReceiptDivs } from '../model/denominationinfo.model';
import { DenominationService } from '../services/denomination.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-denomination-list',
  templateUrl: './denomination-list.component.html',
  styleUrls: ['./denomination-list.component.scss']
})

export class DenominationListComponent implements OnInit {

  private currentUser : User;

  denominations: DenominationInfo[];

  /** 領収区分(0:領収金額に含める, 1:領収金額に含めない) */
  public readonly receiptDivs : any[] = ReceiptDivs;

  constructor(private route: ActivatedRoute,private denominationService: DenominationService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 情報読込
    var denomination = new DenominationInfo();
    denomination.companyNo = this.currentUser.displayCompanyNo;

    this.denominationService.GetDenominationList(denomination).subscribe((res: DenominationInfo[]) => {
      this.denominations = res;
    });
  }

  // 情報削除
  delete(denominationCode: string): void {
    var delData = new DenominationInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.denominations.find(element => element.companyNo == companyNo && element.denominationCode == denominationCode);


    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '金種コード:'+ delData.denominationCode + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.DENOMINATION_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.denominationService.DeleteDenominationCheck(delData).pipe().subscribe(check => {
          switch(check){
            case 0:
              // 削除可
              this.del(delData);
              break;

            case 1:
              // 削除不可(支払方法変換マスタで使用中)
              Common.modalMessageError(Message.TITLE_ERROR, '支払方法変換マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.DENOMINATION_LIST + '001');
              return;

            case 2:
              // 削除不可(ポイント変換マスタで使用中)
              Common.modalMessageError(Message.TITLE_ERROR, 'ポイント変換マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.DENOMINATION_LIST + '002');
              return;

            case 3:
              // 削除不可(本予約かつ未精算)
              Common.modalMessageError(Message.TITLE_ERROR, '予約情報' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.DENOMINATION_LIST + '003');
              return;

            case 4:
              // 削除確認
              Common.modalMessageConfirm(Message.TITLE_CONFIRM, Message.DELETE_CONFIRM_ADJUSTCANCEL, null, MessagePrefix.CONFIRM + FunctionId.DENOMINATION_LIST + '002').then((result) =>{
                if(!result){
                  // Cancel
                  return;
                }
              // OK
              this.del(delData);
            });
          }
        });
      } else {
        // Cancel
        return;
      }
    });
  }

  del(delData: DenominationInfo){

    delData.updator = this.currentUser.userName;

    this.denominationService.DeleteDenominationInfoById(delData).pipe().subscribe(result => {
      switch(result){
        case DBUpdateResult.VersionError:
          // バージョンError
          Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.DENOMINATION_LIST + '001');
          break;
        case DBUpdateResult.Error:
          // Error
          Common.modalMessageError(Message.TITLE_ERROR, '金種マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.DENOMINATION_LIST + '004');
          break;
      }

      delData.companyNo = this.currentUser.displayCompanyNo;
      this.denominationService.GetDenominationList(delData).subscribe((res: DenominationInfo[]) => {
        this.denominations = res;
      });
    });
  }

  public dispReceiptDiv(keys : string){
    return this.receiptDivs.find(x => x.key == keys).value;
  }

}
