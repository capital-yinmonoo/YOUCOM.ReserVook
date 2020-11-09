import { Base } from './../../../../shared/model/baseinfo.model';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { Common } from 'src/app/core/common';
import { MstFacilityInfo } from 'src/app/features/facility/model/facility.model';
import { FacilityService } from 'src/app/features/facility/services/facility.service';

@Component({
  selector: 'app-facility-list',
  templateUrl: './facility-list.component.html',
  styleUrls: ['./facility-list.component.scss']
})

export class FacilityListComponent implements OnInit {

  private currentUser : User;
  public facilitys: MstFacilityInfo[];
  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private facilityService: FacilityService,
              private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void {

    // 会場マスタ読込
    let cond = new Base();
    cond.companyNo = this.currentUser.displayCompanyNo;

    this.facilityService.getList(cond).subscribe((res: MstFacilityInfo[]) => {
      this.facilitys = res;
    });

  }

  //** 削除前チェック */
  public checkBeforeDelete(facilityCode: string): void {

    const facility = this.facilitys.find(f => f.facilityCode == facilityCode);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '会場:'+ facility.facilityName + "<br>" + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.FACILITY_LIST + '001').then((result) => {
      if(result){

        this.facilityService.checkBeforeDelete(facility).pipe().subscribe(check => {

          switch (check) {
            case 0: // Delete
              this.delete(facility);
              return;

            case -1: // Used Error
              Common.modalMessageError(Message.TITLE_ERROR, '会場:'+ facility.facilityName + "<br>" + Message.DELETE_DATA_FAULT_FOR_USED, MessagePrefix.ERROR + FunctionId.FACILITY_LIST + '001');
              return;

            default: // Error
              Common.modalMessageError(Message.TITLE_ERROR, '会場:'+ facility.facilityName + "<br>" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY_LIST + '002');
              return;
          }

        });
      }

    });

  }


  /** 削除処理 */
  private delete(facility: MstFacilityInfo){

    // 条件セット
    facility.updator = this.currentUser.userName;

    this.facilityService.delete(facility).pipe().subscribe(result => {
      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.FACILITY_LIST + '001')
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError(Message.TITLE_ERROR, '会場:'+ facility.facilityName + "<br>" +  Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY_LIST + '003');
      }

      this.ngOnInit();

    });
  }

}
