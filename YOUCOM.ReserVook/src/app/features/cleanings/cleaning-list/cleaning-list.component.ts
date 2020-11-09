import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, EnumLostFlg } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CleaningService } from '../services/cleaning.service';
import { Cleaning, CleaningCondition, CleaningListColumn } from '../model/cleaning.model';
import { CompanyInfo } from '../../company/model/company.model';
import { ElementInfo, RoomsAssignedInfo } from '../../rooms/model/rooms.model';
import { SystemConst, DBUpdateResult, Message, MessagePrefix, FunctionId } from 'src/app/core/system.const';

@Component({
  selector: 'app-cleaning-list',
  templateUrl: './cleaning-list.component.html',
  styleUrls: ['./cleaning-list.component.scss'],
})

export class CleaningListComponent implements OnInit {

  //#region ----- readonly --------------------------------------------------
  private readonly printURL = '/company/cleanings/print';

  public readonly rowCount = 15;

  /**禁煙喫煙区分 禁煙*/
  public readonly CODENAMEDIVISION_NONSMOKING = 1;
  /**禁煙喫煙区分 喫煙*/
  public readonly CODENAMEDIVISION_SMOKING = 2;

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
  };


  editing = {};
  //rows = [];

  public allcolumns = [];
  //#endregion

  private _currentUser : User;      // ログインユーザー
  private editcolumn = [];          // 編集前のカラム保持用

  public inputDate: Date;           // ngModel
  public settingFlag: boolean;      // 表示設定 true:表示, false:非表示
  public displayColumns = [];       // 表示用カラム
  public cleaningList: Cleaning[];  // データ
  private loggedInCompany: CompanyInfo;
  private lost = EnumLostFlg;
  public lostFlg: boolean;      // 表示設定 true:表示, false:非表示

  /**状態ボタン */
  public statusButton: Array<ElementInfo>;

  /**客室状態変更ボタン リスト*/
  public readonly STATUS_BUTTON_LIST: Array<ElementInfo> = [
    {key: SystemConst.ROOMSTATUS_CLEANING, text: "清掃開始", icon:"edit", color:""},
    {key: SystemConst.ROOMSTATUS_CLEANED, text: "清掃済", icon:"edit", color:""},
  ];

  //#region  ----- context menu 関連 --------------------------------------------------
  statusMenuLeftPx: string;
  statusMenuTopPx: string;
  isDispStatusMenu: boolean = false;
  selectedRowInfo: Cleaning;

  /** 一覧の幅切替 */
  get viewStyle() {
    return{
      'width': this.settingFlag ? '85%' : '100%',
    };
  }

  constructor(private router: Router
              , private authService: AuthService
              , public cleaningService: CleaningService) {

    // Click Event
    document.addEventListener('click', this.hideMenu);

  }

  ngOnDestroy() {
    document.removeEventListener('click', this.hideMenu);
  }

  ngOnInit(): void {

    this._currentUser = this.authService.getLoginUser();
    this.loggedInCompany = this._currentUser.companyInfo;
    this.lostFlg = (this.loggedInCompany.lostFlg == this.lost.Used.toString());

    this.settingFlag = false;

    this.SetColumns();
    this.displayColumns = this.allcolumns;

    // 日付初期化
    this.inputDate = new Date();

    // クリーニングリスト取得
    this.getCleaningList();

  }

  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.cleaningList[rowIndex][cell] = event.target.value;
    this.cleaningList = [...this.cleaningList];
    console.log('UPDATED!', this.cleaningList[rowIndex][cell]);
  }

  /**メニュー以外をクリック時、メニューを非表示にする */
  private hideMenu = (e: any) => {
    if (this.hasClassName(e.target, 'menu') ||
        this.hasClassName(e.target, 'menu-group') ||
        this.hasClassName(e.target, 'menu-item')) {
      return;
    }
    this.isDispStatusMenu = false;
  }

  public onStatusClick(event: MouseEvent, row:Cleaning, rowIndex){

    // HACK: API RoomService の RoomStatusValue と合わせること
    const enum RoomStatusValue {
      Cleaning = 0,
      Cleaned,
      CheckIn,
      Stay,
      CheckOut,   // アウト予定
      CheckOuted, // アウト済
      ChangeFrom,
      ChangeTo,
      StayCleaning,
      StayCleaned
    }

    // 忘れ物管理機能が許可されていない場合、状態変更ボタンは非表示
    if(!this.lostFlg){return;}

    // アサインがない(= 清掃済)、もしくは 客室状態が「清掃開始」「清掃済」「滞在中」「チェックアウト済」「チェンジ元」以外は状態変更ボタンは非表示
    if(row.roomStateDiv == null|| (row.roomStatusValue != RoomStatusValue.Cleaning && row.roomStatusValue != RoomStatusValue.Cleaned
                                    && row.roomStatusValue != RoomStatusValue.Stay && row.roomStatusValue != RoomStatusValue.CheckOuted
                                    && row.roomStatusValue != RoomStatusValue.ChangeFrom
                                    && row.roomStatusValue != RoomStatusValue.StayCleaning && row.roomStatusValue != RoomStatusValue.StayCleaned)){
      return;
    }

    event.preventDefault();

    // メニューをセット
    this.statusButton = new Array<ElementInfo>();
    this.statusButton.push(this.STATUS_BUTTON_LIST.find(f => f.key == SystemConst.ROOMSTATUS_CLEANING));
    this.statusButton.push(this.STATUS_BUTTON_LIST.find(f => f.key == SystemConst.ROOMSTATUS_CLEANED));

    // 更新用のデータ保持
    this.selectedRowInfo = row;
    this.selectedRowInfo.selectedRowIndex = rowIndex;

    this.statusMenuLeftPx = event.clientX + "px";
    this.statusMenuTopPx = (event.clientY - 64) + "px";
    this.isDispStatusMenu = true;

    console.log("onStatusClick");
  }

  public onStatusMenuClick(key:string){

    this.isDispStatusMenu = false;

    // ボタンイベント
    switch(key) {
      case SystemConst.ROOMSTATUS_CLEANING: /*清掃開始*/
        this.cleaningList[this.selectedRowInfo.selectedRowIndex].roomStatus = "清掃開始";
        this.cleaningList[this.selectedRowInfo.selectedRowIndex].roomStateUpdValue = SystemConst.ROOMSTATUS_CLEANING;
        break;
      case SystemConst.ROOMSTATUS_CLEANED: /*清掃済*/
        this.cleaningList[this.selectedRowInfo.selectedRowIndex].roomStatus = "清掃済";
        this.cleaningList[this.selectedRowInfo.selectedRowIndex].roomStateUpdValue = SystemConst.ROOMSTATUS_CLEANED;
        break;
    }
    this.cleaningList[this.selectedRowInfo.selectedRowIndex].isStatusUpdateData = true;
    this.cleaningList = [...this.cleaningList];
    this.selectedRowInfo = null;

  }

  private CreateUpdateInfo(row:Cleaning) : RoomsAssignedInfo {

    let retInfo = new RoomsAssignedInfo();

    let reservNo = row.roomChangeKey.substr(0,8);
    let routeSeq = parseInt(row.roomChangeKey.substr(8,1));

    retInfo.companyNo = this._currentUser.displayCompanyNo;
    retInfo.reserveNo = reservNo;
    retInfo.useDate = row.useDate;
    retInfo.routeSEQ = routeSeq;
    retInfo.updator = this._currentUser.userName;

    retInfo.isStatusUpdateData = row.isStatusUpdateData;
    retInfo.roomStateClass = row.roomStateUpdValue;
    retInfo.cleaningInstruction = row.cleaningInstruction;
    retInfo.cleaningRemarks= row.cleaningRemarks;
    retInfo.isStatusUpdateData = row.isStatusUpdateData;
    retInfo.roomStatusValue = row.roomStatusValue;

    return retInfo;
  }

  public updateRow(row){

    // 更新データ作成
    let updInfo = this.CreateUpdateInfo(row);

    // 客室状態・清掃指示・清掃備考更新
    this.cleaningService.UpdateRoomStatus(updInfo).pipe().subscribe(result => {
      switch(result){
        case DBUpdateResult.Success:
          break;

        case DBUpdateResult.VersionError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.CLEANINGS_LIST + '001')
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, 'アサイン情報' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.CLEANINGS_LIST + '001');
          break;
      }
      this.getCleaningList();
    })

    console.log(row);
  }

  public SetColumns(){

    if(this.lostFlg){
      this.allcolumns = [
        { name: 'フロア', width: 80, prop: CleaningListColumn.Floor, visible: true},
        { name: '部屋番号', width: 80, prop: CleaningListColumn.RoomNo, visible: true},
        { name: '部屋タイプ', width: 100, prop: CleaningListColumn.RoomType, visible: true},
        { name: '喫煙/禁煙' ,width: 80, prop: CleaningListColumn.Smoking, visible: true},
        { name: '状態' , width: 80, prop: CleaningListColumn.RoomStatus, visible: true},
        { name: '泊数' , width: 50, prop: CleaningListColumn.Nights, visible: true},
        { name: '男', width: 30, prop: CleaningListColumn.Man, visible: true},
        { name: '女', width: 30, prop: CleaningListColumn.Woman, visible: true},
        { name: '子A', width: 30, prop: CleaningListColumn.ChildA, visible: true},
        { name: '子B', width: 30, prop: CleaningListColumn.ChildB, visible: true},
        { name: '子C', width: 30, prop: CleaningListColumn.ChildC, visible: true},
        { name: '合計人数', width: 50, prop: CleaningListColumn.MemberTotal, visible: true},
        { name: '清掃指示',width: 130, prop: CleaningListColumn.CleaningInstruction, visible: true},
        { name: '清掃備考',width: 130, prop: CleaningListColumn.CleaningRemarks, visible: true},
        { name: '',width: 20, prop: CleaningListColumn.Register, visible: true},
      ];
    }else{
      this.allcolumns = [
        { name: 'フロア', width: 80, prop: CleaningListColumn.Floor, visible: true},
        { name: '部屋番号', width: 80, prop: CleaningListColumn.RoomNo, visible: true},
        { name: '部屋タイプ', width: 100, prop: CleaningListColumn.RoomType, visible: true},
        { name: '喫煙/禁煙' ,width: 80, prop: CleaningListColumn.Smoking, visible: true},
        { name: '状態' , width: 80, prop: CleaningListColumn.RoomStatus, visible: true},
        { name: '泊数' , width: 50, prop: CleaningListColumn.Nights, visible: true},
        { name: '男', width: 30, prop: CleaningListColumn.Man, visible: true},
        { name: '女', width: 30, prop: CleaningListColumn.Woman, visible: true},
        { name: '子A', width: 30, prop: CleaningListColumn.ChildA, visible: true},
        { name: '子B', width: 30, prop: CleaningListColumn.ChildB, visible: true},
        { name: '子C', width: 30, prop: CleaningListColumn.ChildC, visible: true},
        { name: '合計人数', width: 50, prop: CleaningListColumn.MemberTotal, visible: true},
      ];
    }
  }

  /** クリーニングリスト取得 */
  public getCleaningList(){
    var cond = new CleaningCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.useDate = Common.ToFormatStringDate(this.inputDate);

    this.cleaningService.getCleaningsList(cond).subscribe((result : Cleaning[]) => {
      this.cleaningList = result;
      this.cleaningList.map(x => x.isStatusUpdateData = false);
    });
  }

  /** 日付変更 */
  public onChangeDate(event: Date) {
    this.inputDate = event;
    this.getCleaningList();
  }

  /** 表示設定 項目クリック
   * @param  {} col クリックした項目
   */
  public checked(col) {
    col.visible = !col.visible;
    this.displayColumns = this.allcolumns.filter(c => {
      return c.visible === true;
    });
  }

  /** 表示設定を表示 */
  public showSettings(){
    this.editcolumn = this.displayColumns;
    this.settingFlag = true;
  }

  /** 表示設定 - 保存 */
  public save(){
    this.hideSettings();
  }

  /** 表示設定 - キャンセル */
  public cancel(){
    this.displayColumns = this.editcolumn;
    this.hideSettings();
  }

  /** 表示設定を非表示 */
  private hideSettings(){
    this.settingFlag = false;
  }

  public print(){

    this.cleaningService.printDate = this.inputDate;
    this.cleaningService.header = this.displayColumns;
    this.cleaningService.data = this.cleaningList;

    this.router.navigate([this.printURL]);
  }

  /**ElementのClass名が存在するか取得する */
  private hasClassName = (el: Element, name: string) => {
    return el.className.includes(name);
  }
}
