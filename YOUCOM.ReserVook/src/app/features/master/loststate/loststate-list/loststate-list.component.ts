import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { LostStateInfo } from '../model/loststate.model';
import { LostStateService } from '../services/loststate.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/core/common';
import { LostStateCommon } from '../loststate.common';

@Component({
  selector: 'app-loststate-list',
  templateUrl: './loststate-list.component.html',
  styleUrls: ['./loststate-list.component.scss']
})
export class LostStateListComponent implements OnInit {

  private currentUser : User;

  lostStates: LostStateInfo[];

  constructor(private route: ActivatedRoute,private lostStateService: LostStateService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
   }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 情報読込
    var lostState = new LostStateInfo();
    lostState.companyNo = this.currentUser.displayCompanyNo;

    this.lostStateService.GetLostStateList(lostState).subscribe((res: LostStateInfo[]) => {
      this.lostStates = res;
    });

  }

  // 設定色表示用
  colors(value){
    var colors = LostStateCommon.Colors.find(x => x.key == value).value;
    return colors;
  }

  // 初期値フラグ表示用
  defaults(value){
    var defaults = LostStateCommon.Default.find(x => x.key == value).value;
    return defaults;
  }


  // 削除
  delete(itemStateCode: string): void {
    var delData = new LostStateInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.lostStates.find(element => element.companyNo == companyNo && element.itemStateCode == itemStateCode);


    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '状態コード:'+ delData.itemStateCode + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.LOSTSTATE_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.lostStateService.DeleteLostStateCheck(delData).pipe().subscribe(check => {
          switch(check){
            case 0:
              delData.updator = this.currentUser.userName;

              this.lostStateService.DeleteLostStateInfoById(delData).pipe().subscribe(result => {
                switch(result){
                  case DBUpdateResult.VersionError:
                    // バージョンError
                    Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.LOSTSTATE_LIST + '001');
                    break;
                  case DBUpdateResult.Error:
                    // Error
                    Common.modalMessageError(Message.TITLE_ERROR, '忘れ物状態設定マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTSTATE_LIST + '001');
                    break;
                }
                delData.companyNo = this.currentUser.displayCompanyNo;
                this.lostStateService.GetLostStateList(delData).subscribe((res: LostStateInfo[]) => {
                  this.lostStates = res;
                });
              });
              break;

            case 1:
              // 削除不可(支払方法変換マスタで使用中)
              Common.modalMessageError(Message.TITLE_ERROR, '忘れ物一覧' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.LOSTSTATE_LIST + '002');
              return;
            }
          });
      } else {
        // Cancel
        return;
      }
    });
  }
}
