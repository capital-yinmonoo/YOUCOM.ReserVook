import { HeaderService } from 'src/app/core/layout/header/header.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Staff } from '../../../staffs/model/staff.model';
import { StaffService } from '../../../staffs/services/staff.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { DBUpdateResult, FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})

export class StaffListComponent implements OnInit, OnDestroy {

  private currentUser : User;
  companyNo:string;

  staffs: Staff[];

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private router: ActivatedRoute
              , private staffService: StaffService
              , private authService: AuthService
              , private dialog: MatDialog
              , private header: HeaderService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit(): void {

    this.header.lockCompanySeleter();

    // 情報読込
    this.staffService.GetStaffList().subscribe((res: Staff[]) => {
      this.staffs = res;
    });
  }

   // 情報削除
  delete(companyNo: string,userEmail: string): void {
    var delData = new Staff();
    delData = this.staffs.find(element => element.companyNo == companyNo && element.userEmail == userEmail );
    delData.userEmailOrigin = delData.userEmail;
    delData.updator = this.currentUser.userName;;

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, 'メールアドレス:'+ delData.userEmail + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.STAFFS_LIST + '001').then((result) =>{
      if (result) {
        // OK
        this.staffService.DeleteStaff(delData).pipe().subscribe(result => {
          switch(result){
            case DBUpdateResult.VersionError:
              // バージョンError
              Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.STAFFS_LIST + '001');
              break;
            case DBUpdateResult.Error:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, 'ユーザー管理' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.STAFFS_LIST + '001');
              break;
          }

          this.staffService.GetStaffList().subscribe((res: Staff[]) => {
            this.staffs = res;
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
