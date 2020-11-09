import { Message, DBUpdateResult, SystemConst, MessagePrefix, FunctionId } from './../../../core/system.const';
import { AssignInfo } from './../../reserve/model/reserve.model';
import { isNullOrUndefined } from 'util';
import { User, EnumRole, EnumLostFlg, EnumTrustYou} from 'src/app/core/auth/auth.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { RoomService } from '../services/room.service';
import { RoomsAssignCondition, RoomsAssignedInfo, NotAssignedInfo, ElementInfo, RoomInfo } from '../model/rooms.model';
import { Common } from 'src/app/core/common';
import { MatSnackBar } from '@angular/material';
import { SharedService } from '../../../core/shared.service';

@Component({
  selector: 'app-room-assign',
  templateUrl: './room-assign.component.html',
  styleUrls: ['./room-assign.component.scss']
})

export class RoomAssignComponent implements OnInit, OnDestroy {

  /**部屋状態 チェックイン */
  public readonly ROOMSTATUS_ARRIVE = "Arrive";
  /**部屋状態 チェックアウト */
  public readonly ROOMSTATUS_DEPERTURE = "Deperture";
  /**部屋状態 空室 */
  public readonly ROOMSTATUS_EMPTY = "Empty";

  /**部屋メニュー 予約編集*/
  public readonly ROOMMENU_RESERVE = "Reserve";
  /**部屋メニュー アサイン取消*/
  public readonly ROOMMENU_ASSIGN_CANCEL = "AssignCancel";
  /**部屋メニュー チェックイン*/
  public readonly ROOMMENU_CI = "CI";
  /**部屋メニュー チェックイン取消*/
  public readonly ROOMMENU_CI_CANCEL = "CICancel";
  /**部屋メニュー チェックアウト*/
  public readonly ROOMMENU_CO = "CO";
  /**部屋メニュー チェックアウト取消*/
  public readonly ROOMMENU_CO_CANCEL = "COCancel";
  /**部屋メニュー 清掃完了*/
  public readonly ROOMMENU_CLEANING = "Cleaning";
  /**部屋メニュー 清掃完了(滞在部屋)*/
  public readonly ROOMMENU_STAYCLEANING = "StayCleaning";
  /**部屋メニュー 部屋割詳細*/
  public readonly ROOMMENU_ROOMDETAILS = "RoomDetails";

  /**部屋メニュー 中抜け*/
  public readonly ROOMMENU_HOLLOW = "Hollow";
  /**部屋メニュー 中抜け取消*/
  public readonly ROOMMENU_HOLLOW_CANCEL = "HollowCancel";
  /**部屋メニュー 中抜けC/I*/
  public readonly ROOMMENU_HOLLOW_CI = "HollowCI";
  /**部屋メニュー 中抜けC/I取消*/
  public readonly ROOMMENU_HOLLOW_CI_CANCEL = "HollowCICancel";

  /**ドラックドロップグループ名 未アサイン=>アサイン用 */
  public readonly DRAGDROP_ASSIGN = "DDAssign";
  /**ドラックドロップグループ名 ルームチェンジ,アサイン変更用 */
  public readonly DRAGDROP_ROOMCHANGE = "DDRoomChange";

  /**禁煙喫煙区分 禁煙*/
  public readonly CODENAMEDIVISION_NONSMOKING = 1;
  /**禁煙喫煙区分 喫煙*/
  public readonly CODENAMEDIVISION_SMOKING = 2;

  /**中抜け*/
  public readonly HOLLOWSTATUS_HOLLOW = SystemConst.HOLLOWSTATUS_HOLLOW

  /**未指定 */
  public readonly UNSPECIFIED = SystemConst.UNSPECIFIED.key;

  /**改行コード */
  private readonly returnCode = "<br>";

  /**部屋状態リスト*/
  public readonly ROOM_STATUS_LIST: Array<ElementInfo> = [
    {key: this.ROOMSTATUS_EMPTY, text: "空室", color: "#dddddd", icon:""}, //white
    {key: SystemConst.ROOMSTATUS_ASSIGN, text: "アサイン済", color: "#FFB265", icon:""}, // orange
    {key: this.ROOMSTATUS_ARRIVE, text: "チェックイン予定", color: "#47de9c", icon:""}, // green
    {key: SystemConst.ROOMSTATUS_STAY, text: "滞在中", color: "#ffb6c1", icon:""}, //pink
    {key: this.ROOMSTATUS_DEPERTURE, text: "チェックアウト予定", color: "#add8e6", icon:""}, //blue
    {key: SystemConst.ROOMSTATUS_CO, text: "チェックアウト済", color: "#faf6b9", icon:""}, //yellow
    {key: SystemConst.ROOMSTATUS_CLEANED, text: "清掃済", color: "#999999", icon:""} //gray
  ];

  /**部屋メニュー リスト*/
  public readonly ROOMMENU_BUTTON_LIST: Array<ElementInfo> = [
    {key: this.ROOMMENU_RESERVE, text: "予約編集", icon:"edit", color:""},
    {key: this.ROOMMENU_ROOMDETAILS, text: "部屋割詳細", icon:"assignment_ind", color:""},
    {key: this.ROOMMENU_ASSIGN_CANCEL, text: "アサイン解除", icon:"assignment_return", color:""},
    {key: this.ROOMMENU_CI, text: "チェックイン", icon:"check_circle", color:""},
    {key: this.ROOMMENU_CI_CANCEL, text: "チェックイン取消", icon:"cancel", color:""},
    {key: this.ROOMMENU_CO, text: "チェックアウト", icon:"directions_walk", color:""},
    {key: this.ROOMMENU_CO_CANCEL, text: "チェックアウト取消", icon:"cancel", color:""},
    {key: this.ROOMMENU_CLEANING, text: "清掃完了", icon:"cleaning_services", color:""},
    {key: this.ROOMMENU_STAYCLEANING, text: "清掃完了", icon:"cleaning_services", color:""},
    {key: this.ROOMMENU_HOLLOW, text: "中抜け", icon:"", color:""},
    {key: this.ROOMMENU_HOLLOW_CANCEL, text: "中抜け取消", icon:"", color:""},
    {key: this.ROOMMENU_HOLLOW_CI, text: "中抜けC/I", icon:"", color:""},
    {key: this.ROOMMENU_HOLLOW_CI_CANCEL, text: "中抜けC/I取消", icon:"", color:""},
  ];

  /**自動リロード秒数*/
  private readonly AUTO_RELOAD_SEC = 60;

  /**CO予定を表示 */
  public viewCOFlg: boolean;

  /**清掃状態使用使用可否 */
  public useCSFlg: boolean;

  /**清掃状態を表示 */
  public viewCSFlg: boolean;

  /**CO予定ボタン色 */
  public viewCOFlgColor: string;

  /**清掃状態ボタン色 */
  public viewCSFlgColor: string;

  /**アサイン情報テーブル*/
  public roomsTable: RoomsAssignedInfo[][];

  /**未アサインリスト*/
  public notAssignList: NotAssignedInfo[];

  /**ログインユーザー情報*/
  private currentUser: User;

  /**日付(画面入力値)*/
  public inputDate: Date;
  /**日付(遷移パラメータ用) */
  private pramDate: string;

  /**部屋メニュー表示フラグ */
  public isDispRoomMenu: boolean = false;
  public isDispReserveInfo: boolean = false;
  public roomMenuTopPx: string;
  public roomMenuLeftPx: string;

  /**選択部屋情報 */
  public selectRoomInfo: RoomsAssignedInfo;

  /**選択部屋情報 */
  public selectnotAssignInfo: NotAssignedInfo;

  /**自動読込フラグ */
  private timer: any;
  private isTimerStop: boolean = false;

  /**現在のElement保持用 */
  private curElement: Element;

  private subs = new Subscription();

  /**部屋数 */
  public totalRoomCount: number = 0;
  /**利用部屋数 */
  public usedRoomCount: number = 0;
  /**利用率 */
  public usedRate: number = 0;
  /**利用人数 */
  public usePersonCount: number = 0;

//#region Event Method
  constructor(private route: ActivatedRoute,
              private router: Router,
              private dragulaService: DragulaService,
              private roomService: RoomService,
              private authService: AuthService,
              private snackBar: MatSnackBar,
              private SharedService: SharedService) {

    this.currentUser = this.authService.getLoginUser();
    this.viewCOFlg = false;
    this.viewCSFlg = false;

    this.route.queryParamMap.subscribe( params => {
      this.inputDate = new Date();
      this.pramDate = params.get('date');
      if(!isNullOrUndefined(this.pramDate)) {
        this.inputDate = new Date(this.pramDate.substring(0, 4) + "/" + this.pramDate.substring(4, 6) + "/" + this.pramDate.substring(6, 8) + " 00:00:00");
      }
      this.pramDate = Common.ToFormatStringDate(this.inputDate);
      this.getDailyData();
    });

  //#region NotAssignList => AssignTable DragAndDrop Event

    /** NotAssignList => AssignTable CreateGroup */
    this.dragulaService.createGroup(this.DRAGDROP_ASSIGN, {
      // back to origin if outside of containers
      revertOnSpill: true,

      // accept drop or not
      accepts: this.acceptAssignDrop
    });

    /**NotAssign => AssignTable Drag */
    this.subs.add(this.dragulaService.drag(this.DRAGDROP_ASSIGN)
      .subscribe(({ name, el }) => {
        this.isTimerStop = true;
      })
    );

    /**NotAssign => AssignTable Drop */
    this.subs.add(this.dragulaService.drop(this.DRAGDROP_ASSIGN)
      .subscribe(({ el, target }) => {
        this.assign(el, target);
        this.getDailyData();
      })
    );

    /**NotAssign => AssignTable DragEnd */
    this.subs.add(this.dragulaService.dragend(this.DRAGDROP_ASSIGN)
      .subscribe(({ el }) => {
        this.isTimerStop = false;
        this.targetMoveout();
      })
    );
  //#endregion

  //#region AssignTable DragAndDrop Event

    /** AssignTable => AssignTable CreateGroup */
    this.dragulaService.createGroup(this.DRAGDROP_ROOMCHANGE, {
      // back to origin if outside of containers
      revertOnSpill: true,

      // accept drop or not
      accepts: this.acceptRoomChangeDrop
    });

    /**AssignTable => AssignTable Drag */
    this.subs.add(this.dragulaService.drag(this.DRAGDROP_ROOMCHANGE)
      .subscribe(({ name, el }) => {
        this.isTimerStop = true;
      })
    );

    /**AssignTable => AssignTable Drop */
    this.subs.add(this.dragulaService.drop(this.DRAGDROP_ROOMCHANGE)
      .subscribe(({ el, target }) => {
        this.checkRCState(el, target);
        this.getDailyData();
      })
    );

    /**AssignTable => AssignTable DragEnd */
    this.subs.add(this.dragulaService.dragend(this.DRAGDROP_ROOMCHANGE)
      .subscribe(({ el }) => {
        this.isTimerStop = false;
        this.targetMoveout();
      })
    );
  //#endregion

    // Click Event
    document.addEventListener('click', this.hideMenu);

  }

  ngOnDestroy() {
    this.dragulaService.destroy(this.DRAGDROP_ASSIGN);
    this.dragulaService.destroy(this.DRAGDROP_ROOMCHANGE);
    this.subs.unsubscribe();
    document.removeEventListener('click', this.hideMenu);
    this.isTimerStop = true;
    clearInterval(this.timer);

    this.SharedService.displayDate = this.inputDate;
  }

  ngOnInit(){

    if(!isNullOrUndefined(this.SharedService.displayDate)){
      this.inputDate = this.SharedService.displayDate;
    }

    // 清掃状況の切替使用可否判断
    if(this.currentUser.companyInfo.lostFlg == EnumLostFlg.Used.toString()) {
      this.useCSFlg = true;
    }else{
      this.useCSFlg = false;
    }

    //
    this.timer = setInterval( () => { this.timerEvent(); }, this.AUTO_RELOAD_SEC * 1000 );
    this.isTimerStop = true;

    this.viewCOFlgColor="";
    this.viewCSFlgColor="";
  }

  /**メニュー表示, DnD操作中, 更新処理中は自動読込をストップする */
  private timerEvent(){
    if(this.isDispRoomMenu || this.isTimerStop){ return; }
    this.getDailyData();
  }

  /**日付変更イベント */
  public onChangeDate(event: Date){
    this.inputDate = event;
    this.getDailyData();
  }

  /**日付変更イベント */
  public onClickDate(targetdate: string){
    if(!isNullOrUndefined(targetdate)) {
      this.inputDate = new Date(targetdate.substring(0, 4) + "/" + targetdate.substring(4, 6) + "/" + targetdate.substring(6, 8) + " 00:00:00");
    }
    this.getDailyData();
  }

  /**基本Success系メッセージはSnackBarで出す */
  public showSnackBar(msg: string) {
    this.snackBar.open(msg, "×", {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 3 * 1000, /*3sec表示*/
    });
  }

  /**メニュー以外をクリック時、メニューを非表示にする */
  private hideMenu = (e: any) => {
    if (this.hasClassName(e.target, 'menu') ||
        this.hasClassName(e.target, 'menu-group') ||
        this.hasClassName(e.target, 'menu-item')) {
      return;
    }
    this.isDispRoomMenu = false;
    this.isDispReserveInfo = false;
  }

//#endregion

//#region NotAssign => AssignTable Drag&Drop Event Method

  /**部屋の枠を外す */
  public targetMoveout(){
    let targetElements = document.getElementsByClassName('roomHighlight');
    Array.prototype.forEach.call(targetElements, function(item: { classList: { remove: (arg0: string) => void; }; }) {
      item.classList.remove('roomHighlight');
    });
  }

  /**アサイン */
  private assign = async (el: Element, target: Element) => {

    this.isTimerStop = true;

    // 部屋タイプ未指定(WEB取込)は先に予約編集で指定をしてから
    if(el.getAttribute('notAssign-orgRoomtypeCode') == SystemConst.UNSPECIFIED.key){
      Common.modalMessageError(Message.TITLE_ERROR, `部屋タイプコードが未指定です。${this.returnCode}予約編集で希望部屋タイプを指定してください。`, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '001');
      return;
    }

    // 条件セット
    let info = this.notAssignList.find(f => f.reserveNo == el.getAttribute('notAssign-reserveNo') &&
                                 f.orgRoomtypeCode == el.getAttribute('notAssign-orgRoomtypeCode') &&
                                 f.routeSEQ == Common.ToNumber(el.getAttribute('notAssign-routeSEQ')));

    info.roomNo = target.getAttribute('roomNo');
    info.updator = this.currentUser.userName;
    info.companyNo = this.currentUser.displayCompanyNo;
    info.roomStateClass = SystemConst.ROOMSTATUS_ASSIGN;

    if(isNullOrUndefined(info.roomNo)) { return; }

    this.checkAssignRoomType(info);

  }

  /**アサイン部屋と部屋タイプが一致しているかチェック */
  private checkAssignRoomType(roomInfo: AssignInfo){

    let cond = new RoomInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.roomNo = roomInfo.roomNo;

    this.roomService.getRoomInfoById(cond).subscribe((mstRoom) => {
      if (mstRoom) {
        if (mstRoom.roomTypeCode != roomInfo.orgRoomtypeCode) {
          Common.modalMessageConfirm(Message.TITLE_CONFIRM, `アサイン先の部屋タイプが異なっています。${this.returnCode}アサインしてもよろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.ROOMS_ASSIGN + '001').then((diffTypeResult) =>{
            // 結果が返ってきてからの処理
            if (!diffTypeResult) return;

            this.getAssignNextDays(roomInfo);
            return;

          });
        } else {
          // 先の日付のアサイン状況をチェック
          this.getAssignNextDays(roomInfo);
        }

      }
      else {
        Common.modalMessageError(Message.TITLE_ERROR, "部屋マスタ" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '002');
      }
      this.isTimerStop = false;
    });
  }

  /**2泊目以降の予約アサインを取得 */
  private getAssignNextDays(info: AssignInfo){

    this.roomService.getReserveNotAssignInfo(info).subscribe((result) => {

      let list = new Array<AssignInfo>();

      if(result.length > 0){ /*先日付の未アサインデータあり*/

        result.forEach((data) => {

          // 条件セット
          data.roomNo = info.roomNo;
          data.updator = this.currentUser.userName;
          data.companyNo = this.currentUser.displayCompanyNo;

        });

        list = result;

      }

      list.push(info);

    this.updateAssign(list);

    this.isTimerStop = false;
    });

  }

  /**予約アサインテーブルを更新 */
  private updateAssign(list: AssignInfo[]){

    let msgTitle: string = Message.TITLE_ERROR;
    let message: string = 'アサイン' + Message.UPDATE_ERROR;

    this.roomService.assignRoom(list).subscribe((ret) => {

      switch(ret){
        // Success
        case DBUpdateResult.Success:
          this.showSnackBar("部屋番号：" + list[0].roomNo + Message.ASSIGN_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case 1: /*翌日以降,同一部屋タイプに空きがない為,未アサイン*/
          msgTitle = Message.TITLE_NOTICE;
          message = "部屋番号：" + list[0].roomNo + Message.ASSIGN_SUCCESS_NOTICE + this.returnCode
                  + "2泊目以降、同部屋タイプに空きがない為、" + this.returnCode
                  + "未アサインの日があります。" + this.returnCode
                  + "詳細は連泊状況から確認してください。"
          break;

        case 2:/*翌日以降,同一部屋に空きがない為,空いている同一部屋タイプ部屋にアサイン*/
          msgTitle = Message.TITLE_NOTICE;
          message = "部屋番号：" + list[0].roomNo + Message.ASSIGN_SUCCESS_NOTICE + this.returnCode
                  + "2泊目以降、同部屋に空きがない為、" + this.returnCode
                  + "同部屋タイプの部屋にアサインされました。" + this.returnCode
                  + "詳細は連泊状況から確認してください。"
          break;

        // Failed
        case DBUpdateResult.VersionError:
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;
      }

      if(msgTitle == Message.TITLE_NOTICE){
        Common.modalMessageNotice(msgTitle, message, MessagePrefix.NOTICE + FunctionId.ROOMS_ASSIGN + '001').then(() =>{
          this.getDailyData();
          this.isTimerStop = false;
        });
      } else {
        Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '003').then(() =>{
          this.getDailyData();
          this.isTimerStop = false;
        });
      }

    });
  }

//#endregion

//#region AssignTable => AssignTable Drag&Drop Event Method

  /**移動元と先の部屋状態をチェック */
  private checkRCState = async (el: Element, target: Element) => {

    this.isTimerStop = true;

    if(this.viewCOFlg) {
      Common.modalMessageError(Message.TITLE_ERROR,`チェックアウト予定表示ではルームチェンジできません${this.returnCode}表示を切り替えます。`, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '004');
      this.viewCOFlg = false;
      return;
    }

    // 移動元部屋番号取得
    const bRoomNo = this.getRoomNoByElement(el);

    // 移動先部屋番号取得
    const tRoomNo = this.getRoomNoByElement(target);

    if (isNullOrUndefined(bRoomNo) || isNullOrUndefined(tRoomNo) || bRoomNo == tRoomNo ) { return; }

    // 移動元・先部屋番号取得
    let baseRoomInfo = new RoomsAssignedInfo();
    let targetRoomInfo = new RoomsAssignedInfo();
    this.roomsTable.forEach((row) => {

      row.forEach((room) => {

        if(room.roomNo == bRoomNo){
          baseRoomInfo = room;
        }

        if(room.roomNo == tRoomNo){
          targetRoomInfo = room;
        }

      })

    });

    // 移動元が空室の場合は処理しない
    if(baseRoomInfo.panel.key == this.ROOMSTATUS_EMPTY){ return; }

    // 移動元がアサイン済でCI前
    if(baseRoomInfo.panel.key == SystemConst.ROOMSTATUS_ASSIGN || baseRoomInfo.panel.key == this.ROOMSTATUS_ARRIVE){
      // 移動先が空室 or アサイン済 or CI予定のみRC可能
      if(!(targetRoomInfo.panel.key == this.ROOMSTATUS_EMPTY || targetRoomInfo.panel.key == SystemConst.ROOMSTATUS_ASSIGN || targetRoomInfo.panel.key == this.ROOMSTATUS_ARRIVE)){
        const msg = `移動先の部屋がチェックイン済の場合、${this.returnCode}`
                  + `ルームチェンジできません。${this.returnCode}`
                  + `${this.ROOM_STATUS_LIST.find(f => f.key == this.ROOMSTATUS_EMPTY).text}、`
                  + `${this.ROOM_STATUS_LIST.find(f => f.key == SystemConst.ROOMSTATUS_ASSIGN).text}、`
                  + `${this.ROOM_STATUS_LIST.find(f => f.key == this.ROOMSTATUS_ARRIVE).text}の部屋に${this.returnCode}`
                  + `ルームチェンジできます。`;

        Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '005');
        return;
      }
    }

    // 移動元が滞在中でCO日より前 or 0泊で滞在中
    if(baseRoomInfo.panel.key == SystemConst.ROOMSTATUS_STAY || (baseRoomInfo.panel.key == this.ROOMSTATUS_DEPERTURE && baseRoomInfo.stayDays == 0)){
      // 移動先が空室 or 滞在中でCO日より前 or 0泊で滞在中のみRC可能
      if(!(targetRoomInfo.panel.key == this.ROOMSTATUS_EMPTY || targetRoomInfo.panel.key == SystemConst.ROOMSTATUS_STAY || (baseRoomInfo.panel.key == this.ROOMSTATUS_DEPERTURE && baseRoomInfo.stayDays == 0))){
        const msg = `移動先の部屋が`
                  + `${this.ROOM_STATUS_LIST.find(f => f.key == this.ROOMSTATUS_EMPTY).text}、`
                  + `${this.ROOM_STATUS_LIST.find(f => f.key == SystemConst.ROOMSTATUS_STAY).text}の部屋に${this.returnCode}`
                  + `ルームチェンジできます。`;
      Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '006');
        return;
      }
    }

    // 確認
    Common.modalMessageConfirm(Message.TITLE_CONFIRM,`部屋番号:${bRoomNo}から${tRoomNo}へのルームチェンジを行います。${this.returnCode}よろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.ROOMS_ASSIGN + '002').then((result) =>{

      // 結果が返ってきてからの処理
      if (!result) return;

      // 異なる部屋タイプルームチェンジ
      if(baseRoomInfo.roomtypeCode != targetRoomInfo.roomtypeCode){
        Common.modalMessageConfirm(Message.TITLE_CONFIRM,`チェンジ先の部屋タイプが異なっています。${this.returnCode}ルームチェンジしてもよろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.ROOMS_ASSIGN + '003').then((diffTypeResult) =>{
          // 結果が返ってきてからの処理
          if (!diffTypeResult) return;

          this.roomChange(baseRoomInfo, targetRoomInfo);
          return;

        });
      } else {

        this.roomChange(baseRoomInfo, targetRoomInfo);

      }

    });

  }

  /**ルームチェンジ */
  private roomChange(baseRoomInfo: RoomsAssignedInfo, targetRoomInfo: RoomsAssignedInfo) {
    let cond = new Array<RoomsAssignedInfo>();
    baseRoomInfo.updator = this.currentUser.userName;
    targetRoomInfo.updator = this.currentUser.userName;

    cond.push(baseRoomInfo);
    cond.push(targetRoomInfo);

    let msgTitle: string = Message.TITLE_ERROR;
    let message: string = 'ルームチェンジ' + Message.UPDATE_ERROR;

    this.roomService.roomChange(cond).subscribe((result) => {
      switch (result.result) {
        case DBUpdateResult.Success:
          let msg: Message;
          if (result.isMutualChange) {
            msg = `部屋番号:${result.baseRoomNo}と${result.targetRoomNo}間で`;
          }
          else {
            msg = `部屋番号:${result.baseRoomNo}から${result.targetRoomNo}に`;
          }
          this.showSnackBar(msg + Message.ROOMCHANGE_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError:
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '007').then(() => {
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**roomNoをElementから取得 */
  private getRoomNoByElement(el: Element) : string {
    let a = el.getAttribute('roomNo');

    if(isNullOrUndefined(a)){
      // Attributeから取得できない場合、outerHtmlから取得
      const b = el.outerHTML.match("roomno=\"([^\"]*)\"");
      a = b[0].replace("roomno=", "").replace(/\"/g, "");
    }

    return a;
  }

//#endregion

//#region Room Click Event Method

  /**部屋クリック */
  public onRoomClick(event: MouseEvent, room: RoomsAssignedInfo) {
    event.preventDefault();
    // if (!isNullOrUndefined(room) && room.panel.key = this.ROOMSTATUS_EMPTY) {

      // 部屋メニューをセット
      room.menuButton = new Array<ElementInfo>();
      room.menuButton = this.setRoomMenu(room);

      this.selectRoomInfo = room;

      this.roomMenuLeftPx = event.clientX + "px";
      this.roomMenuTopPx = (event.clientY - 64) + "px";
      this.isDispRoomMenu = true;
      this.isDispReserveInfo = true;
    // }

  }

    /** 未アサインクリック */
    public onNotAssignClick(event: MouseEvent, room: RoomsAssignedInfo) {
      event.preventDefault();
      if (!isNullOrUndefined(room)) {

        // 部屋メニューをセット
        room.menuButton = new Array<ElementInfo>();

        let list: Array<ElementInfo> = new Array<ElementInfo>();
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
        room.menuButton = list;

        this.selectRoomInfo = room;

        this.roomMenuLeftPx = event.clientX + "px";
        this.roomMenuTopPx = (event.clientY - 64) + "px";
        this.isDispRoomMenu = true;
        this.isDispReserveInfo = false;

      }

    }

  /**部屋状態に応じて実行可能な部屋メニューをセット */
  private setRoomMenu(room: RoomsAssignedInfo): Array<ElementInfo>{

    let list: Array<ElementInfo> = new Array<ElementInfo>();

    switch (room.panel.key){
      case SystemConst.ROOMSTATUS_ASSIGN : /*アサイン済,CI前日*/
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ASSIGN_CANCEL));
        break;

      case this.ROOMSTATUS_ARRIVE : /*アサイン済,CI当日*/
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ASSIGN_CANCEL));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CI));
        break;

      case SystemConst.ROOMSTATUS_STAY : /*CI済*/
        if (room.checkInDay) { /*CI当日*/
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CI_CANCEL));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_STAYCLEANING));
        } else { /*CI当日,CO当日以外*/
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_STAYCLEANING));
        }
        break;

      case this.ROOMSTATUS_DEPERTURE : /*CO当日*/
        if (room.stayDays == 0) { /*0泊*/
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CI_CANCEL));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CO));
        } else { /*0泊以外*/
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CO));
        }
        break;

      case SystemConst.ROOMSTATUS_CO : /*CO済*/
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
        // CO当日
        if (room.stayDays == 0 || this.viewCOFlg) {
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CO_CANCEL));
          list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CLEANING));
        }
        break;

      case SystemConst.ROOMSTATUS_CLEANED : /*清掃済*/
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_RESERVE));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_ROOMDETAILS));
        list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_CO_CANCEL));
        break;

    }

    // 中抜け情報を追加
    if (room.hollowStateClass == SystemConst.HOLLOWSTATUS_HOLLOW) {
      // 中抜け設定済み→中抜けキャンセルが可能かを確認
      list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_HOLLOW_CANCEL));
    } else {
      if (room.stayDays >= 3 && room.hollowStateClass == SystemConst.HOLLOWSTATUS_DEFAULT) {
        // 中抜け設定が可能かを確認
        if (room.roomStateClass == SystemConst.ROOMSTATUS_STAY || room.roomStateClass == SystemConst.ROOMSTATUS_ASSIGN) {
          // 到着日の翌日から出発日の前々日まで
          let targetStartDate = Common.ToFormatStringDate(this.addDate(new Date(Common.ToFormatDate(room.arrivalDate)),1))
          let targetEndDate = Common.ToFormatStringDate(this.addDate(new Date(Common.ToFormatDate(room.departureDate)),-2))

          if (targetStartDate <= room.useDate && room.useDate <= targetEndDate) {
            list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_HOLLOW));
          }
        }

        // チェックイン済みだが、部屋状態がアサイン状態の場合→中抜けチェックインが可能かを確認
        if (room.roomStateClass == SystemConst.ROOMSTATUS_ASSIGN) {
            // 指定日より前に部屋状態が滞在中、かつ中抜け状態が"中抜け"の日がある
            this.roomService.hollowIsCheckin(room).subscribe((result) => {
              switch (result) {
                case true :
                  list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_HOLLOW_CI));
                  break;
              }
            }
          );
        }

        // チェックイン済み、かつ部屋状態が滞在中の場合→中抜けチェックインキャンセルが可能かを確認
        if (room.roomStateClass == SystemConst.ROOMSTATUS_STAY
           || room.roomStateClass == SystemConst.ROOMSTATUS_STAYCLEANING
           || room.roomStateClass == SystemConst.ROOMSTATUS_STAYCLEANED) {
            // 指定日より前に部屋状態が滞在中、かつ中抜け状態が"中抜け"の日がある
            this.roomService.hollowIsCheckinCancel(room).subscribe((result) => {
              switch (result) {
                case true :
                  list.push(this.ROOMMENU_BUTTON_LIST.find(f => f.key == this.ROOMMENU_HOLLOW_CI_CANCEL));
                  break;
              }
            }
          );
        }
      }
    }

    return list;
  }

  // 日付の加算、減算処理
  private addDate(date: Date, days: number): Date{
    let resDate = new Date(date);
    resDate.setDate(resDate.getDate() + days);
    return resDate;
  }

  /**部屋メニュークリック */
  public onRoomMenuClick(key: string) {

    this.isDispRoomMenu = false;
    this.isDispReserveInfo = false;

    this.isTimerStop = true;

    // 条件セット
    let cond: AssignInfo = this.selectRoomInfo;
    cond.updator = this.currentUser.userName;

    // ボタンイベント
    switch(key) {
      case this.ROOMMENU_RESERVE: /*予約編集*/
        this.router.navigate(['/company/reserve/', this.selectRoomInfo.reserveNo ]);
        return;

      case this.ROOMMENU_ROOMDETAILS: /* 部屋割詳細 */
        this.router.navigate(['/company/rooms/details', this.selectRoomInfo.reserveNo ]);
        return;

      case this.ROOMMENU_ASSIGN_CANCEL: /*アサイン解除*/
        this.assignCancel(cond);
        break;

      case this.ROOMMENU_CI : /*チェックイン*/
        this.checkIn(cond);
        break;

      case this.ROOMMENU_CI_CANCEL: /*チェックインキャンセル*/
        this.checkInCancel(cond);
        break;

      case this.ROOMMENU_CO: /*チェックアウト*/
        this.checkOut(cond);
        break;

      case this.ROOMMENU_CO_CANCEL: /*チェックアウトキャンセル*/
        this.checkOutCancel(cond);
        break;

      case this.ROOMMENU_CLEANING: /*清掃完了*/
        this.cleanRoom(cond);
        break;

      case this.ROOMMENU_STAYCLEANING: /*清掃完了*/
        this.cleanStayRoom(cond);
        break;

      case this.ROOMMENU_HOLLOW:    /*中抜け*/
        this.hollow(cond);
        break;

      case this.ROOMMENU_HOLLOW_CANCEL: /*中抜け取消*/
        this.hollowCancel(cond);
        break;

      case this.ROOMMENU_HOLLOW_CI: /*中抜けC/I*/
        this.hollowCheckin(cond);
        break;

      case this.ROOMMENU_HOLLOW_CI_CANCEL: /*中抜けC/I取消*/
        this.hollowCheckinCancel(cond);
        break;

      default:
        this.getDailyData();
        this.isTimerStop = false;
        break;
    }

  }

  /**清掃完了*/
  private cleanRoom(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '清掃状態' + Message.UPDATE_ERROR;

    this.roomService.cleaningRoom(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("部屋番号：" + cond.roomNo + Message.CLEANING_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '008').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**清掃完了*/
  private cleanStayRoom(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '清掃状態' + Message.UPDATE_ERROR;

    this.roomService.cleaningStayRoom(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("部屋番号：" + cond.roomNo + Message.CLEANING_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '009').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**チェックアウト取消 */
  private checkOutCancel(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = 'チェックアウト取消' + Message.UPDATE_ERROR;

    this.roomService.checkOutCancel(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("予約番号：" + cond.reserveNo + Message.CHECKOUT_CANCEL_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError:
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        case -3: /*部屋マスタから削除されているのでCO取消不可*/
          message = Message.CO_CANCEL_ROOMDELETED_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '010').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**チェックアウト */
  private checkOut(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = 'チェックアウト' + Message.UPDATE_ERROR;

    this.roomService.checkOut(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("予約番号：" + cond.reserveNo + Message.CHECKOUT_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        case -3 : /*未精算あり*/
          message = Message.NOTADJUSTMENTED_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '011').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**チェックイン取消 */
  private checkInCancel(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = 'チェックイン取消' + Message.UPDATE_ERROR;

    this.roomService.checkInCancel(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("予約番号：" + cond.reserveNo + Message.CHECKIN_CANCEL_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '012').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**チェックイン */
  private checkIn(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = 'チェックイン' + Message.UPDATE_ERROR;

    this.roomService.checkIn(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
          this.showSnackBar("予約番号：" + cond.reserveNo + Message.CHECKIN_SUCCESS_NOTICE);
          this.getDailyData();
          this.isTimerStop = false;
          return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        case -2 :
          message = `チェックイン予定部屋の前回利用者が未チェックアウト${this.returnCode}`
                  + `または未清掃です。${this.returnCode}`
                  + `清掃完了にしてからチェックインしてください。${this.returnCode}`
                  + `チェックアウト予定表示に切り替えます。`;
          this.viewCOFlg = true;
          this.viewCOFlgColor="accent";
          break;

        case -3 :
          message = `未アサインの日があります。${this.returnCode}アサインを行った後でチェックインしてください。`;
          break;

        default:
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '013').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**アサイン解除 */
  private assignCancel(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = 'アサイン' + Message.UPDATE_ERROR;

    this.roomService.assignCancel(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
        this.showSnackBar("部屋番号：" + cond.roomNo + Message.ASSIGN_CANCEL_SUCCESS_NOTICE);
        this.getDailyData();
        this.isTimerStop = false;
        return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;

      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '014').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**中抜け */
  private hollow(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '中抜け' + Message.UPDATE_ERROR;

    this.roomService.hollow(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
        this.showSnackBar("部屋番号：" + cond.roomNo + Message.HOLLOW_SUCCESS_NOTICE);
        this.getDailyData();
        this.isTimerStop = false;
        return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;

      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '015').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  //中抜け取消
  private hollowCancel(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '中抜け取消' + Message.UPDATE_ERROR;

    this.roomService.hollowCancel(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
        this.showSnackBar("部屋番号：" + cond.roomNo + Message.HOLLOW_CANCEL_SUCCESS_NOTICE);
        this.getDailyData();
        this.isTimerStop = false;
        return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;

      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '016').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  /**中抜けC/I */
  private hollowCheckin(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '中抜けC/I' + Message.UPDATE_ERROR;

    this.roomService.hollowCheckin(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
        this.showSnackBar("部屋番号：" + cond.roomNo + Message.HOLLOW_CI_SUCCESS_NOTICE);
        this.getDailyData();
        this.isTimerStop = false;
        return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        case -2 :
          message = `チェックイン予定部屋の前回利用者が未チェックアウト${this.returnCode}`
                  + `または未清掃です。${this.returnCode}`
                  + `清掃完了にしてからチェックインしてください。${this.returnCode}`
                  + `チェックアウト予定表示に切り替えます。`;
          this.viewCOFlg = true;
          this.viewCOFlgColor="accent";
          break;

        default:
          break;

      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '017').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

  //中抜けC/I取消
  private hollowCheckinCancel(cond: AssignInfo) {

    let msgTitle : string = Message.TITLE_ERROR;
    let message : string = '中抜けC/I取消' + Message.UPDATE_ERROR;

    this.roomService.hollowCheckinCancel(cond).subscribe((result) => {
      switch (result) {
        case DBUpdateResult.Success :
        this.showSnackBar("部屋番号：" + cond.roomNo + Message.HOLLOW_CIC_SUCCESS_NOTICE);
        this.getDailyData();
        this.isTimerStop = false;
        return;

        case DBUpdateResult.VersionError :
          msgTitle = Message.TITLE_VERSION_ERROR;
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:
          break;

      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.ROOMS_ASSIGN + '018').then(() =>{
        this.getDailyData();
        this.isTimerStop = false;
      });

    });
  }

//#endregion

  // チェックアウト予定切替表示
  public getCOData(){

    if (this.viewCOFlg) {
      this.viewCOFlg = false;
      this.viewCSFlg= false;
      this.viewCOFlgColor="";
      this.viewCSFlgColor ="";
    } else {
      this.viewCOFlg = true;
      this.viewCSFlg= false;
      this.viewCOFlgColor="accent";
      this.viewCSFlgColor ="";
    }

    this.getDailyData();
  }

  // 清掃状態切替表示
  public getCleaningData(){

    if (this.viewCSFlg) {
      this.viewCOFlg = false;
      this.viewCSFlg= false;
      this.viewCOFlgColor="";
      this.viewCSFlgColor ="";
    } else {
      this.viewCOFlg = false;
      this.viewCSFlg= true;
      this.viewCOFlgColor="";
      this.viewCSFlgColor ="accent";
    }

    this.getDailyData();
  }

  /**日別データ取得 */
  public getDailyData(){

    this.isTimerStop = true;

    // RoomsCounter Initialize
    this.totalRoomCount = 0;
    this.usedRoomCount = 0;
    this.usedRate = 0;
    this.usePersonCount = 0;

    // 条件セット
    const cond: RoomsAssignCondition = {
      companyNo: this.currentUser.displayCompanyNo,
      useDate: Common.ToFormatStringDate(this.inputDate),
      viewCOFlg: this.viewCOFlg
    };

    // アサイン情報取得
    this.roomService.getDailyAssignInfo(cond).subscribe((res: RoomsAssignedInfo[][]) => {
      if(res){
        res.forEach((row) => {

          row.forEach((room) => {

            // 部屋状態名、色をセット
            const stateIdx = this.setViewRoomStatusIndex(room, cond);
            room.panel = this.ROOM_STATUS_LIST[stateIdx];

            // RoomsCounterをセット(実部屋のみカウント)
            if (room.roomTypeDivision == SystemConst.ROOMTYPE_DIVISION_REAL) {
              if(room.roomNo != null) { this.totalRoomCount++; }
              if(room.panel.key != this.ROOMSTATUS_EMPTY) { this.usedRoomCount++; }
              this.usePersonCount += (room.memberAdult + room.memberChild);
            }

          })

        });

        this.roomsTable = res;

        // RoomsCounterをセット
        if(this.totalRoomCount == 0) {
          this.usedRate = 0;
        } else {
          this.usedRate = Math.round(this.usedRoomCount / this.totalRoomCount * 100);
        }

      }

    });

    //　未アサイン情報取得
    this.roomService.getDailyNotAssignInfo(cond).subscribe((res) => {
      this.notAssignList = res;
      this.isTimerStop = false;
    });
  }

  /**
   * 部屋状態名、色のインデックス番号をセット
   * @param room アサイン情報
   * @param cond 検索条件
   * @returns ROOM_STATUS_LISTのインデックス番号
   */
  private setViewRoomStatusIndex(room: RoomsAssignedInfo, cond: RoomsAssignCondition): number {
    let stateIdx = this.ROOM_STATUS_LIST.findIndex(f => f.key == room.roomStateClass);
    if (stateIdx > -1) {

      /* CI日でアサイン済状態: チェックイン*/
      if (room.checkInDay && room.roomStateClass == SystemConst.ROOMSTATUS_ASSIGN) {
        stateIdx = this.ROOM_STATUS_LIST.findIndex(f => f.key == this.ROOMSTATUS_ARRIVE);
      }

      /*CO日で滞在中: チェックアウト*/
      if (room.checkOutDay && room.roomStateClass == SystemConst.ROOMSTATUS_STAY) {
        stateIdx = this.ROOM_STATUS_LIST.findIndex(f => f.key == this.ROOMSTATUS_DEPERTURE);
      }

      /*滞在中で中抜け日: 空室*/
      if ((room.roomStateClass == SystemConst.ROOMSTATUS_STAY || room.roomStateClass == SystemConst.ROOMSTATUS_ASSIGN) && room.hollowStateClass == SystemConst.HOLLOWSTATUS_HOLLOW) {
        stateIdx = this.ROOM_STATUS_LIST.findIndex(f => f.key == this.ROOMSTATUS_EMPTY);
      }

      /*他: アサイン済 or 滞在中 or チェックアウト済 or 清掃済*/
    }
    else {
      /*空室*/
      stateIdx = 0;
    }
    return stateIdx;
  }

  /**Assign可能か判定,OKなら部屋パネルにハイライトを付ける */
  private acceptAssignDrop = (el, target, source, sibling) => {

    if (this.hasClassName(target, 'roominfo')) {
        if(this.curElement != null){
          this.curElement.classList.remove("roomHighlight");
        }
        if(this.hasClassName(target, "dragwrapper")){
          target.classList.add("roomHighlight");
        }
        return true;
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

  /**RC可能か判定,OKなら部屋パネルにハイライトを付ける */
  private acceptRoomChangeDrop = (el, target, source, sibling) => {

    if(this.curElement != null){
      this.curElement.classList.remove("roomHighlight");
    }

    if(this.hasClassName(target.children[0].children[0], "dragwrapper")){
      this.curElement = target.children[0].children[0];
      target.children[0].children[0].classList.add("roomHighlight");
    }

    return true;
  }

  /**ElementのClass名が存在するか取得する */
  private hasClassName = (el: Element, name: string) => {
    return el.className.includes(name);
  }

}
