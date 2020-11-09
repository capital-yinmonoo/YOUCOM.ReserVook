import { Message, DBUpdateResult, MessagePrefix, FunctionId } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { RoomTypeConvertInfo } from '../model/roomtypeconvert.model';
import { RoomTypeConvertService } from '../services/roomtypeconvert.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-roomtypeconvert-list',
  templateUrl: './roomtypeconvert-list.component.html',
  styleUrls: ['./roomtypeconvert-list.component.scss']
})
export class RoomTypeConvertListComponent implements OnInit {

  private currentUser : User;
  roomtypeconverts: RoomTypeConvertInfo[];

  constructor(private route: ActivatedRoute,private roomTypeConvertService: RoomTypeConvertService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
   }

   ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // 情報読込
    var condition = new RoomTypeConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.roomTypeConvertService.GetRoomTypeConvertList(condition).subscribe((res: RoomTypeConvertInfo[]) => {
      this.roomtypeconverts = res;
    });
  }

  // 情報削除
  delete(scCd:string,scRmtypeCd: string): void {
    var delData = new RoomTypeConvertInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.roomtypeconverts.find(element => element.companyNo == companyNo && element.scCd == scCd && element.scRmtypeCd == scRmtypeCd);

    delData.updateClerk = this.currentUser.userName;

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, 'サイト部屋タイプコード:'+ delData.scRmtypeCd + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.ROOMTYPECONVERT_LIST + '001').then((result) => {

      if(result){
        this.roomTypeConvertService.DeleteRoomTypeConvert(delData).pipe().subscribe(result => {
          if (result == DBUpdateResult.VersionError) {
            // バージョンError
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMTYPECONVERT_LIST + '001')
          }
          if (result == DBUpdateResult.Error) {
            // Error
            Common.modalMessageError(Message.TITLE_ERROR, '部屋タイプ変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMTYPECONVERT_LIST + '001');
          }
          delData.companyNo = this.currentUser.displayCompanyNo;
          this.roomTypeConvertService.GetRoomTypeConvertList(delData).subscribe((res: RoomTypeConvertInfo[]) => {
            this.roomtypeconverts = res;
          });
        });
      }
    });
  }
}
