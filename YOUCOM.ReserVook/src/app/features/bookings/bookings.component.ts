import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { isNullOrUndefined } from 'util';
import { Common } from '../../core/common';
import { SystemConst } from '../../core/system.const';
import { User } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { BookingsService } from './services/bookings.service';
import { BookingsCondition, BookingsInfo } from './model/bookings.model';
import { SharedService } from '../../core/shared.service';


@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})

export class BookingsComponent implements OnInit {

  //#region  ----- 変数 readonly --------------------------------------------------
  //** 予約登録URL */
  private readonly reserveURL = '/company/reserve';

  //** 背景色 選択 */
  private readonly selectCellColor = "#00c853";
  //** 背景色 通常 */
  private readonly defaultCellColor = "White";

  //** 表示日数 */
  private readonly smallDays :number = 7;
  private readonly largeDays :number = 14;
  public readonly dateArr: any[] = [
    { value: this.smallDays, name: `${this.smallDays}日` }
    , { value:this.largeDays, name: `${this.largeDays}日` }
  ];
  //#endregion

  //#region  ----- 変数 Table 関連 --------------------------------------------------
  //** 部屋番号～部屋タイプのみのヘッダ */
  private readonly defaultRoomsHeader:string[] = ['no', 'name', 'type'];
  //** 部屋番号～部屋タイプのみの表示ヘッダ名 */
  public readonly roomsHeaderName: string[] = ['部屋番号', '部屋名', '部屋タイプ'];
  //** 日付部分のヘッダのカラム名 */
  private readonly dateHeaderColumnName : string = "day";

  //** 部屋情報部分のヘッダ(表示用) */
  private roomsHeader : string[] = this.defaultRoomsHeader;
  //** 日付部分のみのヘッダ(day) */
  public dateHeader:string[] = [];
  //** 日付部分のみの表示ヘッダ名(MM/DD) */
  public dateHeaderName: string[];
  //** ヘッダ(表示用) */
  public displayHeaderColumn : string[];
  //** 表示データ */
  public data: Array<BookingsInfo>;
  //#endregion

  //#region  ----- 変数 NgModel --------------------------------------------------
  //** DateTimePickerの値 */
  public inputDate: Date;
  //** 部屋タイプを表示しないフラグ */
  public roomTypeInvisible: boolean = false;
  //** 現在表示する日数 */
  public currentDays: number = this.smallDays;
  //#endregion

  //#region  ----- 変数 マウスドラッグ関連 --------------------------------------------------
  private rowIndex: any;
  private columnIndex: any;
  private sobjs: HTMLTextAreaElement[] = [];
  private cobjs: HTMLTableCellElement[] = [];

  //** 選択中の値 */
  private selectedRoomNo: string;
  private selectedRoomType: string;
  private selectedReserveNo : string;
  private selectedColumnIdx: string[];
  //#endregion

  private _currentUser : User;
  constructor(private router: Router
              , private service: BookingsService
              , private authService:AuthService
              , private SharedService: SharedService) {

    this._currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void {

    moment.locale("ja");  // 曜日を日本語表記にする

    this.selectedColumnIdx = [];
    if (!this.inputDate) {

      if(!isNullOrUndefined(this.SharedService.displayDate)){
        this.inputDate = this.SharedService.displayDate;
      }else{
        this.inputDate = moment().toDate();
      }

      this.getData();
    }
    this.hideRoomTypeColumn();
    this.optionChange();

    this.setMouseEvent();
  }

  ngOnDestroy() {
    // イベント破棄
    document.removeEventListener('contextmenu', this.enableMenu);
    document.removeEventListener('click', this.disableMenu);

    this.SharedService.displayDate = this.inputDate;
  }

  //#region  ----- Data Access --------------------------------------------------
  /** データ取得
   * @param  {moment.Moment} startDate 入力日
   */
  getData() {

    this.dateHeaderName = [];
    let startDate = moment(this.inputDate);
    let dateTemp = moment(this.inputDate);
    let displayDays = this.largeDays;

    // 表示用のカラム名を作成
    for (let i = 0; i < displayDays; i++) {
      this.dateHeaderName.push(dateTemp.format(SystemConst.DATE_FORMAT_MMDD_ddd))
      dateTemp.add(1, 'day');
    }

    // 検索条件設定
    var cond = new BookingsCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.startDate = startDate.format(SystemConst.DATE_FORMAT_YYYYMMDD);
    cond.endDate = dateTemp.add(-1, 'day').format(SystemConst.DATE_FORMAT_YYYYMMDD);
    cond.displayDays = displayDays;

    // データ取得
    this.service.getRoomInfo(cond).subscribe(
      (result: Array<BookingsInfo>) => {
        this.data = [];
        this.data = result;
      }, error => {
        alert(error);
      }
    );
  }
  //#endregion

  //#region  ----- HTML側イベント --------------------------------------------------

  /** アサイン有無
   * @param  {} element 行データ
   * @param  {} index 左からn日目
   * @returns boolean true:アサイン有, false:無
   */
  public selected(element, index) : boolean{
    if(element.assignList == null) return false;

    var result : boolean;
    if(element.assignList[index].reserveNo.length > 0){
      result = true;
    }else{
      result = false;
    }
    return result;
  }

  /** DateTimePicker 日付変更 */
  onChangeDate(event: Date) {
    this.inputDate = event;
    this.getData();
  }

  /** 部屋タイプ 表示切替 */
  hideRoomTypeColumn() {
    // 部屋情報部分ヘッダ作成
    var roomsHeaderColumnsCount = (this.roomTypeInvisible) ? this.roomsHeaderName.length - 1 : this.roomsHeaderName.length;
    this.roomsHeader = this.defaultRoomsHeader.slice(0, roomsHeaderColumnsCount);

    // 表示用ヘッダ作成
    this.displayHeaderColumn = this.roomsHeader.concat(this.dateHeader);
  }

  /** 表示日数変更 */
  optionChange() {
    // 日付部分ヘッダ作成
    this.dateHeader = [];
    for (var day = 1; day <= this.currentDays; day++){
      this.dateHeader.push(`${this.dateHeaderColumnName}${day}`)
    }

    // 表示用ヘッダ作成
    this.displayHeaderColumn = this.roomsHeader.concat(this.dateHeader);
  }
  //#endregion

  //#region  ----- マウスイベント --------------------------------------------------
  //** マウスドラッグ等のイベント */
  private setMouseEvent(){
    var mousedown = false;

    document.onmousedown = (e) => {

      if (e.button == 0) {
        // 左クリック
        mousedown = true;
        var el = e.target as HTMLTextAreaElement;
        this.rowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
        this.columnIndex = (e.target as HTMLTableCellElement).cellIndex;
        this.menuDisplay = false;

        if (el.id == "btnNewReserve") {
          this.createNewReserve();
        } else {
          this.clearSelectCells();
        }
        this.selectedColumnIdx = [];

        if (el.id == "btnUpdateReserve") {
          this.loadReserve(this.selectedReserveNo);
        }
        this.selectedReserveNo = "";

        // セル選択
        if (el.id == "std1" && el.attributes['available'].value == "1") {

          el.style.backgroundColor = this.selectCellColor;

          this.rowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
          this.columnIndex = (e.target as HTMLTableCellElement).cellIndex;

          this.selectedRoomNo = this.data[this.rowIndex].roomNo;
          this.selectedRoomType = this.data[this.rowIndex].roomType;
          if(this.columnIndex >= this.roomsHeader.length  && this.selectedColumnIdx.indexOf(this.columnIndex) < 0 ) {
            this.selectedColumnIdx.push(this.columnIndex);
          }
          this.sobjs.push(el);
          this.cobjs.push((e.target as HTMLTableCellElement));
        }
      }
    }

    document.onmouseup = () => { mousedown = false; }

    document.onmousemove = (e) => {
      var obj = (e.target) ? e.target : e.srcElement;
      var el = obj as HTMLTextAreaElement;

      if (mousedown && el.id == "std1" &&
        (el.parentNode as HTMLTableRowElement).sectionRowIndex == this.rowIndex && this.columnIndex != 0) {

        if (el.attributes['available'].value == "1") {
          el.style.backgroundColor = this.selectCellColor;

          this.rowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
          this.columnIndex = (e.target as HTMLTableCellElement).cellIndex;

          this.selectedRoomNo = this.data[this.rowIndex].roomNo;
          this.selectedRoomType = this.data[this.rowIndex].roomType;
          if(this.columnIndex >= this.roomsHeader.length  && this.selectedColumnIdx.indexOf(this.columnIndex) < 0 ) {
            this.selectedColumnIdx.push(this.columnIndex);
          }
          this.sobjs.push(el);
          this.cobjs.push((e.target as HTMLTableCellElement));
        }
      }
    }

    // イベント監視
    document.addEventListener('contextmenu', this.enableMenu);
    document.addEventListener('click', this.disableMenu);
  }

  /** パラメータを渡して予約登録画面(新規)に遷移 */
  private createNewReserve() {

    // 選択した日付列の最小値/最大値を取得
    var minIdx :number = 999;
    var maxIdx :number = -1;
    this.selectedColumnIdx.forEach((columnIdx) =>{
      var idx = Common.ToNumber(columnIdx);
      if(idx < minIdx) minIdx = idx;
      if(idx > maxIdx) maxIdx = idx;
    });

    // 部屋部分のindexをマイナス
    minIdx -= this.roomsHeader.length;
    maxIdx -= this.roomsHeader.length;

    // DateTimePickerの日付をベースに選択開始日～終了日を算出
    var beginDate = moment(this.inputDate).add(minIdx, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);
    var endDate = moment(this.inputDate).add(maxIdx + 1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);  // 出発日は翌日

    // 予約登録画面に渡すパラメータ作成
    let params = {
      queryParams: {
          'roomNo': this.selectedRoomNo
        , 'roomType': this.selectedRoomType
        , 'arrivalDate': beginDate
        , 'departureDate': endDate
      }
    };

    this.router.navigate([this.reserveURL], params);
  }

  /** 予約番号を渡して予約登録画面(更新)に遷移 */
  private loadReserve(reserveNo: string) {
    this.router.navigate([this.reserveURL, reserveNo]);
  }

  /** 選択中のセルをクリア */
  private clearSelectCells(){
    // 予約登録を押さない場合
    for (var i = 0; i < this.sobjs.length; i++) {
      if (this.sobjs[i].id == "std1" && this.sobjs[i].attributes['available'] && this.sobjs[i].attributes['available'].value == "1") {
        // 背景色を通常色に戻す
        this.sobjs[i].style.backgroundColor = this.defaultCellColor;
      }
    }
    // 保持していた変数を破棄
    this.selectedRoomNo = '';
    this.selectedRoomType = '';
    this.cobjs = [];
    this.sobjs = [];
  }
  //#endregion

  //#region  ----- context menu 関連 --------------------------------------------------
  menuDisplay: boolean = false;
  menuNewRsv: boolean = false;
  menuUpdateRsv: boolean = false;
  menuLeft: String;
  menuTop: String;

  /** コンテキストメニュー表示
   * @param  {any} e
   */
  enableMenu = (e: any) => {
    e.preventDefault();
    if (this.cobjs.length > 0) {
      this.cobjs.sort((a: HTMLTableCellElement, b: HTMLTableCellElement) => {
        if (a.cellIndex > b.cellIndex) {
          return 1;
        } else if (a.cellIndex < b.cellIndex) {
          return -1;
        } else {
          return 0;
        }
      })
      this.menuLeft = e.clientX + "px";
      this.menuTop = (e.clientY - 100) + "px";
      this.menuDisplay = true;
      this.menuNewRsv = true;
    }
  }

  /** コンテキストメニュー非表示
   * @param  {any} e
   */
  disableMenu = (e: any) => {
    if (
      this.hasClassName(e.target, 'menu') ||
      this.hasClassName(e.target, 'menu-group') ||
      this.hasClassName(e.target, 'menu-item')
    ) {
      return;
    }
    this.menuDisplay = false;
    this.menuNewRsv = false;
    this.menuUpdateRsv = false;
  }

  /** ElementのClass名が存在するか取得する */
  private hasClassName = (el: any, name: String) => {
    return el.className.includes(name)
  }

  /** アサイン部屋クリック */
  public onAssignRoomDateClick(event: MouseEvent, element : BookingsInfo, dayIndex : number) {
    event.preventDefault();

    var wkReserveNo = element.assignList[dayIndex].reserveNo;
    if (!isNullOrUndefined(element) && !isNullOrUndefined(wkReserveNo)) {

      // 選択中のセルはクリア
      this.clearSelectCells();

      this.menuLeft = event.clientX + "px";
      this.menuTop = (event.clientY - 100) + "px";
      this.selectedReserveNo = wkReserveNo;
      this.menuDisplay = true;
      this.menuUpdateRsv = true;
      this.menuNewRsv = false;
    }
  }
  //#endregion


}
