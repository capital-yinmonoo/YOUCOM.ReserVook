import { Message, DBUpdateResult, MessagePrefix, FunctionId } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { PaymentConvertInfo } from '../model/paymentconvert.model';
import { PaymentConvertService } from '../services/paymentconvert.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-paymentconvert-list',
  templateUrl: './paymentconvert-list.component.html',
  styleUrls: ['./paymentconvert-list.component.scss']
})

export class PaymentConvertListComponent implements OnInit {

  private currentUser : User;
  paymentconverts: PaymentConvertInfo[];

  constructor(private route: ActivatedRoute,private paymentConvertService: PaymentConvertService,private authService:AuthService, private dialog: MatDialog) {
    this.currentUser = this.authService.getLoginUser();

  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 情報読込
    var condition = new PaymentConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.paymentConvertService.GetPaymentConvertList(condition).subscribe((res: PaymentConvertInfo[]) => {
      this.paymentconverts = res;
    });
  }

  // 情報削除
  delete(scCd:string,scSiteCd: string,scPaymentOpts: string): void {
    var delData = new PaymentConvertInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.paymentconverts.find(element => element.companyNo == companyNo && element.scCd == scCd && element.scSiteCd == scSiteCd && element.scPaymentOpts == scPaymentOpts);

    delData.updateClerk = this.currentUser.userName;

    Common.modalMessageConfirm('削除確認', 'サイト名:'+ delData.siteCdName + '<br>' + '決済方法:' + delData.scPaymentOptsName + '<br>' + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.PAYMENTCONVERT_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.paymentConvertService.DeletePaymentConvert(delData).pipe().subscribe(result => {
          switch(result){
            case DBUpdateResult.VersionError:
              // バージョンError
              Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.PAYMENTCONVERT_LIST + '001');
              break;
            case DBUpdateResult.Error:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, '支払方法変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.PAYMENTCONVERT_LIST + '001');
              break;
          }

          delData.companyNo = this.currentUser.displayCompanyNo;
          this.paymentConvertService.GetPaymentConvertList(delData).subscribe((res: PaymentConvertInfo[]) => {
            this.paymentconverts = res;
          });
        });

      } else {
        // Cancel
        return;
      }
      return;
    });
  }
}
