import { User } from './../../../../core/auth/auth.model';
import { isNullOrUndefined } from 'util';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import { Common } from 'src/app/core/common';
import { RoomService } from 'src/app/features/rooms/services/room.service';
import { RoomInfo } from 'src/app/features/rooms/model/rooms.model';

@Component({
  selector: 'app-room-display-location',
  templateUrl: './room-display-location.component.html',
  styleUrls: ['./room-display-location.component.scss']
})

export class RoomDisplayLocationComponent implements OnInit, OnDestroy {

  /**ドラックドロップグループ名 未設定=>部屋テーブル用 */
  public readonly DRAGDROP_SETTING = "DDSetting";
  /**ドラックドロップグループ名 部屋テーブル間用 */
  public readonly DRAGDROP_ROOMCHANGE = "DDRoomChange";

  /**禁煙喫煙区分 禁煙*/
  public readonly CODENAMEDIVISION_NONSMOKING = "1";
  /**禁煙喫煙区分 喫煙*/
  public readonly CODENAMEDIVISION_SMOKING = "2";

  /**最大行数*/
  private readonly MAX_ROWS = 10;
  /**最大列数*/
  private readonly MAX_COLUMNS = 13;

  /**部屋テーブル*/
  public roomsTable: RoomInfo[][];
  public currentMaxRow: number;
  public currentMaxColumn: number;

  /**未設定リスト*/
  public noSettingList: RoomInfo[];

  /**ログインユーザー情報*/
  private currentUser: User;

  /**現在のElement保持用 */
  private curElement: Element;

  /**初回フラグ */
  private isFirstOpen: boolean = true;

  private subs = new Subscription();

//#region Event Method
  constructor(private dragulaService: DragulaService,
              private roomService: RoomService,
              private authService: AuthService) {

    this.currentUser = this.authService.getLoginUser();

  //#region NoSettingList => RoomTable DragAndDrop Event

    /** noSettingListList => RoomTable CreateGroup */
    this.dragulaService.createGroup(this.DRAGDROP_SETTING, {
      // back to origin if outside of containers
      revertOnSpill: true,

      // accept drop or not
      accepts: this.acceptNoSettingDrop
    });

    /**noSettingList => RoomTable Drop */
    this.subs.add(this.dragulaService.drop(this.DRAGDROP_SETTING)
      .subscribe(({ el, target }) => {
        this.dromRoomTableFromList(el, target);
        this.getRoomList();
      })
    );

    /**noSettingList => RoomTable DragEnd */
    this.subs.add(this.dragulaService.dragend(this.DRAGDROP_SETTING)
      .subscribe(({ el }) => {
        this.targetMoveout();
      })
    );
  //#endregion

  //#region RoomTable DragAndDrop Event

    /** RoomTable => RoomTable CreateGroup */
    this.dragulaService.createGroup(this.DRAGDROP_ROOMCHANGE, {
      // back to origin if outside of containers
      revertOnSpill: true,

      // accept drop or not
      accepts: this.acceptRoomsDrop
    });

    /**RoomTable => RoomTable Drop */
    this.subs.add(this.dragulaService.drop(this.DRAGDROP_ROOMCHANGE)
      .subscribe(({ el, target }) => {
        this.dromRoomTable(el, target);
        this.getRoomList();
      })
    );

    /**RoomTable => RoomTable DragEnd */
    this.subs.add(this.dragulaService.dragend(this.DRAGDROP_ROOMCHANGE)
      .subscribe(({ el }) => {
        this.targetMoveout();
      })
    );
  //#endregion

  }

  ngOnDestroy() {
    this.dragulaService.destroy(this.DRAGDROP_SETTING);
    this.dragulaService.destroy(this.DRAGDROP_ROOMCHANGE);
    this.subs.unsubscribe();
  }

  ngOnInit(){
    this.getRoomList();
  }

  /**行列数変更イベント
   * @param add True:Add False:Remove
   * @param row True:Row False:Column
   */
  public onChangeRowColumn(add: boolean, row: boolean){

    if(row) { //行数
      if(add){ // 追加
        if(this.checkAddRowColumn(row)){
          this.currentMaxRow++;
        }
      } else { // 減
        if(this.checkRemoveRowColumn(row)){
          this.currentMaxRow--;
        }
      }
    } else { //列数
      if(add){ // 追加
        if(this.checkAddRowColumn(row)){
          this.currentMaxColumn++;
        }
      } else { // 減
        if(this.checkRemoveRowColumn(row)){
          this.currentMaxColumn--;
        }
      }
    }

    this.getRoomList();

  }

  /**行列数チェック 減少時 */
  private checkRemoveRowColumn(row: boolean): boolean{

    if(row){
      if(this.currentMaxRow == 0){
        Common.modalMessageError("エラー","行数は0以下にできません。", MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '001');
        return false;
      }

      for(let i = 0; i <= this.currentMaxColumn; i++){
        if(!(isNullOrUndefined(this.roomsTable[this.currentMaxRow][i].roomNo) || this.roomsTable[this.currentMaxRow][i].roomNo == "" )) {
          Common.modalMessageError("エラー",`${this.currentMaxRow + 1}行目に部屋が設定されているため、減らせません。`, MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '002');
          return false;
        }
      }


    } else {
      if(this.currentMaxColumn == 0){
        Common.modalMessageError("エラー","列数は0以下にできません。", MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '003');
        return false;
      }

      for(let i = 0; i <= this.currentMaxRow; i++){
        if(!(isNullOrUndefined(this.roomsTable[i][this.currentMaxColumn].roomNo) || this.roomsTable[i][this.currentMaxColumn].roomNo == "" )) {
          Common.modalMessageError("エラー",`${this.currentMaxColumn + 1}列目に部屋が設定されているため、減らせません。`, MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '004');
          return false;
        }
      }

    }

    return true;
  }

  /**行列数チェック 増加時 */
  private checkAddRowColumn(row: boolean): boolean{

    if(row){
      if(this.currentMaxRow == this.MAX_ROWS - 1){
        Common.modalMessageError("エラー",`行数は${this.MAX_ROWS}以上にできません。`, MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '005');
        return false;
      }

    } else {
      if(this.currentMaxColumn == this.MAX_COLUMNS - 1){
        Common.modalMessageError("エラー",`列数は${this.MAX_COLUMNS}以上にできません。`, MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '006');
        return false;
      }
    }

    return true;
  }

//#endregion

//#region noSettingList => RoomTable Drag&Drop Event Method

  /**位置設定可能か判定,OKなら部屋パネルにハイライトを付ける */
  private acceptNoSettingDrop = (el, target, source, sibling) => {

    if (this.hasClassName(target, 'roominfo')) {
      if (sibling) {
        return false;
      } else {
        if(this.curElement != null){
          this.curElement.classList.remove("roomHighlight");
        }
        if(this.hasClassName(target, "dragwrapper")){
          target.classList.add("roomHighlight");
        }
        return true;
      }
    }

    if(this.curElement != null){
      this.curElement.classList.remove("roomHighlight");
    }

    if(this.hasClassName(target, "dragwrapper")){
      this.curElement = target;
      target.classList.add("roomHighlight");
    }

    return true;
  }

  /**部屋の枠を外す */
  public targetMoveout(){
    let targetElements = document.getElementsByClassName('roomHighlight');
    Array.prototype.forEach.call(targetElements, function(item: { classList: { remove: (arg0: string) => void; }; }) {
      item.classList.remove('roomHighlight');
    });
  }

  /**部屋位置をセット */
  private async dromRoomTableFromList(el: Element, target: Element) {

    // 条件セット
    let info = this.noSettingList.find(f => f.roomNo == el.getAttribute('noSettingList-roomNo'));

    const row = target.getAttribute('roomlist-row');
    const column = target.getAttribute('roomlist-column');

    if(isNullOrUndefined(row) || isNullOrUndefined(column)) { return; }

    info.rowIndex = Common.ToNumber(row);
    info.columnIndex = Common.ToNumber(column);
    info.updator = this.currentUser.userName;
    info.companyNo = this.currentUser.displayCompanyNo;

    let list = new Array<RoomInfo>();
    list.push(info);
    this.updateRoom(list);

  }

//#endregion

//#region RoomTable => RoomTable Drag&Drop Event Method

  /**部屋パネルを入れ替えれるか判定,OKなら部屋パネルにハイライトを付ける  */
  private acceptRoomsDrop = (el, target, source, sibling) => {

    if(this.curElement != null){
      this.curElement.classList.remove("roomHighlight");
    }

    if(this.hasClassName(target.children[0], "dragwrapper")){
      this.curElement = target.children[0];
      target.children[0].classList.add("roomHighlight");
    }

    return true;
  }

  /**移動元と先 */
  private dromRoomTable = async (el: Element, target: Element) => {

    // 移動元部屋位置取得
    const strBaseRoomRow = el.getAttribute('roomlist-row');
    const strBaseRoomColumn = el.getAttribute('roomlist-column');

    // 移動先部屋位置取得
    let strTargetRoomRow = target.children[0].getAttribute('roomlist-row');
    let strTargetRoomColumn = target.children[0].getAttribute('roomlist-column');

    if(strBaseRoomRow == strTargetRoomRow && strBaseRoomColumn == strTargetRoomColumn){
      strTargetRoomRow = target.children[1].getAttribute('roomlist-row');
      strTargetRoomColumn = target.children[1].getAttribute('roomlist-column');
    }

    if (isNullOrUndefined(strBaseRoomRow) || isNullOrUndefined(strBaseRoomColumn) || isNullOrUndefined(strTargetRoomRow) || isNullOrUndefined(strTargetRoomColumn) ||
       (strBaseRoomRow == strTargetRoomRow && strBaseRoomColumn == strTargetRoomColumn) ) { return; }

    // 移動元・先部屋情報取得
    let baseRoomInfo = new RoomInfo();
    let targetRoomInfo = new RoomInfo();

    const baseRoomRow = Common.ToNumber(strBaseRoomRow);
    const baseRoomCol = Common.ToNumber(strBaseRoomColumn);
    const targetRoomRow = Common.ToNumber(strTargetRoomRow);
    const targetRoomCol = Common.ToNumber(strTargetRoomColumn);

    baseRoomInfo = this.roomsTable[baseRoomRow][baseRoomCol];
    targetRoomInfo = this.roomsTable[targetRoomRow][targetRoomCol];

    if(isNullOrUndefined(baseRoomInfo.companyNo) && isNullOrUndefined(targetRoomInfo.companyNo)) { return; }

    // 条件セット
    let cond = new Array<RoomInfo>();
    baseRoomInfo.updator = this.currentUser.userName;
    baseRoomInfo.rowIndex = targetRoomRow;
    baseRoomInfo.columnIndex = targetRoomCol;
    targetRoomInfo.updator = this.currentUser.userName;
    targetRoomInfo.rowIndex = baseRoomRow;
    targetRoomInfo.columnIndex = baseRoomCol;

    cond.push(baseRoomInfo);
    if(!isNullOrUndefined(targetRoomInfo.companyNo)){cond.push(targetRoomInfo);}

    this.updateRoom(cond);

  }

//#endregion

  /**部屋マスタデータ取得 */
  public getRoomList(){

    this.roomsTable = new  Array<Array<RoomInfo>>();
    this.noSettingList = new Array<RoomInfo>();

    // 部屋マスタデータ取得
    let cond = new RoomInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;

    this.roomService.getRoomInfoList(cond).subscribe((res: RoomInfo[]) => {
      if(res){

        // 最大行・列を取得
        if(this.isFirstOpen){
          this.currentMaxRow = res.reduce((a, b) => a.rowIndex > b.rowIndex ? a : b).rowIndex;
          this.currentMaxColumn = res.reduce((a, b) => a.columnIndex > b.columnIndex ? a : b).columnIndex;
          this.isFirstOpen = false;
        }

        // 部屋テーブルデータ作成
        let rooms = new Array<Array<RoomInfo>>();
        for (let y = 0; y <= this.currentMaxRow; y++)
        {
          let row = new Array<RoomInfo>();
          for (let x = 0; x <= this.currentMaxColumn; x++)
          {
            let info = new RoomInfo();
            info.rowIndex = y;
            info.columnIndex = x;

            // 部屋が存在する場合、部屋情報をセット
            const idx = res.findIndex(f => f.rowIndex == y && f.columnIndex == x);
            if (idx > -1)
            {
              info = res[idx];
            } else {

            }

            row.push(info);
          }

          rooms.push(row);
        }

        this.roomsTable = rooms;

        // 未設定リスト作成
        this.noSettingList = res.filter(f => f.columnIndex == null || f.rowIndex == null);
      }

    });

  }

  /**部屋マスタを更新 */
  private updateRoom(list: RoomInfo[]){
    this.roomService.updateRoomDispLocation(list).subscribe((ret) => {

      switch(ret){
        // Success
        case DBUpdateResult.Success:
          break;
        // Failed
        case DBUpdateResult.VersionError:
          Common.modalMessageWarning("排他エラー",Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMS_DISPLAY_LOCATION + '001');
          break;

        default:
          Common.modalMessageError("エラー","部屋マスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMS_DISPLAY_LOCATION + '007');
      }

      this.getRoomList();

    });
  }

  /**部屋位置指定を解除 */
  public release(row: number, column: number){

    let info = this.roomsTable[row][column];
    info.rowIndex = null;
    info.columnIndex = null;
    info.updator = this.currentUser.userName;
    info.companyNo = this.currentUser.displayCompanyNo;

    let list = new Array<RoomInfo>();
    list.push(info);
    this.updateRoom(list);
  }


  /**ElementのClass名が存在するか取得する */
  private hasClassName = (el: Element, name: string) => {
    return el.className.includes(name);
  }

}
