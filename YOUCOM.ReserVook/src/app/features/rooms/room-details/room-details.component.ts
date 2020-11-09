import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/auth/auth.model';
import { RoomService } from '../services/room.service';
import { Reserve, GuestInfo } from '../../reserve/model/reserve.model';
import { Message, SystemConst, DBUpdateResult, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import { Common } from 'src/app/core/common';
import moment from 'moment';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { RoomDetailsInfo, UpdateRoomDetails } from '../model/rooms.model';
import { HeaderService } from 'src/app/core/layout/header/header.service';


@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.scss']
})

export class RoomDetailsComponent implements OnInit, OnDestroy {

  //#region ----- readonly --------------------------------------------------
  private readonly myURL : string = "/company/rooms/details";
  public readonly numberFormatPattern = '^[-]?[0-9]*$';
  public readonly phoneFormatPattern = '^[0-9-+ ]*$';
  public readonly kanaFormatPattern = '^[0-9０-９a-zA-Zァ-ンヴー 　]*$';
  public readonly zipFormatPattern = '(\\d{3})[-]?(\\d{4})';
  public readonly emailFormatPattern = '^([a-zA-Z0-9_\\-\\.\\@])*$';

  public readonly minZero = 0;
  public readonly maxMember = 999;
  public readonly maxLengthPhone = 20;
  public readonly maxLengthName = 50;
  public readonly maxLengthEmail = 60;
  public readonly maxLengthText = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字とハイフン(-)で入力してください。 */
  public readonly msgPatternPhone = Message.PATTERN_PHONE;
  //** 英字、数字、記号(_-.@)を半角で入力してください。 */
  public readonly msgPatternEmail = Message.PATTERN_EMAIL;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 形式(999-9999)で入力してください。 */
  public readonly msgPatternZip = Message.PATTERN_ZIP;

  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPhone = this.maxLengthPhone.toString() + Message.MAX_LENGTH;
  //** 50文字以下で入力してください。 */
  public readonly msgMaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
  //** 60文字以下で入力してください。 */
  public readonly msgMaxLengthEmail = this.maxLengthEmail.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLengthText = this.maxLengthText.toString() + Message.MAX_LENGTH;

  //** 0以上の値で入力してください。 */
  public readonly msgMin0 = this.minZero.toString() + Message.MIN_DIGITS;
  //** 999以下の値で入力してください。 */
  public readonly msgMax999 = this.maxMember.toString() + Message.MAX_DIGITS;
  //** は */
  public readonly msgIs = "は";
  //** n行目 */
  public readonly msgLine = "行目";


  public readonly assignFormListName : string = 'assignFormList';

  public readonly assignListHeaderColumns = [
    { name: 'No', width: 40, prop: 'routeSEQ', type: 'label', textalign: 'right', flozenleft: true, total: false, required: false, pattern: null, min: null, max: null },
    { name: '部屋番号', width: 80, prop: 'roomNo', type: 'label', textalign: 'left', flozenleft: true, total: false,  required: false, pattern: null, min: null, max: null },
    { name: '部屋タイプ', width: 200, prop: 'roomtypeName', type: 'label', textalign: 'left', flozenleft: true, total: false,  required: false, pattern: null, min: null, max: null },
    { name: '利用者名' , width: 300, prop: 'guestName', type: 'text', textalign: 'left', flozenleft: false, total: true,   required: true, pattern: null, min: null, max: this.msgMaxLengthName },
    { name: '利用者名カナ' , width: 300, prop: 'guestNameKana', type: 'text', textalign: 'left', flozenleft: false, total: true,   required: true, pattern: this.msgPatternKana, min: null, max: this.msgMaxLengthName },
    { name: '男', width: 80, prop: 'memberMale', type: 'number', textalign: 'right', flozenleft: false, total: true,   required: true, pattern: null, min: this.msgMin0, max: this.msgMax999 },
    { name: '女', width: 80, prop: 'memberFemale', type: 'number', textalign: 'right', flozenleft: false, total: true,   required: true, pattern: null, min: this.msgMin0, max: this.msgMax999 },
    { name: '子A', width: 80, prop: 'memberChildA', type: 'number', textalign: 'right', flozenleft: false, total: true,   required: true, pattern: null, min: this.msgMin0, max: this.msgMax999 },
    { name: '子B', width: 80, prop: 'memberChildB', type: 'number', textalign: 'right', flozenleft: false, total: true,   required: true, pattern: null, min: this.msgMin0, max: this.msgMax999 },
    { name: '子C', width: 80, prop: 'memberChildC', type: 'number', textalign: 'right', flozenleft: false, total: true,   required: true, pattern: null, min: this.msgMin0, max: this.msgMax999 },
    { name: '合計人数', width: 80, prop: 'memberTotal', type: 'label', textalign: 'right', flozenleft: false, total: true,   required: false, pattern: null, min: null, max: null },

    { name: '電話番号' , width: 200, prop: 'phone', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: this.msgPatternPhone, min: null, max: this.msgMaxLengthPhone },
    { name: '携帯番号' , width: 200, prop: 'cellphone', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: this.msgPatternPhone, min: null, max: this.msgMaxLengthPhone },
    { name: 'メールアドレス' , width: 400, prop: 'email', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: this.msgPatternEmail, min: null, max: this.msgMaxLengthEmail },
    { name: '会社名' , width: 400, prop: 'companyName', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: null, min: null, max: this.msgMaxLengthName },
    { name: '郵便番号' , width: 150, prop: 'zipCode', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: this.msgPatternZip, min: null, max: null },
    { name: '住所' , width: 500, prop: 'address', type: 'text', textalign: 'left', flozenleft: false, total: false,  required: false, pattern: null, min: null, max: this.msgMaxLengthText },
    { name: '', width: 'auto', prop: 'copy1', type: 'button', textalign: 'center', flozenleft: false, total: false,  required: false, pattern: null, min: null, max: null },
    { name: '', width: 'auto', prop: 'copy2', type: 'button', textalign: 'center', flozenleft: false, total: false,  required: false, pattern: null, min: null, max: null },
    { name: '', width: 'auto', prop: 'padding', type: 'label', textalign: 'center', flozenleft: false, total: false,  required: false, pattern: null, min: null, max: null }
  ];

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし'
  };
  //#endregion

  //#region ----- private 変数 --------------------------------------------------
  private _currentUser : User;
  private orgAssignList : RoomDetailsInfo[];
  private assignList : RoomDetailsInfo[];
  private rsvMembersInfo : RoomDetailsInfo;
  private currentUseDate : string;
  private useDateList : string[];
  private routeSeqList : number[];
  private stayDays : number;
  //#endregion

  //#region ----- public 変数 --------------------------------------------------
  public assignDataList;
  public assignForm : FormGroup;
  public reserveNo : string;
  public inputDate: Date;
  public minUseDate: Date;
  public maxUseDate: Date;
  public dispAssignList : RoomDetailsInfo[];
  public totalList : RoomDetailsInfo[];
  //#endregion

  constructor(private route: ActivatedRoute
              , private router: Router
              , private location: Location
              , private authService: AuthService
              , private roomService: RoomService
              , private snackBar: MatSnackBar
              , private formBuilder: FormBuilder
              , private header: HeaderService) {
    this._currentUser = this.authService.getLoginUser();
    this.reserveNo = this.route.snapshot.paramMap.get('reserveNo');
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {
    this.header.lockCompanySeleter();
    this.dispAssignList = null;
    this.totalList = null;
    this.assignForm = this.formBuilder.group({
      assignFormList: this.formBuilder.array([])
    });
    this.getAssignListByReserveNo();
  }

  /** DateTimePicker 日付変更 */
  public onChangeDate(event: Date) {
    this.inputDate = event;
    this.fillterByUseDate();
  }

  //#region ----- button --------------------------------------------------
  /** 保存 */
  public save(){

    // 更新
    this.update();
  }

  /** Validationチェックがエラーならボタンを無効にする
   * @returns boolean true: エラーあり, false:エラーなし
   */
  public CheckInvalid() : boolean{

    let result : boolean = false;

    this.assignFormGroupList.forEach(row => {
      if(row.invalid) {
        result = true;
        return; // ← continue (forEach)
      }
    });

    return result;
  }

  /** 1泊以下ならコピーボタンを非表示にする
   * @returns boolean true: 非表示, false: 非表示
   */
  public CheckStayDays() : boolean{

    if (this.stayDays <= 1) return false;

    return true;
  }

   /** 行の内容を翌日にコピー
    * @param  {} row 行の内容
    * @param  {} nextDayFlag true: 翌日, false: 翌日以降
    */
   public copyTo(row, nextDayFlag){

    let maxDate = moment(this.maxUseDate).format(SystemConst.DATE_FORMAT_YYYYMMDD);
    if(this.currentUseDate == maxDate) return;

    let nextDay = moment(this.currentUseDate).add(1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);

    let todayAssignInfo = this.assignList.find(x => x.useDate == this.currentUseDate && x.routeSEQ == row.routeSEQ);

    if(nextDayFlag){
      // 翌日
      this.assignList.filter(x => x.useDate == nextDay && x.routeSEQ == todayAssignInfo.routeSEQ).forEach(next => {
        next.guestName = todayAssignInfo.guestName;
        next.guestNameKana = todayAssignInfo.guestNameKana;
        next.memberMale = todayAssignInfo.memberMale;
        next.memberFemale = todayAssignInfo.memberFemale;
        next.memberChildA = todayAssignInfo.memberChildA;
        next.memberChildB = todayAssignInfo.memberChildB;
        next.memberChildC = todayAssignInfo.memberChildC;
        next.memberTotal = todayAssignInfo.memberTotal;

        next.zipCode = todayAssignInfo.zipCode;
        next.address = todayAssignInfo.address;
        next.phone = todayAssignInfo.phone;
        next.cellphone = todayAssignInfo.cellphone;
        next.email = todayAssignInfo.email;
        next.companyName = todayAssignInfo.companyName;
      });

    }else{
      // 翌日以降
      this.assignList.filter(x => x.useDate > this.currentUseDate && x.routeSEQ == todayAssignInfo.routeSEQ).forEach(after => {
        after.guestName = todayAssignInfo.guestName;
        after.guestNameKana = todayAssignInfo.guestNameKana;
        after.memberMale = todayAssignInfo.memberMale;
        after.memberFemale = todayAssignInfo.memberFemale;
        after.memberChildA = todayAssignInfo.memberChildA;
        after.memberChildB = todayAssignInfo.memberChildB;
        after.memberChildC = todayAssignInfo.memberChildC;
        after.memberTotal = todayAssignInfo.memberTotal;

        after.zipCode = todayAssignInfo.zipCode;
        after.address = todayAssignInfo.address;
        after.phone = todayAssignInfo.phone;
        after.cellphone = todayAssignInfo.cellphone;
        after.email = todayAssignInfo.email;
        after.companyName = todayAssignInfo.companyName;
      });
    }

    let copyTarget = nextDayFlag ? "翌日" : "翌日以降";
    this.showSnackBar(`No.${row.routeSEQ} の内容を${copyTarget} にコピーしました。`);
  }
  //#endregion

  //#region ----- 一覧 関連 --------------------------------------------------
  /** 編集した値で取得したアサインリストを上書き */
  public changeValue(event, rowIndex, colType, columnName) {

    let count = 0;
    let memberTotal = 0;
    this.assignList.filter(x => x.useDate == this.currentUseDate).forEach(x => {
      if(count == rowIndex){
        x[columnName] = (colType == 'text') ? event.target.value : Common.ToNumber(event.target.value);
        memberTotal = x.memberMale + x.memberFemale + x.memberChildA + x.memberChildB + x.memberChildC;
        x.memberTotal = memberTotal;
      }
      count++;
    });

    (this.assignFormList.controls[rowIndex] as FormGroup).controls['memberTotal'].setValue(memberTotal);
    this.calcTotal();
  }

  /** 割当人数合計 計算 */
  private calcTotal(){

    this.totalList = new Array<RoomDetailsInfo>();

    let todayAssignList = this.assignList.filter(x => x.useDate == this.currentUseDate);

    var info = new RoomDetailsInfo();
    info.guestName = "割当人数合計";
    info.memberMale = todayAssignList.reduce((p, x) => p + x.memberMale, 0);
    info.memberFemale = todayAssignList.reduce((p, x) => p + x.memberFemale, 0);
    info.memberChildA = todayAssignList.reduce((p, x) => p + x.memberChildA, 0);
    info.memberChildB = todayAssignList.reduce((p, x) => p + x.memberChildB, 0);
    info.memberChildC = todayAssignList.reduce((p, x) => p + x.memberChildC, 0);
    info.memberTotal = todayAssignList.reduce((p, x) => p + x.memberTotal, 0);

    this.totalList.push(info);
    this.totalList.push(this.rsvMembersInfo);
  }
  //#endregion

  //#region ----- データ取得 関連 --------------------------------------------------
  /** アサインデータ取得 */
  private getAssignListByReserveNo(){

    // 条件
    let cond = new RoomDetailsInfo();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;

    // アサイン + 予約基本 取得
    this.roomService.getAssignListByReserveNo(cond).subscribe((res: Reserve) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "アサイン情報" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.ROOMS_DETAILS + '001'); }

      // 予約人数合計
      let rsvInfo = res.stayInfo;
      this.rsvMembersInfo = new RoomDetailsInfo();
      this.rsvMembersInfo.guestName = "予約人数合計";
      this.rsvMembersInfo.memberMale = rsvInfo.memberMale;
      this.rsvMembersInfo.memberFemale = rsvInfo.memberFemale;
      this.rsvMembersInfo.memberChildA = rsvInfo.memberChildA;
      this.rsvMembersInfo.memberChildB = rsvInfo.memberChildB;
      this.rsvMembersInfo.memberChildC = rsvInfo.memberChildC;
      this.rsvMembersInfo.memberTotal = rsvInfo.memberMale
                                      +  rsvInfo.memberFemale
                                      + rsvInfo.memberChildA
                                      + rsvInfo.memberChildB
                                      + rsvInfo.memberChildC;
      this.stayDays = rsvInfo.stayDays;

      this.assignList = Common.DeepCopy(res.assignList);

      let wkMinUseDate = '99999999';
      let wkMaxUseDate = '00000000';
      this.useDateList = new Array<string>();
      this.routeSeqList = new Array<number>();

      this.assignList.forEach( x => {

        x.memberTotal = x.memberMale + x.memberFemale + x.memberChildA + x.memberChildB + x.memberChildC;

        x.guestName = x.nameFileInfo.guestName;
        x.guestNameKana = x.nameFileInfo.guestNameKana;
        x.zipCode = x.nameFileInfo.zipCode;
        x.address = x.nameFileInfo.address;
        x.phone = x.nameFileInfo.phone;
        x.cellphone = x.nameFileInfo.cellphone;
        x.email = x.nameFileInfo.email;
        x.companyName = x.nameFileInfo.companyName;

        let useDate = x.useDate;
        if(useDate < wkMinUseDate ) wkMinUseDate = useDate;
        if(useDate > wkMaxUseDate ) wkMaxUseDate = useDate;

        if(this.useDateList.indexOf(useDate) < 0) this.useDateList.push(useDate);
        if(this.routeSeqList.indexOf(x.routeSEQ) < 0) this.routeSeqList.push(x.routeSEQ);

      });
      this.orgAssignList = Common.DeepCopy(this.assignList);

      this.minUseDate = moment(wkMinUseDate).toDate();
      this.maxUseDate = moment(wkMaxUseDate).toDate();
      this.inputDate = this.minUseDate;
      this.fillterByUseDate();
    });
  }

  get assignFormList(): FormArray {
    return this.assignForm.get(this.assignFormListName) as FormArray;
  }

  get assignFormGroupList(): FormGroup[] {
    return this.assignFormList.controls as FormGroup[];
  }

  get currentNight() : string {

    let dispNights = "";

    if (this.stayDays <= 1 ){
      dispNights = `${this.stayDays} 泊`;
    }else if (!Common.IsNullOrEmpty(this.useDateList)){
      let currentNight = this.useDateList.indexOf(this.currentUseDate) + 1;
      dispNights = `${currentNight} / ${this.stayDays} 泊目`
    }

    return dispNights;
  }

  private createAssignForm(routeSEQ:number, roomNo:string, roomtypeName:string, guestName:string, guestNameKana: string
                          , memberMale:number, memberFemale:number, memberChildA:number, memberChildB:number, memberChildC: number, memberTotal: number
                          , zipCode:string, address:string, phone: string, cellphone: string, companyName: string, email: string ) : FormGroup{
    return this.formBuilder.group({
      routeSEQ : new FormControl(routeSEQ)
      , roomNo : new FormControl(roomNo)
      , roomtypeName : new FormControl(roomtypeName)
      , guestName : new FormControl(guestName, [Validators.required, Validators.maxLength(this.maxLengthName)])
      , guestNameKana: new FormControl(guestNameKana,[Validators.required, Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLengthName)])

      , memberMale: new FormControl(memberMale, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberFemale: new FormControl(memberFemale, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildA: new FormControl(memberChildA, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildB: new FormControl(memberChildB, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildC: new FormControl(memberChildC, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberTotal : new FormControl(memberTotal)
      , phone: new FormControl(phone,[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)])
      , cellphone: new FormControl(cellphone,[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)])
      , companyName: new FormControl(companyName,[Validators.maxLength(this.maxLengthName)])
      , zipCode: new FormControl(zipCode,[Validators.pattern(this.zipFormatPattern)])
      , address: new FormControl(address,[Validators.maxLength(this.maxLengthText)])

      , email: new FormControl(email,[Validators.pattern(this.emailFormatPattern), Validators.maxLength(this.maxLengthEmail)])
      , copy1 : new FormControl('')
      , copy2 : new FormControl('')
      , padding : new FormControl('')
    });
  }

  /** アサインリストから利用日のデータのみ抽出 */
  public fillterByUseDate(){

    this.currentUseDate = moment(this.inputDate).format(SystemConst.DATE_FORMAT_YYYYMMDD);

    let todayList = this.assignList.filter(x => x.useDate == this.currentUseDate).map(y => y);
    let wkFormGrList = todayList.map((data) => {
      return this.createAssignForm(data.routeSEQ, data.roomNo, data.roomtypeName, data.guestName, data.guestNameKana
              , data.memberMale, data.memberFemale, data.memberChildA, data.memberChildB, data.memberChildC, data.memberTotal
              , data.zipCode, data.address, data.phone, data.cellphone, data.companyName, data.email
            )
    });

    // FormGroup の配列を取り込んで FormArray を作る
    let wkFormArray = this.formBuilder.array(wkFormGrList);

    // 元々のフォームに適用する
    this.assignForm.setControl(this.assignFormListName, wkFormArray);

    this.calcTotal();
  }
  //#endregion

  //#region ----- データ更新 関連 --------------------------------------------------
  /** データ更新 */
  private async update(){

    // 更新用リスト取得
    let updateList = this.setUpdateValue();
    if(updateList.assignList.length == 0 && updateList.nameFileList.length == 0){
      Common.modalMessageNotice(Message.TITLE_NOTICE, Message.NODATA_TO_UPDATE, MessagePrefix.NOTICE + FunctionId.ROOMS_DETAILS + '001');
      this.reload();
      return;
    }

    // 予約人数差異チェック
    let result = await this.checkMembers();
    if (!result) return;

    // アサイン情報リスト更新
    this.roomService.UpdateRoomDetails(updateList).subscribe((result: number) => {

      switch(result){
        case DBUpdateResult.Success:
          // 更新成功
          this.showSnackBar(`部屋割詳細情報${Message.UPDATE_SUCCESS_NOTICE}`);
          this.goBack();
          break;

        case DBUpdateResult.VersionError:
          // バージョンError
          Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMS_DETAILS + '001');
          break;

        default:
          // Error
          Common.modalMessageError(Message.TITLE_ERROR, '部屋割詳細情報' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMS_DETAILS + '002');
          break;
      }

      // 再読込
      this.reload();
    },
    error => {
      // Error
      Common.modalMessageError(Message.TITLE_API_ERROR, '部屋割詳細情報' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMS_DETAILS + '003');
    });
  }


  /** 更新対象のデータをリストにセット
   * @returns Array 更新対象のデータリスト
   */
  private setUpdateValue() : UpdateRoomDetails {

    let updateInfo = new UpdateRoomDetails();
    updateInfo.assignList = new Array<RoomDetailsInfo>();
    updateInfo.nameFileList = new Array<GuestInfo>();

    for (let i = 0; i < this.assignList.length; i++){

      let org = this.orgAssignList[i];
      let upd = this.assignList[i];

      // 編集データを比較(アサイン)
      if(org.guestName != upd.guestName || org.memberMale != upd.memberMale || org.memberFemale != upd.memberFemale
         || org.memberChildA != upd.memberChildA || org.memberChildB != upd.memberChildB || org.memberChildC != upd.memberChildC){

          upd.updator = this._currentUser.userName;
          updateInfo.assignList.push(upd);
      }

      // 編集データを比較(氏名ファイル)
      if(org.guestName != upd.guestName || org.guestNameKana != upd.guestNameKana
        || org.phone != upd.phone || org.cellphone != upd.cellphone
        || org.email != upd.email || org.companyName != upd.companyName
        || org.zipCode != upd.zipCode || org.address != upd.address){

        let wkNameFileInfo = new GuestInfo();
        if(org.nameFileInfo.useDate != SystemConst.USE_DATE_EMPTY){
          wkNameFileInfo.companyNo = org.nameFileInfo.companyNo;
          wkNameFileInfo.status = org.nameFileInfo.status;
          wkNameFileInfo.version = org.nameFileInfo.version;
          wkNameFileInfo.creator = org.nameFileInfo.creator;
          wkNameFileInfo.cdt = org.nameFileInfo.cdt;

          wkNameFileInfo.reserveNo = org.nameFileInfo.reserveNo;
          wkNameFileInfo.nameSeq = org.nameFileInfo.nameSeq;
          wkNameFileInfo.useDate = org.nameFileInfo.useDate;
          wkNameFileInfo.routeSEQ = org.nameFileInfo.routeSEQ;
          wkNameFileInfo.customerNo = org.nameFileInfo.customerNo;

        }else{
          wkNameFileInfo.companyNo = upd.companyNo;
          wkNameFileInfo.status = SystemConst.STATUS_USED;
          wkNameFileInfo.version = 0;
          wkNameFileInfo.creator = upd.updator;
          wkNameFileInfo.cdt = null;

          wkNameFileInfo.reserveNo = upd.reserveNo;
          wkNameFileInfo.nameSeq = SystemConst.DEFAULT_NAME_SEQ;
          wkNameFileInfo.useDate = upd.useDate;
          wkNameFileInfo.routeSEQ = upd.routeSEQ;
        }
        wkNameFileInfo.updator = upd.updator;

        wkNameFileInfo.guestName = upd.guestName;
        wkNameFileInfo.guestNameKana = upd.guestNameKana;
        wkNameFileInfo.zipCode = upd.zipCode;
        wkNameFileInfo.address = upd.address;
        wkNameFileInfo.phone = upd.phone;
        wkNameFileInfo.cellphone = upd.cellphone;
        wkNameFileInfo.email = upd.email;
        wkNameFileInfo.companyName = upd.companyName;

        updateInfo.nameFileList.push(wkNameFileInfo);
      }
    }

    return updateInfo;
  }


  /** 割当人数合計と予約人数合計を比較 */
  private async checkMembers(): Promise<boolean> {

    let diffFlag = false;

    this.useDateList.forEach(useDate => {

      let todayAssignList = this.assignList.filter(x => x.useDate == useDate);

      let wkInfo = new RoomDetailsInfo();
      wkInfo.memberMale = todayAssignList.reduce((p, x) => p + x.memberMale, 0);
      wkInfo.memberFemale = todayAssignList.reduce((p, x) => p + x.memberFemale, 0);
      wkInfo.memberChildA = todayAssignList.reduce((p, x) => p + x.memberChildA, 0);
      wkInfo.memberChildB = todayAssignList.reduce((p, x) => p + x.memberChildB, 0);
      wkInfo.memberChildC = todayAssignList.reduce((p, x) => p + x.memberChildC, 0);
      wkInfo.memberTotal = todayAssignList.reduce((p, x) => p + x.memberTotal, 0);

      if(wkInfo.memberMale != this.rsvMembersInfo.memberMale
        || wkInfo.memberFemale != this.rsvMembersInfo.memberFemale
        || wkInfo.memberChildA != this.rsvMembersInfo.memberChildA
        || wkInfo.memberChildB != this.rsvMembersInfo.memberChildB
        || wkInfo.memberChildC != this.rsvMembersInfo.memberChildC){

        diffFlag = true;
      }
    });

    if(diffFlag){
      return await Common.modalMessageConfirm(Message.TITLE_CONFIRM, '割当人数合計が予約人数合計と異なる日があります。<br>よろしいですか？', null, MessagePrefix.CONFIRM + FunctionId.ROOMS_DETAILS + '001');
    }

    return true;
  }
  //#endregion

  /** 遷移元画面にもどる */
  public goBack(): void {
		this.location.back();
	}

  /** 再読込 */
  private reload(){
    this.router.navigateByUrl(`${this.myURL}`, {skipLocationChange: true}).then(() => {
      this.router.navigate([this.myURL, this.reserveNo])
    });
  }

  /** Success系メッセージはSnackBarで出す (予約取消以外) */
  private showSnackBar(msg: string) {
    this.snackBar.open(msg, '×', {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 3 * 1000, /* 3sec表示 */
    });
  }
}
