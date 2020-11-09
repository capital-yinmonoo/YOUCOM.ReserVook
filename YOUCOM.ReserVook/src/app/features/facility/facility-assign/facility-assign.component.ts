import { ReserveService } from './../../reserve/services/reserve.service';
import { FunctionId, MessagePrefix, SystemConst } from 'src/app/core/system.const';
import { MstFacilityInfo, FacilityTableInfo, TrnFacilityInfo, ColumnInfo, FormMode } from 'src/app/features/facility/model/facility.model';
import { Base } from './../../../shared/model/baseinfo.model';
import { FacilityService } from './../services/facility.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Message, DBUpdateResult } from './../../../core/system.const';
import { isNullOrUndefined } from 'util';
import { User } from 'src/app/core/auth/auth.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/core/common';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ReserveFacilityCondition } from '../model/facility.model';
import { ReserveSearchComponent } from '../../dialog/reservesearch/reservesearch.component';
import { Reserve } from '../../reserve/model/reserve.model';
import { SharedService } from '../../../core/shared.service';

@Component({
  selector: 'app-facility-assign',
  templateUrl: './facility-assign.component.html',
  styleUrls: ['./facility-assign.component.scss']
})

export class FacilityAssignComponent implements OnInit,  AfterViewChecked	 {

//#region ----- Property Color --------------------------------------------------
  /** 背景色 選択 */
  public readonly SELECT_CELL_COLOR = "rgb(0, 200, 83)";
  /** 背景色 通常 */
  private readonly DEFAULT_CELL_COLOR = "rgb(255, 255, 255)";
  /** 背景色 予約済 */
  private readonly RESERVED_CELL_COLOR_TEMPS: string[] = [
    "rgb(192, 224, 255)",
    "rgb(192, 255, 192)",
    "rgb(64, 128, 128)",
    "rgb(255, 192, 192)",
    "rgb(255, 192, 255)",
    "rgb(128, 128, 255)",
    "rgb(128, 192, 255)",
    "rgb(128, 255, 255)",
    "rgb(128, 255, 128)",
    "rgb(255, 203, 148)",
    "rgb(255, 128, 128)",
    "rgb(255, 128, 255)",
    "rgb(0, 0, 255)",
    "rgb(0, 128, 255)",
    "rgb(0, 255, 255)",
    "rgb(255, 222, 176)",
    "rgb(0, 203, 142)",
    "rgb(0, 192, 192)",
    "rgb(0, 128, 0)",
    "rgb(192, 192, 0)",
    "rgb(123, 222, 104)",
    "rgb(128, 128, 0)",
    "rgb(255, 207, 241)",
    "rgb(196, 222, 170)",
    "rgb(189, 121, 55)",
    "rgb(222, 156, 178)",
    "rgb(231, 51, 99)",
    "rgb(162, 218, 225)",
    "rgb(136, 213, 186)",
    "rgb(148, 164, 197)",
    "rgb(229, 174, 0)",
    "rgb(48, 201, 241)",
    "rgb(255, 0, 255)",
  ];

  /**ドラックドロップグループ名 未アサイン=>アサイン用 */
  public readonly DRAGDROP_ASSIGN = "DDAssign";
  /**ドラックドロップグループ名 ルームチェンジ,アサイン変更用 */
  public readonly DRAGDROP_ROOMCHANGE = "DDRoomChange";

//#endregion

//#region ----- Property マウスドラッグ関連 --------------------------------------------------
  /** 選択中の値 */
  private selectedInfo: TrnFacilityInfo;
  private selectedFacilityCode: string;
  private startRowIndex: number;
  private startColumnIndex: number;
  private selectedStartTime: string;
  private endRowIndex: number;
  private endColumnIndex: number;
  private selectedEndTime: string;
  private selectedReserveNo: string;
//#endregion

private headerHeight : number;
private tableHeaderBottom : number;
private selectReserveElement : HTMLElement;

//#region ----- Property Table 関連 --------------------------------------------------
  /**テーブル列　開始時間 (0-24) */
  private readonly BEGIN_COLUMN_HOUR = 6;
  /**テーブル列　終了時間 (0-24) */
  private readonly END_COLUMN_HOUR = 24;
  /**テーブル列　分間隔 (0-60) */
  private readonly INTERVAL_MINUTE = 30;

  /**テーブル列　セル分割数 */
  public readonly INTERVAL = Array( (60 / this.INTERVAL_MINUTE));


  /** 全カラム(timeHHmm) */
  public allTimeColumns : string[];
  /** 時刻カラム(timeHHmm) */
  public timeColumns: string[];
  /** 時カラム(timeHH) */
  public hourColumns: string[];
  /** 時カラム(HH) */
  public hourColumnsName: string[];
  /** 全時カラム(timeHH) */
  public allHourColumns : string[];
  /** 分カラム(mm) */
  public minuteColumnsName: string[];
  /** 最終時刻分カラム(mm) */
  public lastHourminuteColumnsName: string[];

  /** 会場予約 データ */
  private trnData: Array<TrnFacilityInfo>;
  /** 会場マスタ データ */
  public mstData: Array<MstFacilityInfo>;
  /** テーブルデータ */
  public tableData: Array<FacilityTableInfo>;

  private drawing: boolean = false;

  public isDispSubMenu: boolean;
  public subMenuTopPx: string;
  public subMenuLeftPx: string;
  public subMenuInfo: TrnFacilityInfo;
//#endregion

//#region ----- Form Inputs --------------------------------------------------
  // Validation Pattern
  public readonly positiveNumberFormatPattern = '^[0-9]*$';

  // Validation maxLength
  public readonly minMember = 0;
  public readonly maxMember = 999;
  public readonly maxLengthRemarks = 100;
  public readonly lengthReserveNo = 8;

  // Validation Message
  public readonly msgRequid = Message.REQUIRED;
  public readonly msgMinMember = this.minMember.toString() + Message.MIN_DIGITS;
  public readonly msgMaxMember = this.maxMember.toString() + Message.MAX_DIGITS;
  public readonly msgMaxLengthRemarks = this.maxLengthRemarks.toString() + Message.MAX_LENGTH;
  public readonly msgLengthReserveNo = this.lengthReserveNo.toString() + Message.LENGTH;
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  public readonly msgWrongReserveNo = Message.WRONG_RESERVE_NO_ERROR;

  // FormControls
  facilityForm = new FormGroup({
    facilityCode: new FormControl(''),
    startHour: new FormControl(''),
    startMinute: new FormControl(''),
    endHour: new FormControl(''),
    endMinute: new FormControl(''),
    reserveNo: new FormControl('',[Validators.pattern(this.positiveNumberFormatPattern), Validators.minLength(this.lengthReserveNo), Validators.maxLength(this.lengthReserveNo)]),
    reserveName: new FormControl(''),
    facilityMember: new FormControl('',[Validators.pattern(this.positiveNumberFormatPattern), Validators.min(this.minMember), Validators.max(this.maxMember)]),
    facilityRemarks: new FormControl('',[Validators.maxLength(this.maxLengthRemarks)]),
  });

  // Form Mode
  public inputMode: FormMode;
  public readonly EnumFormMode = FormMode;

  /** 存在しない予約番号を入力 */
  public isWrongRsvNo: boolean;
//#endregion

  // Stepper Message
  public msgStep1: string;
  public msgStep2: string;

  /** ログインユーザー情報*/
  private currentUser: User;

  /** 日付(画面入力値)*/
  public inputDate: Date;

  /** 日付(URL Param) */
  private paramDate: string;
  /** 予約番号(URL Param) */
  public paramReserveNo: string;

  /** マウスイベント 設定済 */
  public configured : boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private facilityService: FacilityService,
              private reserveService: ReserveService,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private SharedService: SharedService) {

    this.currentUser = this.authService.getLoginUser();

    this.route.queryParams.subscribe(params => {

      this.inputDate = new Date();

      this.paramReserveNo = params['reserveNo'];
      this.paramDate = params['date'];

      if(!isNullOrUndefined(this.paramDate)){
        this.inputDate = new Date(this.paramDate.substring(0, 4) + "/" + this.paramDate.substring(4, 6) + "/" + this.paramDate.substring(6, 8) + " 00:00:00");
      }else{
        if(!isNullOrUndefined(this.SharedService.displayDate)){
          this.inputDate = this.SharedService.displayDate;
        }
      }

      this.getMasterData();
    });

    this.configured = false;
  }

  ngOnInit(){
    // this.setMouseEvent();
  }

  ngOnDestroy() {
    // イベント破棄
    this.SharedService.displayDate = this.inputDate;
  }

  ngAfterViewChecked() {

    if (!this.configured) {
      this.setMouseEvent();
      this.setScrollEvent();
    }

    // 描写中はbreak
    if (this.drawing) { return; }

    // 編集、登録時のみフォーム入力値をチェック
    if (this.inputMode == this.EnumFormMode.ViewDrag) { return; }

    // 予約番号変更時
    if (this.selectedReserveNo != this.facilityForm.controls["reserveNo"].value && !this.facilityForm.controls["reserveNo"].invalid) {

      // 予約番号を元に利用者名を検索
      const rsvNo: string = this.facilityForm.controls["reserveNo"].value;
      if (!Common.IsNullOrEmpty(rsvNo) && rsvNo.length == 8){
        this.getReserveName();
      } else {
        this.facilityForm.controls["reserveName"].setValue("");
      }

      this.selectedReserveNo = this.facilityForm.controls["reserveNo"].value;
      return;
    }
    this.selectedReserveNo = this.facilityForm.controls["reserveNo"].value;

    // 会場,時刻が変更された場合のみ、Elementを塗り直す
    if (this.selectedStartTime == this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value &&
        this.selectedEndTime == this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value &&
        this.selectedFacilityCode == this.facilityForm.controls["facilityCode"].value) {
      return;
    }

    // 開始時間 > 終了時間はエラー
    if (this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value >= this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value) {
      Common.modalMessageError(Message.TITLE_ERROR, "開始時間を終了時間より前に指定してください。", MessagePrefix.ERROR + FunctionId.FACILITY + '001');

      // 元の値に戻す
      this.facilityForm.controls["startHour"].setValue(this.selectedStartTime.substring(0, 2));
      this.facilityForm.controls["startMinute"].setValue(this.selectedStartTime.substring(2, 4));
      this.facilityForm.controls["endHour"].setValue(this.selectedEndTime.substring(0, 2));
      this.facilityForm.controls["endMinute"].setValue(this.selectedEndTime.substring(2, 4));

    } else {
      // Elementを塗り直す
      this.clearSelectCells();
      this.drawSelectedCell(true, true);
    }

  }

  /** DateTimePicker 日付変更 */
  public onChangeDate(event: Date) {
    this.inputDate = event;
    this.getMasterData();
  }

  // /** Data取得 */
  // public getData(){
  //   this.paramDate = Common.ToFormatStringDate(this.inputDate);
  //   if (!isNullOrUndefined(this.paramReserveNo) && this.paramReserveNo.length == 8){
  //     const params = { queryParams: {"date": this.paramDate, "reserveNo" : this.paramReserveNo } };
  //     this.router.navigate(['company/facility'], params);

  //   } else {
  //     const params = { queryParams: { "date": this.paramDate } };
  //     this.router.navigate(['company/facility'], params);
  //   }
  // }

  // /** 開始時間～終了時間までセル結合
  //  * @param  {string} startTime 開始時間
  //  * @param  {string} endTime 終了時間
  //  * @returns number 結合するセルの数
  //  */
  // private calcColSpan(element: FacilityTableInfo, index: number) : number {

  //   let result = 1;
  //   let hasReserve = this.selected(element, index);
  //   if(!hasReserve) return result;

  //   let tableInfo = element.facilityInfo[index];
  //   if (tableInfo.time != tableInfo.info.startTime) return result;

  //   let diff = Common.getTimeDiff(tableInfo.info.endTime, tableInfo.info.startTime);
  //   result = diff / this.INTERVAL_MINUTE;

  //   return result;
  // }

  public isStartTime(element, index) : boolean{

    // 予約なし
    if (!this.selected(element, index)) return false;

    // 予約あり(開始時間でない)
    let tableInfo = element.facilityInfo[index];
    if (tableInfo.time != tableInfo.info.startTime) return false;

    // 予約あり(開始時間)
    return true;
  }

  /** 予約DivのStyleをセット
   * @param  {} column
   * @param  {} element
   * @param  {} index
   */
  public setStyle_RsvDiv(column, element, index){

    if (!this.isStartTime(element, index)) return;

    let rectWidth : number = 0;
    let firstTimeIdx : number = this.timeColumns.indexOf(column);

    if(firstTimeIdx != -1){
      // 開始時間帯から終了時間帯までのブロックの横幅を取得
      let fSeq = element.facilityInfo[index].info.facilitySeq;
      let list = element.facilityInfo.filter(x => x.info != null && x.info.facilitySeq == fSeq);

      for(let i = 0; i < list.length; i++){
        let target2 = document.getElementById(element.facilityCode + this.timeColumns[firstTimeIdx + i]);
        if (isNullOrUndefined(target2)) return;
        let elementPosition2 = target2.getBoundingClientRect();
        rectWidth += elementPosition2.width;
      }
    }else{
      // 存在しない時間が指定されている場合はエラー
      return;
    }

    let target = document.getElementById(element.facilityCode + column);
    if (isNullOrUndefined(target)) return;

    let elementPosition = target.getBoundingClientRect();

    //let colspan = this.calcColSpan(element, index);
    let bottom = elementPosition.bottom - this.headerHeight

    let style  = {
      'top'    : `${elementPosition.top - this.headerHeight}px`,
      'width'  : `${rectWidth - 2}px`,
      'height' : `${elementPosition.height - 1}px`,
      'background-color': this.setBackgroundColor(element, index),
      'display' : ( bottom < this.tableHeaderBottom ) ? 'none' : 'inherit',
      'z-index' : element.facilityInfo[index].info.facilitySeq
    }

    return style;
  }

  /** 予約Divに選択色をセット
   * @param  {} element
   * @param  {} index
   * @returns void
   */
  public setSelectColor_RsvDiv(element, index) : void{
    let target = document.getElementById(element.facilityCode + element.facilityInfo[index].info.facilitySeq);
    target.style.backgroundColor =  this.SELECT_CELL_COLOR;
    this.selectReserveElement = target;
  }


  /**Success系メッセージはSnackBarで出す */
  private showSnackBar(msg: string) {
    this.snackBar.open(msg, "×", {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 3 * 1000, /*3sec表示*/
    });
  }

//#region  ----- Data Access --------------------------------------------------
  /** 会場マスタデータ取得 */
  public getMasterData() {

    this.paramDate = Common.ToFormatStringDate(this.inputDate);

    this.clearForms();

    let base = new Base();
    base.companyNo = this.currentUser.displayCompanyNo;

    this.facilityService.getList(base).subscribe(
      (result: Array<MstFacilityInfo>) => {
        this.mstData = [];
        this.mstData = result;

        this.createTable();
      }, error => {
        alert(error);
      }
    );

  }

  /** 表示用テーブル作成 */
  private createTable(){

    // initialize
    this.tableData = [];
    this.timeColumns = [];
    this.hourColumns = [];
    this.hourColumnsName = [];
    this.minuteColumnsName = [];
    this.lastHourminuteColumnsName = [];
    this.allHourColumns = ["facilityName"];
    this.allTimeColumns = ["facilityName"];

    let isFirstLoopHour = true;
    let isFirstLoopMinute = true;

    // create table data
    this.mstData.forEach(row => {

      let facilityInfo = new FacilityTableInfo();
      facilityInfo.facilityCode = row.facilityCode;
      facilityInfo.facilityName = row.facilityName;
      facilityInfo.displayOrder = row.displayOrder;

      for(let h: number = this.BEGIN_COLUMN_HOUR; h < this.END_COLUMN_HOUR ; h++){

        for(let m: number = 0; m < 60; m += this.INTERVAL_MINUTE){

          let columnInfo = new ColumnInfo();
          columnInfo.time = h.toString().padStart(2, "0") + m.toString().padStart(2, "0");
          columnInfo.info = null;
          facilityInfo.facilityInfo.push(columnInfo);

          if(isFirstLoopHour){
            this.timeColumns.push("time" + h.toString().padStart(2, "0") + m.toString().padStart(2, "0"));
            this.allTimeColumns.push("time" + h.toString().padStart(2, "0") + m.toString().padStart(2, "0"));
          }

          if (isFirstLoopMinute) { this.minuteColumnsName.push(m.toString().padStart(2, "0")); }
        }
        isFirstLoopMinute = false;

        if(isFirstLoopHour){
          this.hourColumns.push("time" + h.toString().padStart(2, "0"));
          this.hourColumnsName.push(h.toString().padStart(2, "0"));
          this.allHourColumns.push("time" + h.toString().padStart(2, "0"));
        }

      }

      this.tableData.push(facilityInfo);
      isFirstLoopHour = false;

    });

    this.lastHourminuteColumnsName = [...this.minuteColumnsName];
    this.lastHourminuteColumnsName.push("59");

    this.getTrnData();

  }

  /** 会場予約データ取得 */
  private getTrnData(){

    const cond: ReserveFacilityCondition = {
      companyNo: this.currentUser.displayCompanyNo,
      useDate: Common.ToFormatStringDate(this.inputDate),
    };

    this.facilityService.getReserveFacilityList(cond).subscribe(
      (result: Array<TrnFacilityInfo>) => {
        this.trnData = [];
        this.trnData = result;

        this.setTrnData();

      }, error => {
        alert(error);
      }
    );

  }

  /** 会場予約データセット */
  private setTrnData(){

    let colorIdx = 0;
    const colors = this.RESERVED_CELL_COLOR_TEMPS; //function内から参照できないためlocal constにセット

    // tableData の一致する時間へ TrnData と表示用背景色をセット
    this.trnData.forEach(data => {

      const rowIdx = this.tableData.findIndex(f => f.facilityCode == data.facilityCode);
      const idx = this.tableData[rowIdx].facilityInfo.filter(function(value, index, array){

        if(value.time >= data.startTime && value.time < data.endTime){
          array[index].info = data;
          array[index].backgroundcolor = colors[colorIdx];
        }

      });

      colorIdx > colors.length ? colorIdx = 0 : colorIdx++;
    });

  }

  /** 予約の利用者名を取得してフォームへセット */
  private getReserveName() {

    let cond: Reserve = new Reserve();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.reserveNo = this.facilityForm.controls["reserveNo"].value;

    this.reserveService.getReserveInfoByPK(cond).subscribe(result => {
      if (result && !isNullOrUndefined(result.guestInfo)) {
        this.facilityForm.controls["reserveName"].setValue(result.guestInfo.guestName);
        this.isWrongRsvNo = false;
      }
      else {
        this.facilityForm.controls["reserveName"].setValue("");
        this.isWrongRsvNo = true;
        Common.modalMessageError(Message.TITLE_ERROR, Message.WRONG_RESERVE_NO_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY + '002');
      }
    });

  }

  /** 保存 */
  public save(){

    switch(this.inputMode){
      case FormMode.EditAdd :
        this.add();
        break;

      case FormMode.EditUpdate :
        this.update();
        break;

      default :
        break;
    }
  }

  /** 追加 */
  private add(){

    let info = new TrnFacilityInfo();
    info.companyNo = this.currentUser.displayCompanyNo;
    info.creator = this.currentUser.userName;
    info.version = 0; //APIでnullエラーを避ける為、仮でセット

    info.facilityCode = this.facilityForm.controls["facilityCode"].value;
    info.useDate = Common.ToFormatStringDate(this.inputDate);
    info.facilitySeq = 0; //APIでnullエラーを避ける為、仮でセット
    info.startTime = this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value;
    info.endTime = this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value;
    info.facilityMember = Common.ToNumber(this.facilityForm.controls["facilityMember"].value);
    info.facilityRemarks = this.facilityForm.controls["facilityRemarks"].value;
    info.reserveNo = this.facilityForm.controls["reserveNo"].value;

    this.facilityService.AddReserveFacility(info).pipe().subscribe(result => {
      switch(result) {
        case DBUpdateResult.Success:
          this.showSnackBar("会場予約" + Message.INSERT_SUCCESS_NOTICE);
          break;

        case DBUpdateResult.OverlapError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.FACILITY + '001');
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, "会場予約" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY + '003');
          break;
      }

      this.clear(true);
    });

  }

  /** 更新 */
  private update(){

    // 値セット
    let info = this.selectedInfo;
    info.companyNo = this.currentUser.displayCompanyNo;
    info.updator = this.currentUser.userName;
    info.facilityCode = this.facilityForm.controls["facilityCode"].value;
    info.startTime = this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value;
    info.endTime = this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value;

    info.facilityMember = Common.ToNumber(this.facilityForm.controls["facilityMember"].value);
    info.facilityRemarks = this.facilityForm.controls["facilityRemarks"].value;
    info.reserveNo = this.facilityForm.controls["reserveNo"].value;

    this.facilityService.UpdateReserveFacility(info).pipe().subscribe(result => {
      switch (result) {
        case DBUpdateResult.Success:
          this.showSnackBar("会場予約" + Message.UPDATE_SUCCESS_NOTICE);
          break;

        case DBUpdateResult.VersionError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.FACILITY + '002');
          break;

        default :
          Common.modalMessageError(Message.TITLE_ERROR, "会場予約" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY + '004');
          break;
      }

      this.clear(true);
    });
  }

  /** 削除 */
  public delete(){

    const msg = `会場:${this.mstData.find(f => f.facilityCode == this.selectedInfo.facilityCode).facilityName}<br>`
              + `${this.selectedInfo.startTime.substring(0, 2)}時${this.selectedInfo.startTime.substring(2, 4)}分～`
              + `${this.selectedInfo.endTime.substring(0, 2)}時${this.selectedInfo.endTime.substring(2, 4)}分<br>`
              + `予約${Message.DELETE_CONFIRM}`;

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, msg, null, MessagePrefix.CONFIRM + FunctionId.FACILITY + '001').then(res => {

      if(res){
        // 値セット
        let info = this.selectedInfo;
        info.companyNo = this.currentUser.displayCompanyNo;
        info.updator = this.currentUser.userName;

        this.facilityService.DeleteReserveFacility(info).pipe().subscribe(result => {
          switch (result) {
            case DBUpdateResult.Success:
              this.showSnackBar("会場予約" + Message.DELETE_SUCCESS_NOTICE);
              break;

            case DBUpdateResult.VersionError:
              Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.FACILITY + '003');
              break;

            default :
              Common.modalMessageError(Message.TITLE_ERROR, "会場予約" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY + '005');
              break;
          }

          this.clear(true);

        });
      }

      this.clear(true);

    });

  }

  /** 中止 */
  public clear(reload :boolean){
    this.changeInputMode(FormMode.ViewDrag);
    this.clearSelectCells();
    this.clearForms();

    if(reload){
      this.paramReserveNo = "";
      this.getMasterData();
    }
  }

//#endregion

//#region  ----- Mouse Event --------------------------------------------------
  public setScrollEvent(){

    let scrollElement = document.getElementById('scroll');
    if (isNullOrUndefined(scrollElement)) return;

    scrollElement.onscroll = (e) => { };
  }

  /** マウスドラッグ等のイベント */
  public setMouseEvent(){

    let scheduleElement = document.getElementById('schedule');
    let headerElement = document.getElementById("header");
    let tableHeaderElement = document.getElementById("table-header");

    if (isNullOrUndefined(scheduleElement) || isNullOrUndefined(headerElement) || isNullOrUndefined(tableHeaderElement)) return;

    this.headerHeight = headerElement.getBoundingClientRect().height;
    this.tableHeaderBottom = tableHeaderElement.getBoundingClientRect().bottom - this.headerHeight;

    let mousedown = false;

    // クリック
    scheduleElement.onpointerdown = (e) => {

      this.clear(false);

      let el = e.target as HTMLTextAreaElement;

      let facilityCode =  el.getAttribute("facilityCode");
      if (isNullOrUndefined(facilityCode) || facilityCode == ""){
        return;
      }

      if (this.inputMode == FormMode.ViewDrag && e.button == 0) {
        // 左クリック
        mousedown = true;

        // 既予約をクリック
        let seq = el.getAttribute("facilitySeq");
        if (!(isNullOrUndefined(seq) || seq == "")){

          // 更新モード
          this.changeInputMode(FormMode.EditUpdate);

          const rowData = this.tableData.find(f => f.facilityCode == el.getAttribute("facilityCode"));
          this.selectedInfo = rowData.facilityInfo.find(f2 => !isNullOrUndefined(f2.info) && f2.info.facilitySeq == Common.ToNumber(seq)).info;

          // 入力部にセット
          this.facilityForm.controls["facilityCode"].setValue(this.selectedInfo.facilityCode);
          this.facilityForm.controls["startHour"].setValue(this.selectedInfo.startTime.substring(0, 2));
          this.facilityForm.controls["startMinute"].setValue(this.selectedInfo.startTime.substring(2, 4));
          this.facilityForm.controls["endHour"].setValue(this.selectedInfo.endTime.substring(0, 2));
          this.facilityForm.controls["endMinute"].setValue(this.selectedInfo.endTime.substring(2, 4));
          this.facilityForm.controls["reserveNo"].setValue(this.selectedInfo.reserveNo);
          this.facilityForm.controls["reserveName"].setValue(this.selectedInfo.guestName);
          this.facilityForm.controls["facilityMember"].setValue(this.selectedInfo.facilityMember);
          this.facilityForm.controls["facilityRemarks"].setValue(this.selectedInfo.facilityRemarks);
          // 予約画面から遷移時、予約番号をセット
          if (!isNullOrUndefined(this.paramReserveNo) && this.paramReserveNo.length == 8) {
            this.facilityForm.controls["reserveNo"].setValue(this.paramReserveNo);

            // 予約番号を元に利用者名を検索
            this.getReserveName();
          }

          // テーブル選択肢保持用変数にセット
          this.selectedStartTime = this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value;
          this.selectedEndTime = this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value;
          this.selectedFacilityCode = this.facilityForm.controls["facilityCode"].value;

          this.drawSelectedCell(false, false);
          return;
        }

        this.clearSelectCells();

        this.startRowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
        this.startColumnIndex = (e.target as HTMLTableCellElement).cellIndex;

      }
    }

    // pointerup
    // pointerupはタイムスケジュールの範囲外でも反応させる
    document.onpointerup = (e) => {

      if(this.inputMode != FormMode.ViewDrag) { return; }

      mousedown = false;

      // let el = e.target as HTMLTextAreaElement;
      // this.endRowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
      this.endRowIndex = this.startRowIndex;

      let element = (e.target as HTMLTableCellElement);
      this.endColumnIndex = !isNullOrUndefined(element.cellIndex) ? element.cellIndex : Common.ToNumber(element.getAttribute('cellIndex'));
      let facilityCode = element.getAttribute('facilityCode');

      if(this.startRowIndex >= 0 && this.endRowIndex >= 0 && this.startRowIndex == this.endRowIndex && !isNullOrUndefined(facilityCode) ) {

        // 新規作成モード
        this.changeInputMode(FormMode.EditAdd);
        // ドラック範囲を選択色で塗りつぶし
        this.drawSelectedCell(true, true);

      } else {
        this.clear(false);
        // ドラック範囲を選択色で塗りつぶし
        this.drawSelectedCell(false, false);
      }
    }

    // ドラッグ
    scheduleElement.onpointermove = (e) => {

      if(!mousedown) { return; }

      let obj = (e.target) ? e.target : e.srcElement;
      let el = obj as HTMLTextAreaElement;

      this.endRowIndex = (el.parentNode as HTMLTableRowElement).sectionRowIndex;
      this.endColumnIndex = (e.target as HTMLTableCellElement).cellIndex;

      if(this.startRowIndex >= 0 && this.endRowIndex >= 0 && this.startRowIndex == this.endRowIndex){
        // ドラック範囲を選択色で塗りつぶし
        this.drawSelectedCell(false, false);
      }

    }

    this.configured = true;
  }



  //#endregion

//#region  ----- Html Event --------------------------------------------------
  /** 予約有無
   * @param {FacilityTableInfo} element 行データ
   * @param {number} index 左からのindex
   * @returns {boolean} true:会場予約有, false:無
   */
  public selected(element: FacilityTableInfo, index: number) : boolean{
    if(element.facilityInfo == null) return false;

    if(isNullOrUndefined(element.facilityInfo[index].info)){
      return false;
    } else {
      return true;
    }
  }

  public setBackgroundColor(element: FacilityTableInfo, index: number) : string{

    let hasReserve = this.selected(element, index);
    if(!hasReserve) return this.DEFAULT_CELL_COLOR;

    return element.facilityInfo[index].backgroundcolor;
  }

  /** 色を通常色に戻す(すべてのセル)
   * @param  {HTMLCollectionOf<Element>} el
   */
  private clearCellAll(elements : HTMLCollectionOf<Element>){
    for(let i = 0; i < elements.length; i++){
      let el = elements.item(i) as HTMLTextAreaElement;

      this.clearCell(el);
    }
  }


  /** 色を通常色に戻す(指定セル)
   * @param  {HTMLTextAreaElement} el
   */
  private clearCell(el : HTMLTextAreaElement){
    el.style.backgroundColor = el.getAttribute("defaultColor");
  }



  /**
   * 選択範囲のセルを塗りつぶす
   * @param isBreakOverLap True:既予約と重複がある場合エラーメッセージと共に処理を中断 False:塗りつぶさずに処理を続行
   * @param isSetInputForms True:塗りつぶし範囲を元にInputFormに値をセット False:セットしない
   */
  private drawSelectedCell(isBreakOverLap: boolean, isSetInputForms: boolean) {

    this.drawing = true;

    // table element の塗りつぶし
    const elements = document.getElementsByClassName("cell");

    // 時刻期間取得
    let startTime: string;
    let endTime: string;
    const maxtimeIdx = this.timeColumns.length;
    const maxtimeHeader = "2359";

    const formSTime: string = this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value;
    const formETime: string = this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value;
    if(formSTime.length == 4 && formETime.length == 4){
      startTime = formSTime;
      endTime = formETime;
    } else if (this.startColumnIndex > this.endColumnIndex) {
      startTime = this.timeColumns[this.endColumnIndex - 1];
      endTime = this.startColumnIndex == maxtimeIdx ? maxtimeHeader : this.timeColumns[this.startColumnIndex];
    } else {
      startTime = this.timeColumns[this.startColumnIndex - 1];
      endTime = this.endColumnIndex == maxtimeIdx ? maxtimeHeader : this.timeColumns[this.endColumnIndex];
    }

    if(isNullOrUndefined(startTime) || isNullOrUndefined(endTime)) {
      this.clearCellAll(elements);
      return;
    }

    startTime = startTime.replace("time", "");
    endTime = endTime.replace("time", "");

    // 会場コード取得
    let facilityCode: string;
    const formFacilityCode = this.facilityForm.controls["facilityCode"].value;
    if(!isNullOrUndefined(formFacilityCode) && formFacilityCode != ""){
      facilityCode = formFacilityCode;
    } else {
      facilityCode = this.tableData[this.startRowIndex].facilityCode;
    }

    for(let i = 0; i < elements.length; i++){

      let el = elements.item(i) as HTMLTextAreaElement;

      // 選択行と違う会場
      if (el.getAttribute("facilityCode") != facilityCode){
        this.clearCell(el);
        continue;
      }

      // 選択範囲外の時間帯は色を未選択にする
      if (!(startTime <= el.getAttribute("time").replace("time", "")
           && el.getAttribute("time").replace("time", "") < endTime)) {
        this.clearCell(el);
        continue;
      }

      // 選択範囲内に予約あり
      if (el.getAttribute("available") == "0") {

        if ( this.inputMode != FormMode.EditUpdate
            || (this.inputMode == FormMode.EditUpdate
                && !isNullOrUndefined(el.getAttribute("facilitySeq"))
                && el.getAttribute("facilitySeq") != ""
                && el.getAttribute("facilitySeq") != this.selectedInfo.facilitySeq.toString() )){

          // 選択範囲内に他予約との重複あり
          if (isBreakOverLap){
            // エラーでBreak
            Common.modalMessageError(Message.TITLE_ERROR, "他の予約と重複している為、指定できません。", MessagePrefix.ERROR + FunctionId.FACILITY + '006').then(() => {
              this.clear(false);
              this.drawSelectedCell(false, false);
            });
            break;

          } else {
            // そのままContinue
            continue;
          }

        } else {
          el.style.backgroundColor = this.SELECT_CELL_COLOR;
        }

      } else {
        // 選択範囲内に他予約との重複なしで,塗れていない対象範囲セルを選択色で塗りつぶし
        if (el.style.backgroundColor == "" || el.style.backgroundColor == this.DEFAULT_CELL_COLOR){
          el.style.backgroundColor = this.SELECT_CELL_COLOR;
        }
      }
    }

    if(isSetInputForms){

      // 入力部にセット
      this.facilityForm.controls["startHour"].setValue(startTime.substring(0, 2));
      this.facilityForm.controls["startMinute"].setValue(startTime.substring(2, 4));
      this.facilityForm.controls["endHour"].setValue(endTime.substring(0, 2));
      this.facilityForm.controls["endMinute"].setValue(endTime.substring(2, 4));
      this.facilityForm.controls["facilityCode"].setValue(facilityCode);

      if (Common.IsNullOrEmpty(this.facilityForm.controls["reserveNo"].value)) {
        this.facilityForm.controls["reserveNo"].setValue(this.paramReserveNo);
      }

      // テーブル選択肢保持用変数にセット
      this.selectedStartTime = this.facilityForm.controls["startHour"].value + this.facilityForm.controls["startMinute"].value;
      this.selectedEndTime = this.facilityForm.controls["endHour"].value + this.facilityForm.controls["endMinute"].value;
      this.selectedFacilityCode = this.facilityForm.controls["facilityCode"].value;

    }

    this.drawing = false;

  }

  /** 選択中のセルをクリア */
  private clearSelectCells(){

    if(this.inputMode != FormMode.ViewDrag) { return; }

    this.selectedInfo = null;
    this.startColumnIndex = null;
    this.startRowIndex = null;
    this.endColumnIndex = null;
    this.endRowIndex = null;
    // 選択中の予約があれば通常色に戻す
    if (!isNullOrUndefined(this.selectReserveElement)){
      this.selectReserveElement.style.backgroundColor = this.selectReserveElement.getAttribute("defaultColor");
    }
    this.selectReserveElement = null;
  }

  /**入力フォームをクリア */
  private clearForms() {

    this.facilityForm.controls["facilityCode"].setValue("");
    this.facilityForm.controls["startHour"].setValue("");
    this.facilityForm.controls["startMinute"].setValue("");
    this.facilityForm.controls["endHour"].setValue("");
    this.facilityForm.controls["endMinute"].setValue("");
    this.facilityForm.controls["reserveNo"].setValue("");
    this.facilityForm.controls["reserveName"].setValue("");
    this.facilityForm.controls["facilityMember"].setValue("");
    this.facilityForm.controls["facilityRemarks"].setValue("");

    this.changeInputMode(FormMode.ViewDrag);
    this.isWrongRsvNo = false;
  }

  /** 入力状態変更
   * @remarks html側で<mat-input>かつformControlNameで指定している場合,一部属性セットが効かないのでts側で制御するため
   */
  private changeInputMode(mode: FormMode){

    this.inputMode = mode;

    switch(mode){
      case FormMode.ViewDrag:
        this.facilityForm.controls["facilityCode"].disable();
        this.facilityForm.controls["startHour"].disable();
        this.facilityForm.controls["startMinute"].disable();
        this.facilityForm.controls["endHour"].disable();
        this.facilityForm.controls["endMinute"].disable();
        this.facilityForm.controls["reserveNo"].disable();
        this.facilityForm.controls["reserveName"].disable();
        this.facilityForm.controls["facilityMember"].disable();
        this.facilityForm.controls["facilityRemarks"].disable();

        if(!isNullOrUndefined(this.paramReserveNo) && this.paramReserveNo.length == 8){
          this.msgStep1 = `予約番号:${this.paramReserveNo}の`;
        } else {
          this.msgStep1 = "";
        }
        this.msgStep1 += "新規予約は空いている会場と時間帯をドラック＆ドロップ、予約編集は既存予約をクリックしてください。";
        this.msgStep2 = "";
        break;

      case FormMode.EditUpdate:
        this.facilityForm.controls["facilityCode"].enable();
        this.facilityForm.controls["startHour"].enable();
        this.facilityForm.controls["startMinute"].enable();
        this.facilityForm.controls["endHour"].enable();
        this.facilityForm.controls["endMinute"].enable();
        this.facilityForm.controls["reserveNo"].enable();
        this.facilityForm.controls["reserveName"].enable();
        this.facilityForm.controls["facilityMember"].enable();
        this.facilityForm.controls["facilityRemarks"].enable();

        this.msgStep2 = "登録内容を編集後、保存をクリックしてください。";
        break;

      case FormMode.EditAdd:
        this.facilityForm.controls["facilityCode"].enable();
        this.facilityForm.controls["startHour"].enable();
        this.facilityForm.controls["startMinute"].enable();
        this.facilityForm.controls["endHour"].enable();
        this.facilityForm.controls["endMinute"].enable();
        this.facilityForm.controls["reserveNo"].enable();
        this.facilityForm.controls["reserveName"].enable();
        this.facilityForm.controls["facilityMember"].enable();
        this.facilityForm.controls["facilityRemarks"].enable();

        this.msgStep2 = "登録内容を入力後、保存をクリックしてください。";
        break;
    }

  }

  /** 利用者検索画面を起動 */
  public reserveSearch(){

    let dialogRef = this.dialog.open(ReserveSearchComponent, { width: '70vw', height: 'auto', data: Common.ToFormatStringDate(this.inputDate) });

    // 戻り値があれば利用者情報にセット
    dialogRef.afterClosed().subscribe(result => {
      if(!Common.IsNullOrEmpty(result)){
        this.facilityForm.controls["reserveNo"].setValue(result.reserveNo);
        this.facilityForm.controls["reserveName"].setValue(result.nameKanji);
      }
    });

  }

  /** 会場テーブルmouseover  */
  public onMouseoverTable(event: MouseEvent, info: TrnFacilityInfo){
    event.preventDefault();

    if (!isNullOrUndefined(info) && info.status == SystemConst.STATUS_USED) {

      // サブメニューをセット
      this.subMenuInfo = info;
      this.subMenuLeftPx = (event.clientX + 10) + "px";
      this.subMenuTopPx = (event.clientY - 64) + "px";
      this.isDispSubMenu = true;
    }
  }

  /** 会場テーブルmouseout */
  public onMouseoutTable(event: MouseEvent){
    event.preventDefault();

    this.subMenuInfo = new TrnFacilityInfo();
    this.isDispSubMenu = false;

  }

//#endregion
}
