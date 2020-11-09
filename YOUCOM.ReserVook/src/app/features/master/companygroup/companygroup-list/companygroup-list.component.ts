import { CompanyGroupService } from './../services/companygroup.service';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { User } from '../../../../core/auth/auth.model';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Common } from 'src/app/core/common';
import { Base } from 'src/app/shared/model/baseinfo.model';
import { CompanyGroupInfo } from '../model/companygroup.model';

@Component({
  selector: 'app-companygroup-list',
  templateUrl: './companygroup-list.component.html',
  styleUrls: ['./companygroup-list.component.scss']
})
export class CompanyGroupListComponent implements OnInit {

  /** ログインユーザー */
  private currentUser: User;

  /** 会社グループマスタリスト */
  public companyGroupList: CompanyGroupInfo[];

  public ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private authService: AuthService
              , private companyGroupService: CompanyGroupService) {

    this.currentUser = this.authService.getLoginUser();

  }

  public ngOnInit(): void {

    this.companyGroupService.getCompanyGroupList().subscribe((res: CompanyGroupInfo[]) => {
      this.companyGroupList = res;
    });

  }

  /** 削除クリック */
  public onDelete(companyGroupId: string) {

    const companyGroup = this.companyGroupList.find(f => f.companyGroupId == companyGroupId);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, "会社グループ名:" + companyGroup.companyGroupName + "<br>" + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.COMPANYGROUP_LIST + '001').then((result) =>{

      if(result){

        this.companyGroupService.checkBeforeDelete(companyGroup).pipe().subscribe(check => {
          // OK
          switch(check){
            case DBUpdateResult.Success:
              this.delete(companyGroup);
              break;

            case DBUpdateResult.UsedError:
              // 使用済/予定は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, "会社グループ名:" + companyGroup.companyGroupName + "<br>" +  Message.DELETE_DATA_FAULT_FOR_USED, MessagePrefix.ERROR + FunctionId.COMPANYGROUP_LIST + '001');
              break;

            default:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, "会社グループマスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANYGROUP_LIST + '002');
              break;

          }

        });

      } else {
        // cancel
        return;
      }

    });

  }

　/** 削除実行 */
  private delete(info: CompanyGroupInfo) {

    // 条件セット
    info.updator = this.currentUser.userName;

    this.companyGroupService.deleteCompanyGroup(info).pipe().subscribe(result => {

      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.COMPANYGROUP_LIST + '001');
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError (Message.TITLE_ERROR, '会社グループマスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANYGROUP_LIST + '003');
      }

      // data reload
      this.ngOnInit();

    });

  }

}
