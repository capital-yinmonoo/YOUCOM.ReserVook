import { Message, DBUpdateResult, SystemConst, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { RoomService } from '../../../rooms/services/room.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { RoomInfo } from '../../../rooms/model/rooms.model';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})

export class RoomListComponent implements OnInit {

  private currentUser : User;

  public rooms: RoomInfo[];

  /**部屋位置未設定ありフラグ */
  public exsitNotSetLocation: boolean = false;

  constructor(private roomService: RoomService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    // 部屋情報読込み
    var room = new RoomInfo();
    room.companyNo = this.currentUser.displayCompanyNo;
    this.roomService.getRoomInfoList(room).subscribe((res: RoomInfo[]) => {
      this.rooms = res;

      // 部屋位置未設定ありチェック
      if (this.rooms.findIndex(f => f.status != SystemConst.STATUS_UNUSED && (f.rowIndex == null || f.columnIndex == null)) > -1) {
        this.exsitNotSetLocation = true;
      }

    });

  }

  // IDによる部屋情報の削除
  delete(roomNo: string): void {

    var room = new RoomInfo();
    room = this.rooms.find(element => element.roomNo == roomNo);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '部屋:'+ room.roomName + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.ROOMS_LIST + '001').then((result) => {
      if(result){

        this.roomService.deleteRoomCheckAssin(room).pipe().subscribe(check => {
          if(check > 0){
            Common.modalMessageError(Message.TITLE_ERROR, '部屋:'+ room.roomName + Message.DELETE_DATA_FAULT_FOR_USED, MessagePrefix.ERROR + FunctionId.ROOMS_LIST + '001');
            return;
          }

          this.roomService.deleteRoomCheckCleaned(room).pipe().subscribe(check => {
            if(check > 0){
              Common.modalMessageConfirm(Message.TITLE_CONFIRM, '該当部屋のC/O取消、精算取消ができなくなります。よろしいですか？', null, MessagePrefix.CONFIRM + FunctionId.ROOMS_LIST + '002').then((result) => {
                if(result){
                  // 削除
                  this.deleteInfo(room);
                }
              });

            }else{
              // 削除
              this.deleteInfo(room);
            }
          });
        });
      }
    });

  }

  deleteInfo(room: RoomInfo){

    room.updator = this.currentUser.userName;

    this.roomService.deleteRoomInfoById(room).pipe().subscribe(result => {
      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMS_LIST + '001')
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError(Message.TITLE_ERROR, '部屋マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMS_LIST + '002');
      }
      room.companyNo = this.currentUser.displayCompanyNo;
      this.roomService.getRoomInfoList(room).subscribe((res: RoomInfo[]) => {
        this.rooms = res;
      });
    });
  }

}
