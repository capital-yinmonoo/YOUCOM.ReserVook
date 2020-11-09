import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ReserveService } from '../services/reserve.service';
import { User } from '../../../core/auth/auth.model';
import { Base } from '../../../shared/model/baseinfo.model';
import { Reserve, SalesDetailsInfo, AssignInfo,
        StayInfo, RoomTypeInfo, DepositInfo, RemarksInfo, AdjustmentUpdateInfo, ResultInfo, GuestInfo } from '../model/reserve.model';
import { CodeNameInfo } from '../../master/codename/model/codename.model';
import { AgentInfo } from '../../master/agent/model/agentinfo.model';
import { DenominationInfo } from '../../master/denomination/model/denominationinfo.model';
import { SystemConst, Message, DBUpdateResult, MessagePrefix, FunctionId } from '../../../core/system.const';
import { Common } from '../../../core/common';
import { ReserveCommon } from './reserve.common';
import { SalesDetailsComponent } from './salesdetails-form/salesdetails.component';
import moment, { Moment } from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS,} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GuestSearchComponent } from '../../dialog/guestsearch/guestsearch.component';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { CustomerInfo } from '../../master/customer/model/customerinfo.model';
import { CustomerService } from '../../master/customer/services/customer.service';
import { HeaderService } from 'src/app/core/layout/header/header.service';
import { ReserveLogComponent } from '../../dialog/reservelog/reservelog.component';

enum InfoType {
  Stay,
  Guest,
  Agent,
  RoomType,
  Deposit,
  Remarks
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'YYYY年MM',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-parent',
  templateUrl: './reserve.component.html',
  styleUrls: ['../../../shared/shared.style.scss','./reserve.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

export class ReserveComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  private _currentUser : User;

//#region readonly
  public readonly myURL = '/company/reserve';
  public readonly roomsURL = '/company/rooms';
  public readonly webReservesURL = '../../../company/webreserves/';
  private readonly billURL = '../../../company/bill/';
  private readonly facilityURL = '../../../company/facility/assign/';
  private readonly roomsDetailsURL = '/company/rooms/details';


  // エスケープ「\\」は2つ
  public readonly numberFormatPattern = '^[-]?[0-9]*$';
  public readonly phoneFormatPattern = '^[0-9-+ ]*$';
  public readonly kanaFormatPattern = '^[0-9０-９a-zA-Zァ-ンヴー 　]*$';
  public readonly zipFormatPattern = '(\\d{3})[-]?(\\d{4})';
  public readonly emailFormatPattern = '^([a-zA-Z0-9_\\-\\.\\@])*$';

  public readonly returnCode = '<br>';

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  // Header
  public readonly roomTypeInfoHeader: string[]
   = ['addRoomTypeInfo', 'roomType', 'roomCount', 'assignCount', 'roomtypeSeq'];

  public readonly stayItemInfoHeader: string[]
   = ['addStayItemInfo', 'stayItemName', 'printName', 'unitPrice'
   , 'itemNumberM', 'itemNumberF', 'itemNumberC', 'amountPrice'
   //, 'dinner', 'breakfast', 'lunch'
   , 'taxServiceDivision', 'taxRate', 'billSeparateSeq'
   , 'detailsSeq'];

  public readonly otherItemInfoHeader: string[]
   = ['addOtherItemInfo', 'otherItemName', 'printName', 'unitPrice', 'qty', 'amountPrice'
   , 'taxServiceDivision', 'taxRate', 'billSeparateSeq', 'id'];

  public readonly depositInfoHeader: string[]
   = [ 'addDepositInfo', 'depositDate', 'denominationCode', 'printName', 'price', 'billingRemarks', 'billSeparateSeq', 'balanceButton', 'detailsSeq'];

  public readonly remarksInfoHeader: string[]
   = [ 'addInfo', 'remarks', 'noteSeq'  ];

  public readonly minZero = 0;
  public readonly maxNight = 100;
  public readonly maxMember = 999;
  public readonly maxMemberTotal = 9999;
  public readonly maxAmount = 99999999;
  public readonly minAmount = this.maxAmount * (-1);
  public readonly maxBillNo = 9;
  public readonly minBillNo = 1;
  public readonly maxLengthPhone = 20;
  public readonly maxLengthName = 50;
  public readonly maxLengthPrintName = 40;
  public readonly maxLengthEmail = 60;
  public readonly maxLengthText = 100;
  public readonly maxLengthCustomerNo = 10;
  public readonly maxRoomCount = 99;
  public readonly minRoomCount = 1;

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 日付形式(yyyy/MM/dd)で入力してください。 */
  public readonly msgPatternDate = Message.PATTERN_DATE;
  /** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  /** 半角数字とハイフン(-)で入力してください。 */
  public readonly msgPatternPhone = Message.PATTERN_PHONE;
  /** 半角英数で入力してください。 */
  public readonly msgPatternEmail = Message.PATTERN_EMAIL;
  /** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  /** 形式(999-9999)で入力してください。 */
  public readonly msgPatternZip = Message.PATTERN_ZIP

  /** 0以上の値で入力してください。 */
  public readonly msgMin0 = this.minZero.toString() + Message.MIN_DIGITS;
  /** 100以下の値で入力してください。 */
  public readonly msgMaxNight = this.maxNight.toString() + Message.MAX_DIGITS;
  /** 999以下の値で入力してください。 */
  public readonly msgMax999 = this.maxMember.toString() + Message.MAX_DIGITS;
  /** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.maxMemberTotal.toString() + Message.MAX_DIGITS;
  /** -99999999以上の値で入力してください。 */
  public readonly msgMinAmount = this.minAmount.toLocaleString() + Message.MIN_DIGITS;
  /** 99999999以下の値で入力してください。 */
  public readonly msgMaxAmount = this.maxAmount.toLocaleString() + Message.MAX_DIGITS;
  /** 1以上の値で入力してください。 */
  public readonly msgMinBillNo = this.minBillNo.toString() + Message.MIN_DIGITS;
  /** 10以下の値で入力してください。 */
  public readonly msgMaxBillNo = this.maxBillNo.toString() + Message.MAX_DIGITS;
  /** 0以上の値で入力してください。 */
  public readonly msgMinRoomCount = this.minRoomCount.toString() + Message.MIN_DIGITS;
  /** アサイン済以上の値で入力してください。 */
  public readonly msgMinAssignCount = "アサイン済" + Message.MIN_DIGITS;
  /** 100以下の値で入力してください。 */
  public readonly msgMaxRoomCount = this.maxRoomCount.toString() + Message.MAX_DIGITS;
  /** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPhone = this.maxLengthPhone.toString() + Message.MAX_LENGTH;
  /** 40文字以下で入力してください。 */
  public readonly msgMaxLengthPrintName = this.maxLengthPrintName.toString() + Message.MAX_LENGTH;
  /** 50文字以下で入力してください。 */
  public readonly msgMaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
  /** 60文字以下で入力してください。 */
  public readonly msgMaxLengthEmail = this.maxLengthEmail.toString() + Message.MAX_LENGTH;
  /** 100文字以下で入力してください。 */
  public readonly msgMaxLengthText = this.maxLengthText.toString() + Message.MAX_LENGTH;
  /** 10文字で入力してください。 */
  public readonly msgLengthCustomerNo = this.maxLengthCustomerNo.toString() + Message.LENGTH;
  /** 精算済みです。 */
  public readonly msgAdjustmented = Message.ADJUSTMENTED_ERROR;
  /** 以前を指定してください。 */
  public readonly msgFromToError = "以降を指定してください。";

  /** ラベル 区切り文字 */
  public readonly PrefixDelimiter = ":";

  /** 到着日 */
  public readonly lblArrivalDate = "到着日";
  /** 泊数 */
  public readonly msgStayDays = "泊数";
  /** 出発日 */
  public readonly lblDepartureDate = "出発日";
  /** 予約日 */
  public readonly lblReserveDate = "予約日";

  /** 大人男 */
  public readonly lblMale = "大人男";
  /** 大人女 */
  public readonly lblFemale = "大人女";
  /** 子供A */
  public readonly lblChildA = "子供A";
  /** 子供B */
  public readonly lblChildB = "子供B";
  /** 子供C */
  public readonly lblChildC = "子供C";
  /** は */
  public readonly msgIs = "は";

  /** n行目 */
  public readonly msgLine = "行目";


  /** 部屋タイプ */
  public readonly lblRoomType = "部屋タイプ";
  /** 室数 */
  public readonly lblRoomCount = "室数";

  /** 備考 */
  public readonly lblRemarks = "備考";


  /** 入金日 */
  public readonly lblDepositDate = "入金日";
  /** 金種 */
  public readonly lblDenomination = "金種";
  /** 印字用名称 */
  public readonly lblPrintName = "印字用名称";
  /** 金額 */
  public readonly lblPrice = "金額";
  /** 請求備考 */
  public readonly lblBillingRemarks = "請求備考";
  /** ビル分割番号 */
  public readonly lblBillNo = "ビル分割番号";

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  public readonly facilityColumns = [
    { name: '利用日', prop: 'useDate', width: 150, textalign: 'left'},
    { name: '利用時間', prop: 'useTime', width: 150, textalign: 'left'},
    { name: '会場名', prop: 'facilityName', width: 300, textalign: 'left'},
    { name: '人数', prop: 'facilityMember', width: 80, textalign: 'right'},
    { name: '備考', prop: 'facilityRemarks', width: 350, textalign: 'left'},
  ];

//#endregion

  private reserveInfo : Reserve;
  private maxItemDetailSeq : number = 0;
  private maxRoomRouteSeq : number = 0;
  private maxRoomTypeSeq : number = 0;
  private maxDepositSeq : number = 0;
  private maxRemarksSeq : number = 0;
  public maxSetItemSeq : number = 0;

  @ViewChild(SalesDetailsComponent,{static: false}) salesDetailsForm :SalesDetailsComponent;
  itemList = [];

  // 画面項目追加用SEQ
  private roomtypeSeq :number = 1;
  private depositSEQ :number = 1;
  private remarksSEQ :number = 1;

  // 初期化
  stayInfoForm = this.setInitFormInfo(InfoType.Stay);
  guestInfoForm = this.setInitFormInfo(InfoType.Guest);
  agentInfoForm = this.setInitFormInfo(InfoType.Agent)
  roomTypeInfoForm =  this.setInitFormInfo(InfoType.RoomType);
  depositInfoForm = this.setInitFormInfo(InfoType.Deposit);
  remarksInfoForm = this.setInitFormInfo(InfoType.Remarks);

  // パラメータ
  reserveNo: string;
  roomNo: string;
  roomType: string;
  arrivalDate: string;
  departureDate: string;

  StayDays :number = 1;
  reserveAdjustmentFlag: string;
  adjustmentedBillNoCheckList: Array<number>;  // 精算済みビルNoリスト
  cancelFlag: boolean = false;  // false:予約 true:キャンセル
  xTravelAgncBkngNum : string;  // Web予約番号
  scCd : string;  // Web予約サイトコード
  xTravelAgncBkngSeq : number;  // Web予約SEQ
  assignCheckList: Array<AssignInfo> = [];

  disabledFlag : boolean = false;  // キャンセル済/ C/O済の場合、編集不可。
  RoomtypeInvalied : boolean = false; // 2泊目以降の部屋タイプのValicdationチェック用

  roomTypeListAll = [];   // 2020.07.20 Add 全滞在期間の部屋情報をセット(roomTypeListは表示されている利用日付のデータのみ)
  roomTypeList = [];
  depositList = [];
  remarksList = [];
  roomTypeSource = new MatTableDataSource<any>();
  depositSource = new MatTableDataSource<any>();
  remarksSource = new MatTableDataSource<any>();
  public M_RoomTypeList: CodeNameInfo[];
  public M_AgentList: AgentInfo[];
  public M_DenominationList: DenominationInfo[];

  // 商品情報 合計部分表示用変数
  public salesTotal = 0;
  public depositTotal = 0;
  public balance = 0;
  public salesTotalsByBill : Array<number>;

  // setTimeout解放用
  private timeOut: any;

  // 会場予約表示用
  public rsvFacilityList : any[];

  constructor(private route: ActivatedRoute
            , private router: Router
            , private reserveService: ReserveService
            , private authService:AuthService
            , private cd : ChangeDetectorRef
            , private fb: FormBuilder
            , private snackBar: MatSnackBar
            , public dialog: MatDialog
            , private customerService: CustomerService
            , private header: HeaderService) {

    this.reserveNo = this.route.snapshot.paramMap.get('reserveNo');

    this._currentUser = this.authService.getLoginUser();

    // 連泊状況
    this.route.queryParams.subscribe(params => {
      this.roomNo = params['roomNo'];
      this.roomType = params['roomType'];
      this.arrivalDate = params['arrivalDate'];
      this.departureDate = params['departureDate'];
    });

  }

  ngOnInit(): void {

    // マスタ取得
    this.getInitMasterInfo();

    //　初期化
    this.maxItemDetailSeq = 0;
    this.maxDepositSeq = 0;
    this.maxRemarksSeq = 0;
    this.itemList = [];

    // 予約番号があればデータ取得
    if (!Common.IsNullOrEmpty(this.reserveNo)) {
      this.getReserveInfo();
      this.header.lockCompanySeleter();
      return;
    }

    // 予約データ初期化
    this.initReserveInfo();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
    this.salesDetailsForm = null;
    ReserveCommon.destroyMasterList();
    clearTimeout(this.timeOut);
  }

  /** 再読込 */
  private Reload(){
    this.router.navigateByUrl(this.myURL, {skipLocationChange: true}).then(() => {
      this.router.navigate([this.myURL, this.reserveNo])
    });
  }

//#region ----- View 関連 --------------------------------------------------
  /** Viewの初期化処理時 */
  ngAfterViewInit(){
    this.setStayDays();

    // 値 取得
    this.getView_ItemList();
  }

  /** Viewの値が変わったあと */
  ngAfterViewChecked(){

    // setTimeout()を解放
    clearTimeout(this.timeOut);

    // 値 取得
    this.getView_ItemList();

    if(this.salesDetailsForm == null || this.salesDetailsForm.salesTotal == null){
      this.salesTotal = 0;
      this.salesTotalsByBill = new Array<number>(0);
      this.salesTotalsByBill[0] = 0;
    }else{
      this.salesTotal = this.salesDetailsForm.salesTotal;
      this.salesTotalsByBill = this.salesDetailsForm.salesTotalsByBill;

    // HACK
    }
    this.calcBalance();
  }

  /** View から売上明細取得 */
  private getView_ItemList(){
    // setTimeoutのfunction内ではthisのスコープが変わるので引数で渡す
    this.timeOut = setTimeout(function(item_this){
      item_this.ngAfterViewChecked();
      if(item_this.salesDetailsForm != null){
        item_this.itemList = item_this.salesDetailsForm.itemList;
      }
    }, 100, this);
  }

  /** View に値を渡す */
  private setView_All(arrivalDate : Moment, itemList){
    this.setView_ArrivalDate(arrivalDate);
    this.salesDetailsForm.SalesDetails = itemList;
  }

  /** View に到着日を渡す */
  private setView_ArrivalDate(arrivalDate : Moment){
    this.salesDetailsForm.ArrivalDate = arrivalDate;
  }
//#endregion ----- View 関連 --------------------------------------------------

//#region ----- public --------------------------------------------------

  //#region ---- 宿泊情報 --------------------------------------------------
  /** 到着日変更 */
  public changeArrivalDate(){

    // 入力値取得
    var arrivalDate = this.stayInfoForm.controls.arrivalDate.value;
    var departureDate = this.stayInfoForm.controls.departureDate.value;
    var stay = this.stayInfoForm.controls.stayDays.value;

    // 到着日が空なら何もしない
    if (Common.IsNullOrEmpty(arrivalDate)) return;

    // View に到着日を渡す
    this.setView_ArrivalDate(this.stayInfoForm.controls.arrivalDate.value);

    if (Common.IsNullOrEmpty(stay) && Common.IsNullOrEmpty(departureDate)){
      // 両方空なら何もしない
      return;
    }else if (Common.IsNullOrEmpty(stay)){
      // 到着日が空なら泊数を補完
      this.calcStayDays();
    }else{
      //出発日が空なら出発日を補完
      this.calcDepartureDate();
    }

    //部屋タイプ情報を変更
    this.changeRoomTypefromArrivalDate();

    this.roomTypeInfoForm.patchValue({
      useDate : Common.ToFormatDate(Common.ToFormatStringDate(arrivalDate))
    });
  }

  /** 泊数変更 */
  public changeStayDays(){

    // 商品情報の泊数変更
    this.setStayDays();

    // 入力値取得
    var arrivalDate = this.stayInfoForm.controls.arrivalDate.value;
    var departureDate = this.stayInfoForm.controls.departureDate.value;
    var stay = this.stayInfoForm.controls.stayDays.value;

    // 泊数が空なら何もしない
    if (Common.IsNullOrEmpty(stay)) return;

    if (Common.IsNullOrEmpty(arrivalDate) && Common.IsNullOrEmpty(departureDate)){
      // 両方空なら何もしない
      return;
    }else if (Common.IsNullOrEmpty(arrivalDate)){
      // 到着日が空なら到着日を補完
      this.calcArrivalDate();
    }else{
      //出発日が空なら出発日を補完
      this.calcDepartureDate();
    }

    //部屋タイプ情報を変更
    this.changeRoomTypefromDepartureDate();
  }

  /** 出発日変更 */
  public changeDepartureDate(){

    // 入力値取得
    var strArrivalDate = this.stayInfoForm.controls.arrivalDate.value;
    var strDepartureDate = this.stayInfoForm.controls.departureDate.value;
    var stay = this.stayInfoForm.controls.stayDays.value;

    // 出発日が空なら何もしない
    if (Common.IsNullOrEmpty(strDepartureDate)) return;

    if (Common.IsNullOrEmpty(strArrivalDate) && Common.IsNullOrEmpty(stay)){
      // 両方空なら何もしない
      return;
    }else if (Common.IsNullOrEmpty(strArrivalDate)){
      // 到着日が空なら到着日を補完
      this.calcArrivalDate();
    }else{
      // 泊数が空なら出発日を補完
      this.calcStayDays();
    }

    //部屋タイプ情報を変更
    this.changeRoomTypefromDepartureDate();
  }

  /** 宿泊人数計算 */
  public calcPersonCount(){

    // 値を取得
    var male =Common.ToNumber(this.stayInfoForm.controls.memberMale.value);
    var female = Common.ToNumber(this.stayInfoForm.controls.memberFemale.value);
    var childA =Common.ToNumber(this.stayInfoForm.controls.memberChildA.value);
    var childB =Common.ToNumber(this.stayInfoForm.controls.memberChildB.value);
    var childC =Common.ToNumber(this.stayInfoForm.controls.memberChildC.value);

    // 値をセット
    var memberTotal = male + female + childA + childB + childC;
    this.stayInfoForm.patchValue({
      memberMale:male,
      memberFemale:female,
      memberChildA:childA,
      memberChildB:childB,
      memberChildC:childC,
      memberTotal:memberTotal
    });
  }
  //#endregion ---- 宿泊情報 --------------------------------------------------

  //#region ---- エージェント --------------------------------------------------
  /** エージェント選択
   * @param  {string} agentCode エージェントコード
   */
  public selectAgent(agentCode : string) {


    var remarks : string = '';
    if (!Common.IsNullOrEmpty(agentCode)){
      var info = this.M_AgentList
      .find((a) => a.agentCode == agentCode);

      if (info.agentCode == agentCode) {
        remarks = info.remarks;
      }
    }

    this.agentInfoForm.patchValue({
      agentRemarks: remarks
    });
  }
  //#endregion ---- エージェント --------------------------------------------------

  //#region ---- 希望部屋タイプ --------------------------------------------------

  /** Validationのため情報が変わるたびに保存する */
  public changeRoomTypeInfo(element = null){
    let useDate  = Common.ToFormatDate(Common.ToFormatStringDate(this.roomTypeInfoForm.controls.useDate.value));

    // 画面の状態を保存する
    this. saveRoomTypeInfo(useDate);

    if(element != null){
      // 変更イベントが発生した時のみ、指定日以降の部屋タイプを補完する処理を行う
      let roomTypeCode : string = element.value.roomType;
      let selectedIdx : number = element.value.index;

      // 部屋タイプコードをセット
      this.roomTypeListAll.forEach((roomType) => {
        if (roomType.controls.useDate.value > useDate && roomType.controls.index.value == selectedIdx) {
          var tmpRoomType = roomType.controls.roomType.value;

          if(roomType.controls.roomType.value === null || roomType.controls.roomType.value === ""){
            roomType.controls.roomType.value = roomTypeCode;
            roomType.status = "VALID";
          }else{
            roomType.controls.roomType.value = tmpRoomType;
          }
        }
      });

      let roomtypeInvalied : boolean = false;
      this.roomTypeListAll.forEach(roomTypeList => {
        if(roomTypeList.invalid == true) {
          roomtypeInvalied = true;
          return; // ← continue (forEach)
        }
      });
      this.RoomtypeInvalied = roomtypeInvalied;
    }
  }
  //#endregion ---- 希望部屋タイプ --------------------------------------------------

  //#region ---- 入金情報 --------------------------------------------------
  /** 金種選択
   * @param  {} obj
   */
  public selectDenomination(obj) {
    var dCode = obj.controls.denominationCode.value;
    var info = this.M_DenominationList
                .find((d) => d.denominationCode == dCode);

    if (info.denominationCode == dCode) {
      obj.patchValue({
        printName: info.printName,
      });
    }
  }

  /** 入金情報 合計表示 */
  public calcDepositTotal() {
    this.depositTotal = 0;
    this.depositSource.data.forEach((deposit) => {
      var amount = Common.ToNumber(deposit.controls.price.value);
      this.depositTotal = this.depositTotal + amount;
    });

    // 残高計算
    this.calcBalance();
  }

  /** 未精算のビルNoをセット
   * @param  {any} billSeparateSeq ビル分割番号
   * @returns boolean true: 未精算、 false: 精算
   * @remarks changeイベント側からはnumber/精算チェック側からはstringで受けるためany型
   */
  public SetBillSeq(): string {
    return ReserveCommon.SetMinBillSeq(this.minBillNo , this.maxBillNo);
  }
  //#endregion ---- 入金情報 --------------------------------------------------

  /** 未精算かどうかチェック
   * @param  {any} billSeparateSeq ビル分割番号
   * @param  {boolean} messageFlag true:メッセージを出力
   * @returns boolean true: 未精算、 false: 精算
   * @remarks changeイベント側からはnumber/精算チェック側からはstringで受けるためany型
   */
  public CheckBillSeq(billSeparateSeq : any): boolean{
    return ReserveCommon.CheckNotAdjustmented(billSeparateSeq, false);
  }

//#endregion ---- public --------------------------------------------------

//#region ----- private --------------------------------------------------

  //#region ---- 宿泊情報 --------------------------------------------------

  /** 到着日、泊数から出発日を計算 */
  private calcArrivalDate(){

    // 入力値取得
    var strDepartureDate = this.stayInfoForm.controls.departureDate.value;
    var stay = this.stayInfoForm.controls.stayDays.value;

    // どちらか空なら何もしない
    if (Common.IsNullOrEmpty(strDepartureDate) || Common.IsNullOrEmpty(stay)) return;

    // 出発日計算
    stay = Common.ToNumber(stay) * -1;
    var dDate = moment(strDepartureDate).add(stay, 'days');

    // 出発日をセット
    this.stayInfoForm.patchValue({arrivalDate: dDate});

    // View に到着日を渡す
    this.setView_ArrivalDate(dDate);
  }

  /** 到着日、泊数から出発日を計算 */
  private calcDepartureDate(){

    // 入力値取得
    var strArrivalDate = this.stayInfoForm.controls.arrivalDate.value;
    var stay = this.stayInfoForm.controls.stayDays.value;

    // どちらか空なら何もしない
    if (Common.IsNullOrEmpty(strArrivalDate) || Common.IsNullOrEmpty(stay)) return;

    // 出発日計算
    stay = Common.ToNumber(stay);
    var dDate = moment(strArrivalDate).add(stay, 'days');

    // 出発日をセット
    this.stayInfoForm.patchValue({departureDate: dDate});
  }

  /** 到着日、出発日から泊数を計算 */
  private calcStayDays(){

    // 入力値取得
    var strArrivalDate = this.stayInfoForm.controls.arrivalDate.value;
    var strDepartureDate = this.stayInfoForm.controls.departureDate.value;

    // どちらか空なら何もしない
    if (Common.IsNullOrEmpty(strArrivalDate) || Common.IsNullOrEmpty(strDepartureDate)) return;

    // 差分計算
    var fromDate = moment(strArrivalDate);
    var toDate = moment(strDepartureDate);
    var daysDiff = toDate.diff(fromDate, 'days')

    // 差分をセット
    this.stayInfoForm.patchValue({stayDays: daysDiff});

    // 商品情報の泊数変更
    this.setStayDays();
  }

  /** 商品情報の泊数変更 */
  private setStayDays() {

    if (this.stayInfoForm.controls['stayDays'].invalid) return;

    this.StayDays = Common.ToNumber(this.stayInfoForm.controls.stayDays.value);

    var wkStayDays : Array<number> = [];
    // var idx = this.StayDays == 0 ? 1 : this.StayDays;
    if( this.StayDays == 0){
      wkStayDays.push(0);
    }
    for (var i = 1; i <= this.StayDays; i++) {
      wkStayDays.push(i);
    }
    this.salesDetailsForm.StayDays = wkStayDays;
  }
  //#endregion ---- 宿泊情報 --------------------------------------------------

  /** 到着日、泊数から出発日を計算 */
  private setCustomerInfo() : CustomerInfo {
    let cInfo : CustomerInfo = new CustomerInfo();

    cInfo.companyNo = this._currentUser.displayCompanyNo;
    cInfo.customerName = this.guestInfoForm.controls['guestName'].value;
    cInfo.customerKana = this.guestInfoForm.controls['guestNameKana'].value;
    cInfo.zipCode = this.guestInfoForm.controls['zipCode'].value;
    cInfo.address = this.guestInfoForm.controls['address'].value;
    cInfo.phoneNo = this.guestInfoForm.controls['phone'].value;
    cInfo.mobilePhoneNo = this.guestInfoForm.controls['cellphone'].value;
    cInfo.email = this.guestInfoForm.controls['email'].value;
    cInfo.companyName = this.guestInfoForm.controls['companyName'].value;
    cInfo.remarks1 = "";
    cInfo.remarks2 = "";
    cInfo.remarks3 = "";
    cInfo.remarks4 = "";
    cInfo.remarks5 = "";
    cInfo.creator = this._currentUser.userName;
    cInfo.updator = this._currentUser.userName;

    let remarksList : string[] = [];
    this.remarksSource.data.forEach(x => {
      remarksList.push(x.controls.remarks.value);
    });

    if(remarksList.length >= 1){
      cInfo.remarks1 = remarksList[0];
    }

    if(remarksList.length >= 2){
      cInfo.remarks2 = remarksList[1];
    }

    if(remarksList.length >= 3){
      cInfo.remarks3 = remarksList[2];
    }

    if(remarksList.length >= 4){
      cInfo.remarks4 = remarksList[3];
    }

    if(remarksList.length >= 5){
      cInfo.remarks5 = remarksList[4];
    }

    return cInfo;
  }

  /** 残高 表示 */
  private calcBalance(){
    this.balance = 0;
    this.balance = this.salesTotal - this.depositTotal;
    if (!this.cd['destroyed']) {
      this.cd.detectChanges();
    }
  }

  private ToFormatDate(value){
    var strDate : string;
    if (!Common.IsNullOrEmpty(value)){
      var date = moment(value);
      strDate = date.format(SystemConst.DATE_FORMAT_YYYYMMDD);
    }
    return strDate;
  }
//#endregion ---- private --------------------------------------------------

//#region ----- テーブル行追加/削除 等 制御 --------------------------------------------------

  //#region ---- 部屋タイプ --------------------------------------------------
  /** 行追加 部屋タイプ */
  addRoomTypeInfo() {
    this.roomTypeList = this.roomTypeSource.data;
    var roomTypeForm = this.setInitFormInfo(InfoType.RoomType);

    var wkdate = this.roomTypeInfoForm.controls.useDate.value;
    roomTypeForm.patchValue({
      useDate : wkdate
    });

    this.roomTypeList.push(roomTypeForm);
    this.roomTypeSource.data = this.roomTypeList;

    this.changeRoomTypeInfo();
  }

  /** 行削除 部屋タイプ */
  removeRoomTypeInfo(roomtypeSeq: string) {
    var wkList = [];
    this.roomTypeList = this.roomTypeSource.data;

    if (this.roomTypeList.length == 1) {
      this.roomTypeList=[];
      this.roomTypeSource.data=[];
      this.addRoomTypeInfo();
    } else {
      for (var i = 0, len = this.roomTypeList.length; i < len; i++) {
        if (this.roomTypeList[i].controls.roomtypeSeq.value != roomtypeSeq) {
          wkList.push(this.roomTypeList[i]);
        }
      }

      this.roomTypeList = wkList;
      this.roomTypeSource.data = this.roomTypeList;
    }

    this.changeRoomTypeInfo();
  }

  /** 部屋情報表示変更 */
  initRoomTypeInfo(useDate: string) {

    this.roomTypeList = [];
    this.roomTypeSource.data = [];

    this.roomTypeListAll.forEach((roomType) => {

      const wkRoomTypeSeq: number = Common.ToNumber(roomType.controls.roomtypeSeq.value);
      const wkUseDate: string = Common.ToFormatStringDate(new Date(roomType.controls.useDate.value));

      let routeSeqList = this.assignCheckList.filter(x => x.roomtypeSeq == wkRoomTypeSeq && x.useDate == wkUseDate)
                                          .map(y => y.routeSEQ.toString());

      let keys = new Array<number>();
      let assignCount = 0;

      this.assignCheckList.filter(x => x.roomtypeSeq == wkRoomTypeSeq && x.useDate == wkUseDate && !Common.IsNullOrEmpty(x.roomNo)).forEach(x => {
        if(keys.indexOf(x.routeSEQ) < 0){
          keys.push(x.routeSEQ);
          assignCount++;
        }
      });

      // 到着日当日のみ表示の為セット
      if (roomType.controls.useDate.value == useDate) {
        this.roomTypeInfoForm = this.setRoomTypeInfoForm(
          roomType.controls.useDate.value
          , roomType.controls["roomType"].value
          , roomType.controls.roomCount.value
          , roomType.controls.roomtypeSeq.value.toString()
          , routeSeqList
          , assignCount
          , roomType.controls.creator.value
          , roomType.controls.cdt.value
          , roomType.controls.version.value
          , roomType.controls.index.value
        );

        this.roomTypeList.push(this.roomTypeInfoForm);
      }
    });

    if(this.roomTypeList.length==0){
      this.roomTypeInfoForm = this.setRoomTypeInfoForm(
        useDate
        , ''
        , 0
        , ''
        , null
        , 0
        , ''
        , ''
        , 0
        , 0
      );

      this.roomTypeList.push(this.roomTypeInfoForm);
    }
    this.roomTypeSource.data = this.roomTypeList;

  }
  //#endregion ---- 部屋タイプ --------------------------------------------------

  //#region ---- 入金情報 --------------------------------------------------
  /** 行追加 入金情報 */
  addDepositInfo() {
    this.depositList = this.depositSource.data;
    var depositInfoForm = this.setInitFormInfo(InfoType.Deposit);
    this.depositList.push(depositInfoForm);
    this.depositSource.data = this.depositList;
  }

  /** 行削除 入金情報 */
  removeDepositInfo(detailsSeq: string) {
    var wkList = [];
    this.depositList = this.depositSource.data;
    for (var i = 0, len = this.depositSource.data.length; i < len; i++) {
      if (this.depositList[i].controls.detailsSeq.value != detailsSeq) {
        wkList.push(this.depositList[i]);
      }
    }
    this.depositList = wkList;
    this.depositSource.data = this.depositList;
    this.calcDepositTotal();
  }

  /** ビル分割番号 エラーチェック
   * @param  {} obj
   * @returns boolean disabled
   */
  public hasErrorBillSeparateSeq(obj) : boolean{

    if(isNullOrUndefined(obj)) return true;

    if(obj.controls['billSeparateSeq'].invalid
        || obj.controls.billSeparateSeqError.invalid
        || Common.IsNullOrEmpty(obj.controls['billSeparateSeq'].value)
        || obj.controls['adjustmentFlag'].value == SystemConst.ADJUSTMENTED){
      return  true;
    }

    return false;
  }

  /** 残額をセット 入金情報 */
  public setBalance(obj){

    if(this.hasErrorBillSeparateSeq(obj)) return;

    let billSepNo = obj.controls['billSeparateSeq'].value;
    let detailsSeq = obj.controls['detailsSeq'].value;

    let charges : number = 0;
    let paid : number = 0;
    let balance : number = 0;

    // 登録済 売上金額
    charges = this.salesDetailsForm.salesTotalsByBill[billSepNo];

    // 登録済 入金金額
    this.depositSource.data.forEach(x => {
      if(x.controls['billSeparateSeq'].value == billSepNo
         && x.controls['detailsSeq'].value != detailsSeq){

        paid += Common.ToNumber(x.controls['price'].value);
      }
    });

    balance = charges - paid;
    if(balance >= 0){
      obj.controls['price'].setValue(balance);
      this.calcDepositTotal();
    }

  }
  //#endregion ---- 入金情報 --------------------------------------------------

  //#region ---- 備考 --------------------------------------------------
  /** 行追加 備考 */
  addRemarksInfo() {
    this.remarksList = this.remarksSource.data;
    var priceInfoForm1 = this.setInitFormInfo(InfoType.Remarks);
    this.remarksList.push(priceInfoForm1);
    this.remarksSource.data = this.remarksList;
  }

  /** 行追加 備考(顧客マスタより展開) */
  addRemarksInfoFromCustomer(remarks :string) {
    let addRemarks :FormGroup = this.setRemarksInfoForm(remarks, ReserveCommon.SeqPrefix + this.remarksSEQ);
    this.remarksSEQ++;

    this.remarksList = this.remarksSource.data;
    this.remarksList.push(addRemarks);
    this.remarksSource.data = this.remarksList;
  }

  /** 行削除 備考 */
  removeRemarksInfo(noteSeq: string) {
    var wkList = [];
    this.remarksList = this.remarksSource.data;
    for (var i = 0, len = this.remarksSource.data.length; i < len; i++) {
      if (this.remarksList[i].controls.noteSeq.value != noteSeq) {
        wkList.push(this.remarksList[i]);
      }
    }
    this.remarksList = wkList;
    this.remarksSource.data = this.remarksList;
  }
  //#endregion ---- 備考 --------------------------------------------------

//#endregion  ----- テーブル行追加/削除 等 制御 --------------------------------------------------

//#region ----- ボタン処理 --------------------------------------------------
  /** 保存 */
  public save() {

    // 画面の状態を保存する
    this.saveRoomTypeInfo(Common.ToFormatDate(Common.ToFormatStringDate(this.roomTypeInfoForm.value.useDate)));

    // 値 取得
    this.getView_ItemList();

    if (Common.IsNullOrEmpty(this.reserveNo)){
      // insert
      this.InsertInfo();
    }else{
      // update
      this.UpdateInfo();
    }
  }


  /** 予約取消 */
  ReserveCancel() {
    Common.modalMessageConfirm(Message.TITLE_CONFIRM, `予約を取り消します。${this.returnCode}よろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.RESERVE + '001').then((result) =>{
      // 結果が返ってきてからの処理
      if (!result) return;

      var cond = new StayInfo();
      cond.reserveNo = this.reserveNo;
      cond.companyNo = this._currentUser.displayCompanyNo;
      cond.updator = this._currentUser.userName;
      cond.version = this.reserveInfo.version;
      cond.reserveStateDivision = SystemConst.CANCEL_STATE;

      var msgTitle : string = Message.TITLE_ERROR;
      var message : string = '予約取消' + Message.UPDATE_ERROR;
      // update
      this.reserveService.updateInfo_ReserveCancel(cond).subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            Common.modalMessageSuccess(Message.TITLE_SUCCESS, `予約番号:${this.reserveNo}を取り消しました。`, MessagePrefix.SUCCESS + FunctionId.RESERVE + '001').then(() =>{
              // 結果が返ってきてからの処理
              this.router.navigate([this.roomsURL]);
            });
            return;

          case DBUpdateResult.VersionError:
            msgTitle = Message.TITLE_VERSION_ERROR
            message = Message.UPDATE_VERSION_ERROR;
            break;

          default:  // 上記以外の戻り値は全てエラー
            break;
        }

        Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.RESERVE + '001').then(() =>{
          // 結果が返ってきてからの処理
          // 再読込
          this.Reload();
        });
      },
      error => {
        alert(error);
      });
    });

  }

  /** 精算
   * @param  {string} billSeparateSeq ビル分割番号
   * @remarks ビル分割番号を指定しない場合、一括精算
   */
  public async Adjustment(billSeparateSeq : string) {

    var checkResult : boolean;
    var target : string;
    if (billSeparateSeq.length === 0){
      target = `すべてのビル`;
    }else{
      target = `ビル分割番号:${billSeparateSeq}`;
    }

    // 値 取得
    this.getView_ItemList();

    // チェック
    checkResult = ReserveCommon.CheckNotAdjustmented(billSeparateSeq, true, true);
    if (!checkResult) return;

    // バランスチェック
    checkResult = this.checkBalance(billSeparateSeq);
    if (!checkResult) return;

    // 確認
    let confirmResult = await Common.modalMessageConfirm(Message.TITLE_CONFIRM, `${target}を精算します。${this.returnCode}よろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.RESERVE + '002');

    // 結果が返ってきてからの処理
    if (!confirmResult) return;

    var cond = new AdjustmentUpdateInfo();

    // 予約情報
    cond.reserve = await this.setSaveValue_Update();
    if(cond.reserve == null) return;

    // 精算情報
    cond.adjustment = new SalesDetailsInfo();
    cond.adjustment.companyNo = this._currentUser.displayCompanyNo;
    cond.adjustment.reserveNo = this.reserveNo;
    cond.adjustment.updator = this._currentUser.userName;
    cond.adjustment.version = this.reserveInfo.version + 1; // 先に予約情報を更新するので+1
    cond.adjustment.billSeparateSeq = billSeparateSeq.length == 0 ? "0" : billSeparateSeq;
    cond.adjustment.adjustmentFlag = SystemConst.ADJUSTMENTED;

    var msgTitle : string = Message.TITLE_ERROR;
    var message : string = '精算情報' + Message.UPDATE_ERROR;

    // update
    this.reserveService.updateInfo_Adjustment(cond).subscribe(dbResult => {
      switch(dbResult){
        case DBUpdateResult.Success:
          this.showSnackBar(`${target}を精算しました。`);
          // 再読込
          this.Reload();
          return;

        case DBUpdateResult.VersionError:
          msgTitle = Message.TITLE_VERSION_ERROR
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:  // 上記以外の戻り値は全てエラー
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.RESERVE + '002').then(() =>{
        // 結果が返ってきてからの処理
        // 再読込
        this.Reload();
      });

    },
    error => {
      alert(error);
    });


  }

  /** 精算取消
   * @param  {string} billSeparateSeq ビル分割番号
   * @remarks ビル分割番号を指定しない場合、一括精算取消
   */
  public async AdjustmentCancel(billSeparateSeq : string) {

    var checkResult : boolean;
    var target : string;
    if (billSeparateSeq.length === 0){
      target = `すべてのビル`;
    }else{
      target = `ビル分割番号:${billSeparateSeq}`;
    }

    // チェック
    checkResult = this.CheckAdjustmented(billSeparateSeq, true);
    if (!checkResult) return;

    // 確認
    let confirmResult = await Common.modalMessageConfirm(Message.TITLE_CONFIRM, `${target}の精算を取り消します。${this.returnCode}よろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.RESERVE + '003');
    // 結果が返ってきてからの処理
    if (!confirmResult) return;

    var cond = new AdjustmentUpdateInfo();

    // 予約情報
    cond.reserve = await this.setSaveValue_Update();
    if(cond.reserve == null) return;

    // 精算情報
    cond.adjustment = new SalesDetailsInfo();
    cond.adjustment.companyNo = this._currentUser.displayCompanyNo;
    cond.adjustment.reserveNo = this.reserveNo;
    cond.adjustment.updator = this._currentUser.userName;
    cond.adjustment.version = this.reserveInfo.version + 1; // 先に予約情報を更新するので+1
    cond.adjustment.billSeparateSeq = billSeparateSeq.length == 0 ? "0" : billSeparateSeq;
    cond.adjustment.adjustmentFlag = SystemConst.NOT_ADJUSTMENTED;

    var msgTitle : string = Message.TITLE_ERROR;
    var message : string = '精算情報' + Message.UPDATE_ERROR;

    // update
    this.reserveService.updateInfo_Adjustment(cond).subscribe(dbResult => {
      switch(dbResult){
        case DBUpdateResult.Success:
          this.showSnackBar(`${target}の精算を取り消しました。`);
          // 再読込
          this.Reload();
          return;

        case DBUpdateResult.VersionError:
          msgTitle = Message.TITLE_VERSION_ERROR
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:  // 上記以外の戻り値は全てエラー
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.RESERVE + '003').then(() =>{
        // 結果が返ってきてからの処理
        // 再読込
        this.Reload();
      });

    },
    error => {
      alert(error);
    });
  }

  /** 利用者検索画面を起動 */
  public guestSearch(){

    let inputPhone =  this.guestInfoForm.controls['phone'].value;
    let inputGuestNameKana =  this.guestInfoForm.controls['guestNameKana'].value;

    let dialogRef = this.dialog.open(GuestSearchComponent
      , { width: '70vw', height: 'auto'
          , data: {phone: inputPhone
                   , guestNameKana: inputGuestNameKana
          }
      });

    // 戻り値があれば利用者情報にセット
    dialogRef.afterClosed().subscribe(result => {
      if(!Common.IsNullOrEmpty(result)){
        this.guestInfoForm.patchValue(result);
        this.SetCustomerRemarks(result);
      }
    });

  }

  private SetCustomerRemarks(guestInfo : GuestInfo){

    let isLastRowEnpty : boolean = false;

    if(this.remarksSource.data.length == 0){
      let intialForm :FormGroup = this.setRemarksInfoForm('', ReserveCommon.SeqPrefix + this.remarksSEQ);
      this.remarksSEQ++;

      this.remarksList = this.remarksSource.data;
      this.remarksList.push(intialForm);
      this.remarksSource.data = this.remarksList;
    }

    let remarksCount = this.remarksSource.data.length;
    let noteSeq : string;
    if(this.remarksSource.data[remarksCount - 1].value.remarks == ''){
      isLastRowEnpty = true;
      noteSeq = this.remarksSource.data[remarksCount - 1].value.noteSeq;
    }

    if(guestInfo.remarks1 != ''){
      if(isLastRowEnpty){
        this.removeRemarksInfo(noteSeq);
        this.addRemarksInfoFromCustomer(guestInfo.remarks1);
        isLastRowEnpty = false;
      }else{
        this.addRemarksInfoFromCustomer(guestInfo.remarks1);
      }
    }

    if(guestInfo.remarks2 != ''){
      if(isLastRowEnpty){
        this.removeRemarksInfo(noteSeq);
        this.addRemarksInfoFromCustomer(guestInfo.remarks2);
        isLastRowEnpty = false;
      }else{
        this.addRemarksInfoFromCustomer(guestInfo.remarks2);
      }
    }

    if(guestInfo.remarks3 != ''){
      if(isLastRowEnpty){
        this.removeRemarksInfo(noteSeq);
        this.addRemarksInfoFromCustomer(guestInfo.remarks3);
        isLastRowEnpty = false;
      }else{
        this.addRemarksInfoFromCustomer(guestInfo.remarks3);
      }
    }

    if(guestInfo.remarks4 != ''){
      if(isLastRowEnpty){
        this.removeRemarksInfo(noteSeq);
        this.addRemarksInfoFromCustomer(guestInfo.remarks4);
        isLastRowEnpty = false;
      }else{
        this.addRemarksInfoFromCustomer(guestInfo.remarks4);
      }
    }

    if(guestInfo.remarks5 != ''){
      if(isLastRowEnpty){
        this.removeRemarksInfo(noteSeq);
        this.addRemarksInfoFromCustomer(guestInfo.remarks5);
        isLastRowEnpty = false;
      }else{
        this.addRemarksInfoFromCustomer(guestInfo.remarks5);
      }
    }
  }

  /** 会場状況へ遷移(リンク) */
  public showFacility(value: string = ''){
    let useDate;
    if (value !== ''){
      useDate = this.ToFormatDate(value);
    }
    const params = { queryParams: {"date": useDate, "reserveNo" : this.reserveNo } };
    this.router.navigate([this.facilityURL], params);
  }

  /** 部屋割詳細へ遷移 */
  public showRoomDetails(){
    this.router.navigate([this.roomsDetailsURL, this.reserveNo]);
  }

  /** 明細書発行へ遷移 */
  public showBill(){
    this.router.navigate([this.billURL, this.reserveNo]);
  }

  /** 顧客登録 */
  public registerCustomer(){

    // 既に顧客番号が入力されている場合、メッセージ表示して処理終了
    let inputCustomerNo =  this.guestInfoForm.controls['customerNo'].value;
    if(inputCustomerNo != null && inputCustomerNo != ""){
      var message = "顧客番号が既に入力されています。" + this.returnCode + "顧客番号が未入力の場合のみ顧客登録できます。"
      Common.modalMessageNotice(Message.TITLE_NOTICE, message, MessagePrefix.NOTICE + FunctionId.RESERVE + '001').then(()=>{
        return;
      });
    }else{
      // 利用者情報・備考情報(Max5行)を収集
      var addCustomerInfo : CustomerInfo = this.setCustomerInfo();

      // 顧客マスタに登録＋採番した顧客番号を画面に表示
      this.customerService.InsertCustomerForReserve(addCustomerInfo).pipe().subscribe(result => {
        if (result.resultCode == 0) {
          Common.modalMessageSuccess(Message.TITLE_SUCCESS, '顧客情報' + Message.INSERT_SUCCESS_NOTICE, MessagePrefix.SUCCESS + FunctionId.RESERVE + '002');

          // 新規採番した顧客番号を表示
          let currentGuestInfo : GuestInfo = this.guestInfoForm.value;
          currentGuestInfo.customerNo = result.customerNo;
          this.guestInfoForm.patchValue(currentGuestInfo);
        }else{
          Common.modalMessageError(Message.TITLE_ERROR, '顧客情報' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.RESERVE + '004');
          return;
        }
        });
    }
  }

  /** 予約変更履歴を表示 */
  public showReserveLog(){

    this.dialog.open(ReserveLogComponent, { width: '90vw', height: '85vh', data: {reserveNo: this.reserveNo }});

  }

//#endregion ----- ボタン/リンク --------------------------------------------------

//#region ----- 画面項目 状態制御 --------------------------------------------------

  /** 各フォームのValidationチェックがエラーなら保存ボタンを無効にする
   * @returns boolean true: エラーあり, false:エラーなし
   */
  public CheckInvalid_SaveButton() : boolean{

    let stayItemInvalied : boolean = false;
    let otherItemInvalied : boolean = false;
    let roomtypeInvalied : boolean = false;
    let depositInvalied : boolean = false;
    let remarksInvalied : boolean = false;

    if (this.salesDetailsForm != null){
      this.salesDetailsForm.itemList.forEach(dailyList => {
        for(let i = 0; i < dailyList.length; i++){
          if(dailyList[i].invalid == true) {
            stayItemInvalied = true;
            return; // ← continue (forEach)
          }
        }
      });
    }

    this.roomTypeListAll.forEach(roomTypeList => {
      if(roomTypeList.invalid == true) {
        roomtypeInvalied = true;
        return; // ← continue (forEach)
      }
    });
    this.RoomtypeInvalied = roomtypeInvalied;

    // 入力中のデータ
    this.roomTypeSource.data.forEach(roomTypeList => {
      if(roomTypeList.invalid == true) {
        roomtypeInvalied = true;
        return; // ← continue (forEach)
      }
    });

    this.depositSource.data.forEach(depositList => {
      if(depositList.invalid == true) {
        depositInvalied = true;
        return; // ← continue (forEach)
      }
    });

    this.remarksSource.data.forEach(depositList => {
      if(depositList.invalid == true) {
        remarksInvalied = true;
        return; // ← continue (forEach)
      }
    });

    return (this.stayInfoForm.invalid
            || this.guestInfoForm.invalid
            || this.agentInfoForm.invalid
            || roomtypeInvalied
            || stayItemInvalied
            || otherItemInvalied
            || depositInvalied
            || remarksInvalied
          );
  }

  /** C/I前ならキャンセル可
   * @returns boolean true: キャンセル可, false: キャンセル不可
   */
  public checkVisible_State_Cancelable() : boolean{

    if(Common.IsNullOrEmpty(this.reserveNo) || this.disabledFlag) return false;  // キャンセル不可

    if(this.assignCheckList != null && this.assignCheckList.length > 0){
      var list = this.assignCheckList.filter(x =>
        x.roomStateClass == SystemConst.ROOMSTATUS_STAY
        || x.roomStateClass == SystemConst.ROOMSTATUS_CO
        || x.roomStateClass == SystemConst.ROOMSTATUS_CLEANED
      );
      if (list.length > 0) return false;  // キャンセル不可
    }
    return true;
  }

  /** 滞在中なら精算情報を表示する
   * @returns boolean true: 滞在中, false: 未C/I
   */
  public checkVisible_State_Stay() : boolean{
    if(!Common.IsNullOrEmpty(this.reserveNo) && this.assignCheckList != null && this.assignCheckList.length > 0){
      var list = this.assignCheckList.filter(x => x.roomStateClass == SystemConst.ROOMSTATUS_STAY );
      if (list.length > 0) return true;
    }
    return false;
  }

  /** C/O済なら編集不可
   * @returns boolean true: C/O済, false: 未C/O
   */
  public checkVisible_State_CO() : boolean{
    if(!Common.IsNullOrEmpty(this.reserveNo) && this.assignCheckList != null && this.assignCheckList.length > 0){
      var list = this.assignCheckList.filter(x =>
        x.roomStateClass == SystemConst.ROOMSTATUS_CO
        || x.roomStateClass == SystemConst.ROOMSTATUS_CLEANED
      );
      if (list.length == this.assignCheckList.length) return true;
    }
    return false;
  }

  /** アサイン済の場合、部屋タイプ情報編集不可
   * @returns boolean true: 編集不可, false: 編集可
   */
  public checkDisable_State_Assign() : boolean{
    if(!Common.IsNullOrEmpty(this.reserveNo) && this.assignCheckList != null && this.assignCheckList.length > 0){
      var list = this.assignCheckList.filter(x => x.roomStateClass.trim().length > 0 );
      if (list.length > 0) return true;
    }
    return false;
  }
//#endregion ----- 画面項目 状態制御 --------------------------------------------------

//#region ----- マスタ類 取得 --------------------------------------------------

  /** マスタ類 取得 */
  private getInitMasterInfo(){

    var cond = new Base();
    cond.companyNo = this._currentUser.displayCompanyNo;

    // 部屋タイプリスト取得
    this.reserveService.getMasterRoomTypeList(cond).subscribe((res: CodeNameInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "部屋タイプリスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.RESERVE + '005'); }
      this.M_RoomTypeList = res;
    });

    // エージェントリスト取得
    this.reserveService.getMasterAgentList(cond).subscribe((res: AgentInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "エージェントリスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.RESERVE + '006'); }
      this.M_AgentList = res;
    });

    // 金種リスト取得
    this.reserveService.getMasterDenominationCodeList(cond).subscribe((res: DenominationInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "金種リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.RESERVE + '007'); }
      this.M_DenominationList = res;
    });
  }
//#endregion ----- マスタ類 取得 --------------------------------------------------

//#region ----- データ 取得/登録/更新 --------------------------------------------------

  /** 予約データ 取得 */
  private getReserveInfo() {

    // 初期化
    this.reserveInfo = new Reserve;
    this.roomTypeList = [];
    this.roomTypeListAll = [];      // 2020.07.22 Add
    this.itemList = [];
    this.depositList = [];
    this.remarksList = [];

    // 条件
    var cond: Reserve = new Reserve();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;

    // データ取得
    this.reserveService.getReserveInfoByPK(cond).subscribe(result => {
      if (result.stayInfo != null) {
        // 取得した予約情報をセット
        this.setReserveInfo(result)
      } else {
        Common.modalMessageError(Message.TITLE_ERROR, `存在しない予約番号です。(予約番号:${this.reserveNo})`, MessagePrefix.ERROR + FunctionId.RESERVE + '008').then(() => {
          this.router.navigate([this.roomsURL]);
        });
      }
    });
  }

  /** 予約データ 登録 */
  private InsertInfo(){

    // データ作成
    var reserve = this.setSaveValue_Insert();

    // 登録
    this.reserveService.insertInfo(reserve).subscribe( (result: ResultInfo)  => {
      if (result != null) {

        var reserveMessage = `予約情報${Message.INSERT_SUCCESS_NOTICE} (予約番号:${result.reserveNo})`;

        if (result.assignResult != 0){

          var assignMessage = "部屋番号：" + this.roomNo + Message.ASSIGN_SUCCESS_NOTICE + this.returnCode
                            + "2泊目以降、指定の部屋に空きがない為、" + this.returnCode
                            + "アサインできませんでした。" + this.returnCode
                            + "詳細は連泊状況から確認してください。"

          Common.modalMessageNotice(Message.TITLE_NOTICE, assignMessage, MessagePrefix.NOTICE + FunctionId.RESERVE + '002').then(()=>{
            this.showSnackBar(reserveMessage);
            this.router.navigate([this.roomsURL]);
          });

        }else{
          this.showSnackBar(reserveMessage);
          this.router.navigate([this.roomsURL]);
        }
      } else{
        var msgTitle : string = Message.TITLE_ERROR;
        var message: string = "予約情報" + Message.UPDATE_ERROR;
        Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.RESERVE + '009').then(() =>{
          // 結果が返ってきてからの処理
          // 再読込
          this.Reload();
        });
      }
    },
    error => {
      alert(error);
    });
  }

  /** 予約データ 更新
   * @param  {boolean} reload true:リロードする, false:しない(精算前更新)
   */
  private async UpdateInfo(){

    // データ作成
    var reserve = await this.setSaveValue_Update();
    if(reserve == null) return;

    var msgTitle : string = Message.TITLE_ERROR;
    var message: string = "予約情報" + Message.UPDATE_ERROR;

    // 更新
    this.reserveService.updateInfo(reserve).subscribe(result => {
      switch (result.reserveResult) {
        case DBUpdateResult.Success:

          var reserveMessage = "予約情報" + Message.UPDATE_SUCCESS_NOTICE;
          if (result.assignResult != 0){

            var assignMessage = "2泊目以降、指定の部屋に空きがない為、" + this.returnCode
                              + "アサインできませんでした。" + this.returnCode
                              + "詳細は連泊状況から確認してください。"

            Common.modalMessageNotice(Message.TITLE_NOTICE, assignMessage, MessagePrefix.NOTICE + FunctionId.RESERVE + '003').then(()=>{
              this.showSnackBar(reserveMessage);
              this.router.navigate([this.roomsURL]);
            });

          }
          this.showSnackBar(reserveMessage);
          this.router.navigate([this.roomsURL]);
          return;

        case DBUpdateResult.VersionError:
          // バージョンError
          msgTitle = Message.TITLE_VERSION_ERROR
          message = Message.UPDATE_VERSION_ERROR;
          break;

        default:  // 上記以外の戻り値は全てエラー
          break;
      }

      Common.modalMessageError(msgTitle, message, MessagePrefix.ERROR + FunctionId.RESERVE + '010').then(() =>{
        // 結果が返ってきてからの処理
        // 再読込
        this.Reload();
      });

    },
    error => {
      alert(error);
    });
  }
//#endregion ----- データ 取得/登録/更新 --------------------------------------------------

//#region ----- 取得処理 関連 --------------------------------------------------
  /** 予約データ初期化 */
  private initReserveInfo() {

    // 初期値
    this.cancelFlag = false;
    this.disabledFlag = false;
    this.reserveAdjustmentFlag = SystemConst.NOT_ADJUSTMENTED;
    this.adjustmentedBillNoCheckList = [];
    this.stayInfoForm.patchValue({ reserveDate: moment()});

    // 連泊状況から遷移の場合
    if(!Common.IsNullOrEmpty(this.roomNo)){
      this.header.lockCompanySeleter();

      var daysDiff = moment(this.departureDate).diff(moment(this.arrivalDate), 'days')
      this.stayInfoForm.patchValue({
        arrivalDate: moment(this.arrivalDate)
        , departureDate : moment(this.departureDate)
        , stayDays : daysDiff
      });

      this.roomTypeInfoForm.patchValue({
        roomType : this.roomType
      });
    }

    // 共通モジュール に マスタ類 を渡す
    ReserveCommon.setMasterList(this.reserveAdjustmentFlag, this.adjustmentedBillNoCheckList)

    // テーブルの初期化
    this.roomTypeSource = new MatTableDataSource([this.roomTypeInfoForm]);
    this.depositSource = new MatTableDataSource([this.depositInfoForm]);
    this.remarksSource = new MatTableDataSource([this.remarksInfoForm]);

    this.calcPersonCount();
  }

  /** 取得した予約情報をセット */
  private setReserveInfo(result : Reserve){

    this.reserveInfo = result;

    // Web予約 電文情報
    this.xTravelAgncBkngNum = result.xTravelAgncBkngNum;
    this.scCd = result.scCd;
    this.xTravelAgncBkngSeq = result.xTravelAgncBkngSeq;

    // 宿泊情報
    var stay = result.stayInfo;
    this.stayInfoForm.patchValue({
      arrivalDate: moment(stay.arrivalDate)
      , departureDate: moment(stay.departureDate)
      , stayDays: stay.stayDays
      , memberMale: stay.memberMale
      , memberFemale: stay.memberFemale
      , memberChildA: stay.memberChildA
      , memberChildB: stay.memberChildB
      , memberChildC: stay.memberChildC
      , memberTotal: 0
      , reserveDate: moment(stay.reserveDate)
      , creator: stay.creator
      , cdt: stay.cdt
      , version: stay.version
    });

    this.reserveAdjustmentFlag = stay.adjustmentFlag;
    this.cancelFlag = (stay.reserveStateDivision === SystemConst.CANCEL_STATE);

    // アサイン情報
    this.assignCheckList = result.assignList;

    // キャンセル済かC/O済なら編集不可
    this.disabledFlag = ( this.cancelFlag ||  this.checkVisible_State_CO() );

    // 精算済ビルNoリスト
    this.adjustmentedBillNoCheckList = result.adjustmentedBillNoCheckList;

    // 共通モジュール に マスタ類 を渡す
    ReserveCommon.setMasterList(this.reserveAdjustmentFlag, this.adjustmentedBillNoCheckList)

    // エージェント
    this.agentInfoForm.patchValue(result.agentInfo);

    // 利用者情報
    this.guestInfoForm.patchValue(result.guestInfo);

    // 部屋タイプ
    // 1日目分を表示
    let arrivalDate = stay.arrivalDate;
    let roomTypeInfoFormWk = this.setInitFormInfo(InfoType.RoomType);

    var idx : number = 0;
    result.roomTypeInfo.forEach((roomType) => {
      let routeSeqList = result.assignList.filter(x => x.roomtypeSeq == roomType.roomtypeSeq && x.useDate == roomType.useDate)
                                          .map(y => y.routeSEQ.toString());

      let keys = new Array<number>();
      let assignCount = 0;

      result.assignList.filter(x => x.roomtypeSeq == roomType.roomtypeSeq && x.useDate == roomType.useDate && !Common.IsNullOrEmpty(x.roomNo)).forEach(x => {
        if(keys.indexOf(x.routeSEQ) < 0){
          keys.push(x.routeSEQ);
          assignCount++;
        }
      });

      roomTypeInfoFormWk = this.setRoomTypeInfoForm(
        Common.ToFormatDate(roomType.useDate)
        , roomType.roomType
        , roomType.rooms
        , roomType.roomtypeSeq.toString()
        , routeSeqList
        , assignCount
        , roomType.creator
        , roomType.cdt
        , roomType.version
        , idx
      );

      this.roomTypeListAll.push(roomTypeInfoFormWk);

      // 到着日当日のみ表示にセット
      if (roomType.useDate == arrivalDate) {
        this.roomTypeInfoForm = this.setRoomTypeInfoForm(
          Common.ToFormatDate(roomType.useDate)
          , roomType.roomType
          , roomType.rooms
          , roomType.roomtypeSeq.toString()
          , routeSeqList
          , assignCount
          , roomType.creator
          , roomType.cdt
          , roomType.version
          , idx
        );

        this.roomTypeList.push(this.roomTypeInfoForm);
      }

      idx++;
    });

    if(this.roomTypeList.length==0){
      roomTypeInfoFormWk = this.setInitFormInfo(InfoType.RoomType);
      this.roomTypeList.push(roomTypeInfoFormWk);
    }
    this.roomTypeSource.data = this.roomTypeList;

    // this.roomTypeInfoForm.value.useDate = Common.ToFormatDate(stay.arrivalDate);
    // this.roomTypeInfoForm.patchValue({
    //   useDate: Common.ToFormatDate(stay.arrivalDate)
    // })

    // 入金情報
    result.depositInfo.forEach((deposit) => {
      var depositInfoForm = this.setDepositInfoForm(
        deposit.depositDate
          , deposit.denominationCode
          , deposit.printName
          , deposit.price
          , deposit.billingRemarks
          , deposit.billSeparateSeq
          , deposit.adjustmentFlag
          , deposit.detailsSeq.toString()
          , deposit.creator
          , deposit.cdt
          , deposit.version
        );
      this.depositList.push(depositInfoForm);
    })
    if(this.depositList.length==0){
      this.depositList.push(this.depositInfoForm);
    }
    this.depositSource.data = this.depositList;

    // 備考情報
    result.remarksInfo.forEach((remarks) => {
      var remarksForm = this.setRemarksInfoForm(
          remarks.remarks
          , remarks.noteSeq.toString()
          , remarks.creator
          , remarks.cdt
          , remarks.version
        );
      this.remarksList.push(remarksForm);
    })
    if(this.remarksList.length==0){
      this.remarksList.push(this.remarksInfoForm);
    }
    this.remarksSource.data = this.remarksList;

    // 会場情報
    this.rsvFacilityList = result.trnFacilityInfo.map( (wkList) =>{
      let list: any;
      list = wkList;
      list.useDate =  `${Common.ToFormatDate(wkList.useDate)}`;
      list.useTime = `${Common.ToFormatTime(wkList.startTime)} ~ ${Common.ToFormatTime(wkList.endTime)}`;
      return list;
    });

    // maxItemDetailSeq
    result.itemInfo.forEach(x => {
      if(x.detailsSeq > this.maxItemDetailSeq) this.maxItemDetailSeq = x.detailsSeq;
      if(x.setItemSeq > this.maxSetItemSeq) this.maxSetItemSeq = x.setItemSeq;
    });

    // maxRoomTypeSeq
    this.roomTypeList.forEach(x => {
      if(x.controls.roomtypeSeq.value > this.maxRoomTypeSeq) this.maxRoomTypeSeq = Common.ToNumber(x.controls.roomtypeSeq.value);
    });

    // maxRoomRouteSeq
    this.assignCheckList.forEach(x => {
      if(x.routeSEQ > this.maxRoomRouteSeq) this.maxRoomRouteSeq = x.routeSEQ;
    });

    // maxDepositSeq
    this.depositList.forEach(x => {
      if(x.controls.detailsSeq.value > this.maxDepositSeq) this.maxDepositSeq = Common.ToNumber(x.controls.detailsSeq.value);
    });

    // maxRemarksSeq
    this.remarksList.forEach(x => {
      if(x.controls.noteSeq.value > this.maxRemarksSeq) this.maxRemarksSeq = Common.ToNumber(x.controls.noteSeq.value);
    });

    this.setStayDays();
    this.calcPersonCount();
    this.calcDepositTotal();

    // View に 情報を渡す
    this.setView_All(moment(stay.arrivalDate), result.itemInfo);
    this.getView_ItemList();
}
//#endregion ----- 取得処理 関連 --------------------------------------------------

//#region ----- 登録処理 関連 --------------------------------------------------

  /** 保存する値をセット(登録)
   * @returns Reserve 登録用データ
   */
  private setSaveValue_Insert() : Reserve{

    var addInfo = new Reserve();
    addInfo.companyNo = this._currentUser.displayCompanyNo;
    addInfo.updator = this._currentUser.userName;

    addInfo.stayInfo = this.stayInfoForm.value;
    addInfo.stayInfo.arrivalDate = this.ToFormatDate(addInfo.stayInfo.arrivalDate);
    addInfo.stayInfo.departureDate = this.ToFormatDate(addInfo.stayInfo.departureDate);
    addInfo.stayInfo.reserveDate = this.ToFormatDate(addInfo.stayInfo.reserveDate);
    addInfo.stayInfo.memberMale = Common.ToNumber(addInfo.stayInfo.memberMale);
    addInfo.stayInfo.memberFemale = Common.ToNumber(addInfo.stayInfo.memberFemale);
    addInfo.stayInfo.memberChildA = Common.ToNumber(addInfo.stayInfo.memberChildA);
    addInfo.stayInfo.memberChildB = Common.ToNumber(addInfo.stayInfo.memberChildB);
    addInfo.stayInfo.memberChildC = Common.ToNumber(addInfo.stayInfo.memberChildC);

    addInfo.guestInfo = this.guestInfoForm.value;
    addInfo.guestInfo.useDate = SystemConst.USE_DATE_EMPTY;
    addInfo.guestInfo.routeSEQ = SystemConst.RESERVE_ROUTE_SEQ;
    addInfo.guestInfo.nameSeq = SystemConst.DEFAULT_NAME_SEQ;

    addInfo.agentInfo = this.agentInfoForm.value;
    addInfo.creator = this._currentUser.userName;
    addInfo.version = 0;

    var stayDays = addInfo.stayInfo.stayDays;
    if (stayDays == 0) stayDays = 1;

    var [roomTypeList, assignList] = this.createRoomTypeAssignList();

    addInfo.roomTypeInfo = roomTypeList;
    addInfo.assignList = assignList;

    addInfo.assignList.map(x => x.email = addInfo.guestInfo.email);

    var wkDetailsSeq : number = 1;
    this.itemList.forEach(dailyList => {

      for(var i = 0; i < dailyList.length; i++){

        if (Common.IsNullOrEmpty(dailyList[i].controls.item.value)) return;  // ← continue;

        // 追加
        var info = new SalesDetailsInfo();
        info.detailsSeq = wkDetailsSeq;  // 振り直し
        info.itemDivision = dailyList[i].controls.itemDivision.value;
        info.mealDivision = '';
        info.useDate = dailyList[i].controls.useDate.value;
        info.itemCode = dailyList[i].controls.item.value;
        info.printName = dailyList[i].controls.printName.value;
        info.unitPrice = Common.ToNumber(dailyList[i].controls.unitPrice.value);
        info.itemNumberM = Common.ToNumber(dailyList[i].controls.itemNumberM.value);
        info.itemNumberF = Common.ToNumber(dailyList[i].controls.itemNumberF.value);
        info.itemNumberC = Common.ToNumber(dailyList[i].controls.itemNumberC.value);
        info.amountPrice = Common.ToNumber(dailyList[i].controls.amountPrice.value);
        info.mealDivision = dailyList[i].controls.mealDivision.value;
        info.insideTaxPrice = Common.ToNumber(dailyList[i].controls.insideTaxPrice.value);
        info.insideServicePrice = Common.ToNumber(dailyList[i].controls. insideServicePrice.value);
        info.outsideServicePrice = Common.ToNumber(dailyList[i].controls.outsideServicePrice.value);
        info.taxDivision = dailyList[i].controls.taxDivision.value;
        info.serviceDivision = dailyList[i].controls.serviceDivision.value;
        info.setItemDivision = dailyList[i].controls.setItemDivision.value;
        info.setItemSeq = Common.ToNumber(dailyList[i].controls.setItemSeq.value);
        info.taxRateDivision = dailyList[i].controls.taxRateDivision.value;
        info.taxRate = dailyList[i].controls.taxRate.value;
        info.billSeparateSeq = dailyList[i].controls.billSeparateSeq.value;
        info.adjustmentFlag = dailyList[i].controls.adjustmentFlag.value;
        info.billNo = ''; // 新規は空

        addInfo.itemInfo.push(info);
        wkDetailsSeq++;
      }
    });

    var wkSeq = 1;
    this.depositSource.data.forEach(x => {

      if (Common.IsNullOrEmpty(x.controls.denominationCode.value)) return;  // ← continue

      var info = new DepositInfo();
      info.detailsSeq = wkSeq; // 振り直し
      info.depositDate = this.ToFormatDate(x.controls.depositDate.value);
      info.denominationCode = x.controls.denominationCode.value;
      info.printName = x.controls.printName.value;
      info.price = Common.ToNumber(x.controls.price.value);
      info.billingRemarks = x.controls.billingRemarks.value;
      info.billSeparateSeq = x.controls.billSeparateSeq.value;
      info.adjustmentFlag = SystemConst.NOT_ADJUSTMENTED;
      info.billNo = ''; // 新規は空

      addInfo.depositInfo.push(info);
      wkSeq++;
    });

    wkSeq = 1;
    this.remarksSource.data.forEach(x => {
      var info = new RemarksInfo();
      info.noteSeq = wkSeq; // 振り直し
      info.remarks = x.controls.remarks.value;
      if (!Common.IsNullOrEmpty(info.remarks)){
        addInfo.remarksInfo.push(info);
        wkSeq++;
      }
    });

    return addInfo;
  }
//#endregion  ---- 登録処理 関連 --------------------------------------------------

//#region ----- 更新処理 関連 --------------------------------------------------
  /** 保存する値をセット(更新)
   * @returns Reserve 更新用データ
   */
  private async setSaveValue_Update() : Promise<Reserve>{

    var orgInfo = this.reserveInfo;
    var updateInfo = new Reserve();
    updateInfo.companyNo = this._currentUser.displayCompanyNo;
    updateInfo.updator = this._currentUser.userName;
    updateInfo.reserveNo = this.reserveNo;
    updateInfo.version = this.reserveInfo.version;
    updateInfo.status = this.reserveInfo.status;

    // 宿泊情報
    updateInfo.stayInfo = this.stayInfoForm.value;
    updateInfo.stayInfo.arrivalDate = this.ToFormatDate(updateInfo.stayInfo.arrivalDate);
    updateInfo.stayInfo.departureDate = this.ToFormatDate(updateInfo.stayInfo.departureDate);
    updateInfo.stayInfo.reserveDate = this.ToFormatDate(updateInfo.stayInfo.reserveDate);
    updateInfo.stayInfo.adjustmentFlag = this.reserveAdjustmentFlag;
    updateInfo.xTravelAgncBkngNum = this.xTravelAgncBkngNum;

    // 利用者情報
    updateInfo.guestInfo = this.guestInfoForm.value;
    updateInfo.guestInfo.useDate = SystemConst.USE_DATE_EMPTY;
    updateInfo.guestInfo.routeSEQ = SystemConst.RESERVE_ROUTE_SEQ;
    updateInfo.guestInfo.nameSeq = SystemConst.DEFAULT_NAME_SEQ;

    let assignOverwriteFlag = false;
    if(orgInfo.guestInfo.guestName != updateInfo.guestInfo.guestName
      || orgInfo.stayInfo.memberMale != updateInfo.stayInfo.memberMale
      || orgInfo.stayInfo.memberFemale != updateInfo.stayInfo.memberFemale
      || orgInfo.stayInfo.memberChildA != updateInfo.stayInfo.memberChildA
      || orgInfo.stayInfo.memberChildB != updateInfo.stayInfo.memberChildB
      || orgInfo.stayInfo.memberChildC != updateInfo.stayInfo.memberChildC){

      let target = '';
      if(orgInfo.guestInfo.guestName != updateInfo.guestInfo.guestName) target = '利用者名';
      if(orgInfo.stayInfo.memberMale != updateInfo.stayInfo.memberMale
        || orgInfo.stayInfo.memberFemale != updateInfo.stayInfo.memberFemale
        || orgInfo.stayInfo.memberChildA != updateInfo.stayInfo.memberChildA
        || orgInfo.stayInfo.memberChildB != updateInfo.stayInfo.memberChildB
        || orgInfo.stayInfo.memberChildC != updateInfo.stayInfo.memberChildC){

          if(target.length > 0) target += '、';
          target += '人数';
      }

      let result =  await Common.modalMessageConfirm(Message.TITLE_CONFIRM, `${target}が変更されています。${this.returnCode}保存してもよろしいですか？`, null, MessagePrefix.CONFIRM + FunctionId.RESERVE + '004');
      if (!result) return null;

      if(orgInfo.hasRoomsNameFile){
        assignOverwriteFlag = await Common.modalMessageConfirm(Message.TITLE_CONFIRM, `利用者情報の内容で${this.returnCode}部屋割詳細情報を上書きしますか？`, null, MessagePrefix.CONFIRM + FunctionId.RESERVE + '005');
      }
    }
    updateInfo.guestInfo.overwriteFlag = assignOverwriteFlag;

    // エージェント情報
    updateInfo.agentInfo = this.agentInfoForm.value;

    var [roomTypeList, assignList] = this.createRoomTypeAssignList();

    // 希望部屋タイプ情報
    updateInfo.roomTypeInfo = this.setSaveValue_Update_RoomType(orgInfo.roomTypeInfo, roomTypeList);

    // アサイン
    updateInfo.assignList = this.setSaveValue_Update_Assign(orgInfo.assignList, assignList, assignOverwriteFlag);

    // 売上明細
    updateInfo.itemInfo = this.setSaveValue_Update_Item(orgInfo.itemInfo, this.itemList);

    // 入金情報
    updateInfo.depositInfo = this.setSaveValue_Update_Deposit(orgInfo.depositInfo);

    // 備考情報
    updateInfo.remarksInfo = this.setSaveValue_Update_Remarks(orgInfo.remarksInfo);

    return updateInfo;
  }

  /** 更新用データ 部屋タイプ
   * @param  {Array<RoomTypeInfo>} orgList 部屋タイプ(変更前)
   * @param  {Array<RoomTypeInfo>} checkList 部屋タイプ(変更後)
   * @returns Array
   */
  private setSaveValue_Update_RoomType(orgList : Array<RoomTypeInfo>, checkList : Array<RoomTypeInfo>) : Array<RoomTypeInfo>{

    var result = new Array<RoomTypeInfo>();

    var wkList = Array<RoomTypeInfo>();

    checkList.forEach(upd => {

      var hasData = orgList.find(y => y.useDate == upd.useDate && y.roomType == upd.roomType && y.roomtypeSeq == upd.roomtypeSeq);
      if (hasData == null){
        // 変更前になければ追加
        upd.addFlag = true;
        result.push(upd);
      }else{
        // それ以外はワークへ
        wkList.push(upd);
      }
    });

    orgList.forEach(x => {
      var wkInfo = wkList.find(y => y.useDate == x.useDate && y.roomType == x.roomType && y.roomtypeSeq == x.roomtypeSeq);

      // copy
      var info = new RoomTypeInfo();
      info.companyNo = x.companyNo;
      info.status = x.status;
      info.version = x.version;
      info.creator = x.creator;
      info.updator = x.updator;
      info.cdt = x.cdt;
      info.udt = x.udt;
      info.reserveNo = x.reserveNo;

      info.useDate = x.useDate;
      info.roomType = x.roomType;
      info.rooms = x.rooms;
      info.roomtypeSeq = x.roomtypeSeq;
      info.routeSEQ = x.routeSEQ;

      if(wkInfo == null){
        // 削除
        info.deleteFlag = true;

      } else if (this.check_updateValue_RoomType(info, wkInfo)){
        // 変更があれば更新
        info.useDate = wkInfo.useDate;
        info.roomType = wkInfo.roomType;
        info.rooms = wkInfo.rooms;
        // info.routeSeq / info.roomtypeSeq は 上書きしない
        info.updateFlag = true;

      } // 変更がないデータもアサインの作成に必要

      result.push(info);
    });

    return result;
  }

  /** 部屋タイプ･アサインリスト作成
   * @returns 部屋タイプリスト, アサインリスト
   */
  private createRoomTypeAssignList() : [Array<RoomTypeInfo>, Array<AssignInfo>]{

    var roomTypeList = new Array<RoomTypeInfo>();
    var assignList = new Array<AssignInfo>();

    var stayDays = this.stayInfoForm.controls['stayDays'].value;
    stayDays = (stayDays == 0) ? 1 : stayDays;

    var arrivalDate = this.ToFormatDate(this.stayInfoForm.controls['arrivalDate'].value);

    var guestName = this.guestInfoForm.controls['guestName'].value;
    var male = Common.ToNumber(this.stayInfoForm.controls['memberMale'].value);
    var female = Common.ToNumber(this.stayInfoForm.controls['memberFemale'].value);
    var childA = Common.ToNumber(this.stayInfoForm.controls['memberChildA'].value);
    var childB = Common.ToNumber(this.stayInfoForm.controls['memberChildB'].value);
    var childC = Common.ToNumber(this.stayInfoForm.controls['memberChildC'].value);

    var roomTypeSeqUpdFlag = false;
    var routeSeqUpdFlag = false;

    this.maxRoomRouteSeq=0;
    var routeSeq : number = this.maxRoomRouteSeq + 1;

    // this.roomTypeSource.data.forEach(x => {

    //   // 部屋数分
    //   for (var room = 0; room < x.controls['roomCount'].value; room++){

    //     // 泊数分
    //     for(var night = 0; night < stayDays; night++){

    //       var useDate = moment(arrivalDate).add(night, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);

    //       if (room === 0){
    //         // 部屋タイプ
    //         var roomInfo = new RoomTypeInfo();
    //         roomInfo.useDate = useDate;
    //         roomInfo.roomType = x.controls['roomType'].value;
    //         roomInfo.rooms = x.controls['roomCount'].value;

    //         if(x.value.roomtypeSeq.indexOf(ReserveCommon.SeqPrefix) < 0){
    //           roomInfo.roomtypeSeq = x.controls['roomtypeSeq'].value;
    //         } else {
    //           roomInfo.roomtypeSeq = this.maxRoomTypeSeq + 1;
    //           roomTypeSeqUpdFlag = true;
    //         }
    //         roomTypeList.push(roomInfo);
    //       }

    //       // アサイン
    //       var assignInfo = new AssignInfo();
    //       assignInfo.useDate = useDate;
    //       assignInfo.roomtypeCode = x.controls['roomType'].value;
    //       assignInfo.orgRoomtypeCode = x.controls['roomType'].value;
    //       assignInfo.roomNo = '';
    //       assignInfo.roomStateClass = '';

    //       assignInfo.guestName = guestName;
    //       assignInfo.memberMale = male;
    //       assignInfo.memberFemale = female;
    //       assignInfo.memberChildA = childA;
    //       assignInfo.memberChildB = childB;
    //       assignInfo.memberChildC = childC;

    //       if(!Common.IsNullOrEmpty(x.controls['routeSeqList'].value) && x.controls['routeSeqList'].value.length > room){
    //         assignInfo.routeSEQ = Common.ToNumber(x.controls['routeSeqList'].value[room]);
    //       }else{
    //         assignInfo.routeSEQ = routeSeq;
    //         routeSeqUpdFlag = true;
    //       }

    //       if(x.controls['roomtypeSeq'].value.indexOf(ReserveCommon.SeqPrefix) < 0){
    //         assignInfo.roomtypeSeq = x.controls['roomtypeSeq'].value;
    //       } else {
    //         assignInfo.roomtypeSeq = this.maxRoomTypeSeq + 1;
    //       }

    //       // 連泊状況から遷移の場合 部屋タイプが異なる場合はアサインしない
    //       if (this.roomType == assignInfo.orgRoomtypeCode) {
    //         assignInfo.roomNo = this.roomNo;
    //         assignInfo.roomStateClass = SystemConst.ROOMSTATUS_ASSIGN;
    //       }

    //       assignList.push(assignInfo);
    //     }

    //     if(routeSeqUpdFlag){
    //       routeSeq++;
    //     }
    //     routeSeqUpdFlag = false;
    //   }

    //   if(roomTypeSeqUpdFlag){
    //     this.maxRoomTypeSeq++;
    //   }
    //   roomTypeSeqUpdFlag = false;
    // });

    //RoomTypeSeqを先に採番する
    var useDateWk = "";
    this.roomTypeListAll.forEach(x => {
      var useDate = Common.ToFormatStringDate(x.controls['useDate'].value);

      if ((useDateWk != useDate)){
        this.maxRoomTypeSeq=0;
        useDateWk = useDate;
      }

      this.maxRoomTypeSeq += 1;
      x.controls.roomtypeSeq.value = this.maxRoomTypeSeq;
    });

    useDateWk = "";
    var rootseqNumberingList : AssignInfo[];
    rootseqNumberingList=[];

    this.roomTypeListAll.forEach(x => {
      if (x.controls.roomType.value != '') {
        var useDate = Common.ToFormatStringDate(x.controls.useDate.value);

        // 利用日が変わった場合
        if (useDateWk != useDate)  {
          // ルートSEQ採番用の変数を初期化
          rootseqNumberingList.forEach((value) => {
            value.updateFlag=false;
          });
        }

        // 希望部屋タイプ用の作成
        // 部屋タイプ
        var roomInfo = new RoomTypeInfo();
        roomInfo.useDate = useDate;
        roomInfo.roomType = x.controls['roomType'].value;
        roomInfo.rooms = x.controls['roomCount'].value;
        roomInfo.roomtypeSeq = x.controls.roomtypeSeq.value;
        roomTypeList.push(roomInfo);
        useDateWk = useDate;

        // 部屋数分
        for (var room = 0; room < x.controls['roomCount'].value; room++){
            // アサイン
            var assignInfo = new AssignInfo();
            assignInfo.useDate = useDate;
            assignInfo.roomtypeCode = x.controls['roomType'].value;
            assignInfo.orgRoomtypeCode = x.controls['roomType'].value;
            assignInfo.roomNo = '';
            assignInfo.roomStateClass = '';

            assignInfo.guestName = guestName;
            assignInfo.memberMale = male;
            assignInfo.memberFemale = female;
            assignInfo.memberChildA = childA;
            assignInfo.memberChildB = childB;
            assignInfo.memberChildC = childC;

            // rootseq
            // 到着日の場合
            if (useDate == arrivalDate) {
              assignInfo.routeSEQ = routeSeq;
              routeSeqUpdFlag=true;

              var rootseqNumberingWk = new AssignInfo();
              rootseqNumberingWk.useDate = useDate;
              rootseqNumberingWk.roomtypeSeq = roomInfo.roomtypeSeq;
              rootseqNumberingWk.routeSEQ = routeSeq;
              rootseqNumberingWk.updateFlag = true;
              rootseqNumberingList.push(rootseqNumberingWk);

            // 到着日以外の場合
            } else {
              let useDatewk: Date
              useDatewk = new Date(Common.ToFormatDate(useDate));
              let yesterday = Common.ToFormatStringDate(this.addDate(useDatewk, -1));

              let updateFlag=false;
              rootseqNumberingList.some(function(x){
                if (x.useDate == yesterday && x.roomtypeSeq == roomInfo.roomtypeSeq && x.updateFlag == false) {
                    assignInfo.routeSEQ = x.routeSEQ;
                    x.useDate = useDate;
                    x.updateFlag=true;
                    updateFlag=true;
                    return true;
                }
              });

              // 未使用なし
              if (!(updateFlag)){
                assignInfo.routeSEQ = routeSeq;
                routeSeqUpdFlag=true;

                var rootseqNumberingWk = new AssignInfo();
                rootseqNumberingWk.useDate = useDate;
                rootseqNumberingWk.roomtypeSeq = roomInfo.roomtypeSeq;
                rootseqNumberingWk.routeSEQ = routeSeq;
                rootseqNumberingWk.updateFlag = true;
                rootseqNumberingList.push(rootseqNumberingWk);
              }
            }
            assignInfo.roomtypeSeq = roomInfo.roomtypeSeq;

            // 連泊状況から遷移の場合 部屋タイプが異なる場合はアサインしない
            if (this.roomType == assignInfo.orgRoomtypeCode) {
              assignInfo.roomNo = this.roomNo;
              assignInfo.roomStateClass = SystemConst.ROOMSTATUS_ASSIGN;
            }

            assignList.push(assignInfo);

          if(routeSeqUpdFlag){
            routeSeq++;
            routeSeqUpdFlag = false;
          }
        }
      }
    });

    return [roomTypeList, assignList];
  }

  /** 更新用データ アサイン
   * @param  {StayInfo} orgList アサイン情報(変更前)
   * @param  {StayInfo} checkList アサイン情報(変更後)
   * @returns Array
   */
  private setSaveValue_Update_Assign(orgList : Array<AssignInfo>, checkList: Array<AssignInfo>, assignOverwriteFlag: boolean) : Array<AssignInfo>{

    // ・到着日変更 or 泊数－ ⇒ 不要な利用日のデータを削除

    // ・到着日変更 or 泊数＋ ⇒ 変更日の部屋番号のデータがない ⇒ 同じ部屋番号で つくる
    //                      ⇒ 変更日の部屋番号のデータがある ⇒ 同じ部屋タイプの部屋に空きがある  ⇒ アサイン
    //                                                                                       ⇒ 未アサイン

    // アサインなしの場合はDeleteInsertだがチェックはAPI側とする

    var result = new Array<AssignInfo>();
    var wkList = Array<AssignInfo>();

    checkList.forEach(upd => {

      var hasData = orgList.find(y => y.useDate == upd.useDate && y.orgRoomtypeCode == upd.orgRoomtypeCode && y.roomtypeSeq == Common.ToNumber(upd.roomtypeSeq) && y.routeSEQ == upd.routeSEQ);
      if (hasData == null){
        // 変更前になければ追加
        upd.addFlag = true;
        result.push(upd);
      }else{
        // それ以外はワークへ
        wkList.push(upd);
      }
    });

    orgList.forEach(x => {
      var wkInfo = wkList.find(y => y.useDate == x.useDate &&y.orgRoomtypeCode == x.orgRoomtypeCode
                                 && y.roomtypeSeq == x.roomtypeSeq && y.routeSEQ == x.routeSEQ);
      // copy
      var info = new AssignInfo();
      info.useDate = x.useDate;
      info.roomNo = x.roomNo;
      info.roomtypeCode = x.roomtypeCode;
      info.orgRoomtypeCode  = x.orgRoomtypeCode;
      info.routeSEQ = x.routeSEQ;
      info.roomtypeSeq = x.roomtypeSeq;
      info.roomStateClass  = x.roomStateClass;
      info.guestName  = x.guestName;
      info.memberMale = x.memberMale;
      info.memberFemale = x.memberFemale;
      info.memberChildA = x.memberChildA;
      info.memberChildB = x.memberChildB;
      info.memberChildC = x.memberChildC;

      if(wkInfo == null){
        // 削除
        info.deleteFlag = true;

      } else if (this.check_updateValue_Assign(info, wkInfo)){
        // 変更があれば更新
        info.useDate = wkInfo.useDate;
        if(Common.IsNullOrEmpty(wkInfo.roomNo)){
          info.roomtypeCode = wkInfo.roomtypeCode;
          info.orgRoomtypeCode = wkInfo.orgRoomtypeCode;
        }

        // 上書き確認チェックでOKの場合のみ上書きする
        if(assignOverwriteFlag){
          info.guestName = wkInfo.guestName;
          info.memberMale = wkInfo.memberMale;
          info.memberFemale = wkInfo.memberFemale;
          info.memberChildA = wkInfo.memberChildA;
          info.memberChildB = wkInfo.memberChildB;
          info.memberChildC = wkInfo.memberChildC;
        }

        // info.routeSeq / info.roomtypeSeq は 上書きしない
        info.updateFlag = true;
      }

      result.push(info);
    });

    return result;
  }

  /** 更新用データ 商品
   * @param  {Array<SalesDetailsInfo>} orgList
   * @returns Array
   */
  private setSaveValue_Update_Item(orgList : Array<SalesDetailsInfo>, checkList: any[]) : Array<SalesDetailsInfo>{

    var result = new Array<SalesDetailsInfo>();

    var wkCheckList = new Array<SalesDetailsInfo>();

    checkList.forEach(dailyList => {

      if(dailyList == null) return; // ← continue (forEach)

      for (var i = 0; i < dailyList.length; i++){

        var dailyInfo = dailyList[i];
        var info = new SalesDetailsInfo;

        if(Common.IsNullOrEmpty(dailyInfo.controls.item.value)) continue; // ← continue (for)

        info.detailsSeq = dailyInfo.controls.detailsSeq.value;
        info.itemDivision = dailyInfo.controls.itemDivision.value;
        info.mealDivision = '';
        info.useDate = dailyInfo.controls.useDate.value;
        info.itemCode = dailyInfo.controls.item.value;
        info.printName = dailyInfo.controls.printName.value;
        info.unitPrice = dailyInfo.controls.unitPrice.value;
        info.itemNumberM = Common.ToNumber(dailyInfo.controls.itemNumberM.value);
        info.itemNumberF = Common.ToNumber(dailyInfo.controls.itemNumberF.value);
        info.itemNumberC = Common.ToNumber(dailyInfo.controls.itemNumberC.value);
        info.amountPrice = Common.ToNumber(dailyInfo.controls.amountPrice.value);
        info.mealDivision = dailyInfo.controls.mealDivision.value;
        info.insideTaxPrice = Common.ToNumber(dailyInfo.controls.insideTaxPrice.value);
        info.insideServicePrice = Common.ToNumber(dailyInfo.controls.insideServicePrice.value);
        info.outsideServicePrice = Common.ToNumber(dailyInfo.controls.outsideServicePrice.value);
        info.taxDivision = dailyInfo.controls.taxDivision.value;
        info.serviceDivision = dailyInfo.controls.serviceDivision.value;
        info.setItemDivision = dailyInfo.controls.setItemDivision.value;
        info.setItemSeq =  Common.ToNumber(dailyInfo.controls.setItemSeq.value);
        info.taxRateDivision = dailyInfo.controls.taxRateDivision.value;
        info.taxRate = dailyInfo.controls.taxRate.value;
        info.billSeparateSeq = dailyInfo.controls.billSeparateSeq.value;
        info.adjustmentFlag = dailyInfo.controls.adjustmentFlag.value;
        info.billNo = ''; // 新規は空

        var hasData = orgList.find(org => org.detailsSeq ==  dailyInfo.controls.detailsSeq.value);
        if (hasData == null){
          // 変更前になければ追加
          info.addFlag = true;
          info.detailsSeq = this.maxItemDetailSeq + 1;
          this.maxItemDetailSeq++;
          result.push(info);

        }else{
          wkCheckList.push(info);
        }
      }
    });

    orgList.forEach(origInfo => {
      var info = new SalesDetailsInfo;
      info.detailsSeq = origInfo.detailsSeq;
      info.itemDivision = origInfo.itemDivision;
      info.mealDivision = '';
      info.useDate = origInfo.useDate;
      info.itemCode = origInfo.itemCode;
      info.printName = origInfo.printName;
      info.unitPrice = origInfo.unitPrice;
      info.itemNumberM = origInfo.itemNumberM;
      info.itemNumberF = origInfo.itemNumberF;
      info.itemNumberC = origInfo.itemNumberC;
      info.amountPrice = origInfo.amountPrice;
      info.mealDivision = origInfo.mealDivision;
      info.insideTaxPrice = origInfo.insideTaxPrice;
      info.insideServicePrice = origInfo. insideServicePrice;
      info.outsideServicePrice = origInfo.outsideServicePrice;
      info.taxDivision = origInfo.taxDivision;
      info.serviceDivision = origInfo.serviceDivision;
      info.setItemDivision = origInfo.setItemDivision;
      info.setItemSeq = origInfo.setItemSeq;
      info.taxRateDivision = origInfo.taxRateDivision;
      info.taxRate = origInfo.taxRate;
      info.billSeparateSeq = origInfo.billSeparateSeq;
      info.billNo = origInfo.billNo;
      info.cdt = origInfo.cdt;
      info.creator = origInfo.creator;
      info.version = origInfo.version;

      var wkInfo = wkCheckList.find(upd => upd.detailsSeq == origInfo.detailsSeq);
      if(wkInfo == null){
        // 削除
        info.deleteFlag = true;
      }else{

        // 変更チェック
        if(!this.check_updateValue_ItemInfo(origInfo, wkInfo)) return; // ← continue (forEach)

        // 変更があれば更新
        info.itemDivision = wkInfo.itemDivision;
        info.mealDivision = '';
        info.useDate = wkInfo.useDate;
        info.itemCode = wkInfo.itemCode;
        info.printName = wkInfo.printName;
        info.unitPrice = wkInfo.unitPrice;
        info.itemNumberM = wkInfo.itemNumberM;
        info.itemNumberF = wkInfo.itemNumberF;
        info.itemNumberC = wkInfo.itemNumberC;
        info.amountPrice = wkInfo.amountPrice;
        info.mealDivision = wkInfo.mealDivision;
        info.insideTaxPrice = wkInfo.insideTaxPrice;
        info.insideServicePrice = wkInfo. insideServicePrice;
        info.outsideServicePrice = wkInfo.outsideServicePrice;
        info.taxDivision = wkInfo.taxDivision;
        info.serviceDivision = wkInfo.serviceDivision;
        info.setItemDivision = wkInfo.setItemDivision;
        info.setItemSeq = wkInfo.setItemSeq;
        info.taxRateDivision = wkInfo.taxRateDivision;
        info.taxRate = wkInfo.taxRate;
        info.billSeparateSeq = wkInfo.billSeparateSeq;
        info.updateFlag = true;
      }
      result.push(info);
    });

    return result;
  }

  /** 更新用データ 入金情報
   * @param  {Array<DepositInfo>} orgList 入金情報(変更前)
   * @param  {number} stayDays 泊数(変更後)
   * @param  {string} arrivalDate 到着日(変更後)
   * @returns Array
   */
  private setSaveValue_Update_Deposit(orgList : Array<DepositInfo>) : Array<DepositInfo>{

    var result = new Array<DepositInfo>();

    var wkList = Array<DepositInfo>();
    this.depositSource.data.forEach(upd => {

      if (Common.IsNullOrEmpty(upd.controls.denominationCode.value)) return; // ← continue (forEach)

      var info = new DepositInfo();
      info.depositDate = this.ToFormatDate(upd.controls.depositDate.value);
      info.denominationCode = upd.controls.denominationCode.value;
      info.printName = upd.controls.printName.value;
      info.price = Common.ToNumber(upd.controls.price.value);
      info.billingRemarks = upd.controls.billingRemarks.value;
      info.billSeparateSeq = upd.controls.billSeparateSeq.value;
      info.detailsSeq = upd.controls.detailsSeq.value;
      info.billNo = ''; // 新規は空
      info.version = 0;

      var hasData = orgList.find(org => org.detailsSeq == upd.controls.detailsSeq.value && org.billSeparateSeq == upd.controls.billSeparateSeq.value);
      if (hasData == null){
        // 変更前になければ追加
        info.addFlag = true;
        info.detailsSeq = this.maxDepositSeq + 1;
        this.maxDepositSeq++;
        result.push(info);
      }else{
        // それ以外はワークへ
        wkList.push(info);
      }
    });

    orgList.forEach(org => {

      var info = new DepositInfo();
      info.detailsSeq = org.detailsSeq;
      info.depositDate = org.depositDate;
      info.denominationCode = org.denominationCode;
      info.printName = org.printName;
      info.price = org.price;
      info.billingRemarks = org.billingRemarks;
      info.billSeparateSeq = org.billSeparateSeq;
      info.billNo = org.billNo;
      info.cdt = org.cdt;
      info.creator = org.creator;
      info.udt = org.udt;
      info.updator = org.updator;
      info.status = org.status;
      info.version = org.version;

      var wkInfo = wkList.find(upd => upd.detailsSeq == org.detailsSeq && upd.billSeparateSeq == org.billSeparateSeq);
      if(wkInfo == null){
        // 削除
        info.deleteFlag = true;

      } else {

        if (!this.check_updateValue_Deposit(info, wkInfo)) return; // ← continue (forEach)

        // 変更があれば更新
        info.depositDate = wkInfo.depositDate;
        info.denominationCode = wkInfo.denominationCode;
        info.printName = wkInfo.printName;
        info.price = wkInfo.price;
        info.billingRemarks = wkInfo.billingRemarks;
        info.billSeparateSeq = wkInfo.billSeparateSeq;
        info.udt = wkInfo.udt;
        info.updateFlag = true;

      }

      result.push(info);
    });

    return result;
  }

  /** 更新用データ 備考
   * @param  {Array<RemarksInfo>} orgList 入金情報(変更前)
   * @param  {number} stayDays 泊数(変更後)
   * @param  {string} arrivalDate 到着日(変更後)
   * @returns Array
   */
  private setSaveValue_Update_Remarks(orgList : Array<RemarksInfo>) : Array<RemarksInfo>{

    var result = new Array<RemarksInfo>();

    var wkList = Array<RemarksInfo>();
    this.remarksSource.data.forEach(upd => {

      if (Common.IsNullOrEmpty(upd.controls.remarks.value)) return; // ← continue (forEach)

      var info = new RemarksInfo();
      info.noteSeq = upd.controls.noteSeq.value;
      info.remarks = upd.controls.remarks.value;
      info.version = 0;

      var hasData = orgList.find(org => org.noteSeq == upd.controls.noteSeq.value );
      if (hasData == null){
        // 変更前になければ追加
        info.addFlag = true;
        info.noteSeq = this.maxRemarksSeq + 1;
        this.maxRemarksSeq++;
        result.push(info);
      }else{
        // それ以外はワークへ
        wkList.push(info);
      }
    });

    orgList.forEach(org => {

      var info = new RemarksInfo();
      info.noteSeq = org.noteSeq;
      info.remarks = org.remarks;
      info.cdt = org.cdt;
      info.creator = org.creator;
      info.udt = org.udt;
      info.updator = org.updator;
      info.status = org.status;
      info.version = org.version;

      var wkInfo = wkList.find(upd => upd.noteSeq == org.noteSeq);
      if(wkInfo == null){
        // 削除
        info.deleteFlag = true;

      } else {

        if (!this.check_updateValue_Remarks(info, wkInfo)) return; // ← continue (forEach)

        // 変更があれば更新
        info.remarks = wkInfo.remarks;
        info.udt = wkInfo.udt;
        info.updateFlag = true;
      }

      result.push(info);
    });

    return result;
  }

  //#region  ---- 変更チェック --------------------------------------------------
  /** 変更チェック 部屋タイプ
   * @param  {RoomTypeInfo} orgInfo 変更前
   * @param  {RoomTypeInfo} checkInfo 変更後
   * @returns true: 変更あり, false:変更なし
   */
  private check_updateValue_RoomType(orgInfo: RoomTypeInfo, checkInfo: RoomTypeInfo) : boolean{
    return (orgInfo.useDate != checkInfo.useDate
            || orgInfo.roomType != checkInfo.roomType
            || orgInfo.rooms != checkInfo.rooms);
  }

  /** 変更チェック アサイン
   * @param  {AssignInfo} orgInfo 変更前
   * @param  {AssignInfo} checkInfo 変更後
   * @returns true: 変更あり, false:変更なし
   */
  private check_updateValue_Assign(orgInfo: AssignInfo, checkInfo: AssignInfo) : boolean{
    return (orgInfo.useDate != checkInfo.useDate
            || orgInfo.roomtypeCode != checkInfo.roomtypeCode
            || orgInfo.orgRoomtypeCode != checkInfo.orgRoomtypeCode
            || orgInfo.guestName != checkInfo.guestName
            || orgInfo.memberMale != checkInfo.memberMale
            || orgInfo.memberFemale != checkInfo.memberFemale
            || orgInfo.memberChildA != checkInfo.memberChildA
            || orgInfo.memberChildB != checkInfo.memberChildB
            || orgInfo.memberChildC != checkInfo.memberChildC);
  }


  /** 変更チェック 商品
   * @param  {SalesDetailsInfo} orgInfo 変更前
   * @param  {SalesDetailsInfo} checkInfo 変更後
   * @returns true: 変更あり, false:変更なし
   */
  private check_updateValue_ItemInfo(orgInfo: SalesDetailsInfo, checkInfo: any) : boolean{
    return (orgInfo.useDate != checkInfo.useDate
            || orgInfo.itemCode != checkInfo.itemCode
            || orgInfo.printName != checkInfo.printName
            || orgInfo.unitPrice != checkInfo.unitPrice
            || orgInfo.itemNumberM != checkInfo.itemNumberM
            || orgInfo.itemNumberF != checkInfo.itemNumberF
            || orgInfo.itemNumberC != checkInfo.itemNumberC
            || orgInfo.amountPrice != checkInfo.amountPrice
            || orgInfo.insideTaxPrice != checkInfo.insideTaxPrice
            || orgInfo.insideServicePrice != checkInfo. insideServicePrice
            || orgInfo.outsideServicePrice != checkInfo.outsideServicePrice
            // || orgInfo.dinner != checkInfo.dinner
            // || orgInfo.breakfast != checkInfo.breakfast
            // || orgInfo.lunch != checkInfo.lunch
            || orgInfo.taxDivision != checkInfo.taxDivision
            || orgInfo.serviceDivision != checkInfo.serviceDivision
            || orgInfo.taxRateDivision != checkInfo.taxRateDivision
            || orgInfo.taxRate != checkInfo.taxRate
            || orgInfo.billSeparateSeq != checkInfo.billSeparateSeq);
  }

  /** 変更チェック 入金情報
   * @param  {DepositInfo} orgInfo 変更前
   * @param  {DepositInfo} checkInfo 変更後
   * @returns true: 変更あり, false:変更なし
   */
  private check_updateValue_Deposit(orgInfo: DepositInfo, checkInfo: DepositInfo) : boolean{
    return (orgInfo.depositDate != checkInfo.depositDate
            || orgInfo.denominationCode != checkInfo.denominationCode
            || orgInfo.printName != checkInfo.printName
            || orgInfo.price != checkInfo.price
            || orgInfo.billingRemarks != checkInfo.billingRemarks
            || orgInfo.billSeparateSeq != checkInfo.billSeparateSeq);
  }

  /** 変更チェック 備考情報
   * @param  {RemarksInfo} orgInfo 変更前
   * @param  {RemarksInfo} checkInfo 変更後
   * @returns true: 変更あり, false:変更なし
   */
  private check_updateValue_Remarks(orgInfo: RemarksInfo, checkInfo: RemarksInfo) : boolean{
    return (orgInfo.remarks != checkInfo.remarks);
  }
  //#endregion  ---- 変更チェック --------------------------------------------------

//#endregion  ---- 更新処理 関連 --------------------------------------------------

//#region ----- 精算チェック --------------------------------------------------
  /**
   * @param  {string} billSeparateSeq ビル分割番号
   * @param  {string} target 精算対象
   * @returns boolean true:正常終了, false:異常終了
   */
  private checkBalance(billSeparateSeq) : boolean {

    let billSeq = Common.ToNumber(billSeparateSeq);
    let count : number = 0;
    let sales : Array<number> = new Array(this.maxBillNo + 1);
    let deposit : Array<number> = new Array(this.maxBillNo + 1);

    // 初期値セット
    sales.fill(0);
    deposit.fill(0);

    // 売上と件数を集計
    this.itemList.forEach(dailyList => {
      for(let i = 0; i < dailyList.length; i++){
        let dailyInfo = dailyList[i].value;

        if (Common.IsNullOrEmpty(dailyInfo.billSeparateSeq) || dailyInfo.adjustmentFlag == SystemConst.ADJUSTMENTED) continue;

        if( billSeq == 0 || dailyInfo.billSeparateSeq == billSeq){

          let wkSales = Common.ToNumber(dailyInfo.amountPrice)
                      + Common.ToNumber(dailyInfo.outsideServicePrice)
                      + Common.ToNumber(dailyInfo.outsideServiceTaxPrice);

          sales[0] += wkSales;  // 全体
          sales[dailyInfo.billSeparateSeq] += wkSales;

          if(wkSales != 0) count++;
        }
      }
    });

    // 登録済みの情報から入金と件数を集計
    this.depositSource.data.forEach(x => {
      let depositInfo = x.value;

      if (Common.IsNullOrEmpty(depositInfo.billSeparateSeq) || depositInfo.adjustmentFlag == SystemConst.ADJUSTMENTED) return; // continue(forEach)

      if( billSeq == 0 || depositInfo.billSeparateSeq == billSeq){

        let wkDeposit = Common.ToNumber(depositInfo.price);

        deposit[0] += wkDeposit;   // 全体
        deposit[depositInfo.billSeparateSeq] += wkDeposit;

        if(wkDeposit != 0) count++;
      }
    });

    // 明細がなければ精算不可
    if (count == 0){
      Common.modalMessageWarning(Message.TITLE_WARNING, '精算対象の明細がありません。', MessagePrefix.WARNING+ FunctionId.RESERVE + '001');
      return false;
    }

    for (let seq = 1; seq <= this.maxBillNo; seq++){
      let balance = sales[seq] - deposit[seq];
      if(balance != 0) {
        Common.modalMessageWarning(Message.TITLE_WARNING, `精算対象の残高が0になるように${this.returnCode}調整してください。`, MessagePrefix.WARNING+ FunctionId.RESERVE + '002');
        return false;
      }
    }

    return true;
  }

  /** 精算済かどうかチェック
   * @param  {string} billSeparateSeq ビル分割番号
   * @returns boolean true: 精算済、 false: 未精算
   */
  public CheckAdjustmented(billSeparateSeq : string, msgFlag : boolean): boolean{

    if (this.adjustmentedBillNoCheckList.length === 0){
      if(msgFlag){
        Common.modalMessageWarning(Message.TITLE_WARNING, '精算済のビルはありません。', MessagePrefix.WARNING+ FunctionId.RESERVE + '003');
      }
      return false;
    }

    if (billSeparateSeq.length > 0 && this.adjustmentedBillNoCheckList != null) {
      var seq = Common.ToNumber(billSeparateSeq);
      var result = this.adjustmentedBillNoCheckList.indexOf(seq);
      if (result < 0){
        if(msgFlag){
          Common.modalMessageWarning(Message.TITLE_WARNING, `ビル分割番号:${billSeparateSeq}は未精算です。`, MessagePrefix.WARNING+ FunctionId.RESERVE + '004');
        }
        return false;
      }
    };

    return true;
  }
//#endregion ----- 精算チェック --------------------------------------------------

//#region ----- FormGroup セット --------------------------------------------------

  /** FormGroup 初期値セット */
  private setInitFormInfo(infoType: InfoType, isExtended : boolean = false){
    var result : FormGroup;
    switch(infoType){
      case InfoType.Stay:
        result = this.setStayInfoForm('', ''	, '1', '', '', '0', '0', '0', '0', '0');
        break;
      case InfoType.Guest:
        result = this.setGuestInfoForm('', '', '', '', '', '', '', '', '');
        break;
      case InfoType.Agent:
        result = this.setAgentInfoForm('', '');
        break;
      case InfoType.RoomType:
//        result = this.setRoomTypeInfoForm(this.stayInfoForm.value.arrivalDate,'', 1, ReserveCommon.SeqPrefix + this.roomtypeSeq);
        var idx : number = 0;
        if(!isExtended && this.roomTypeList != undefined){
          idx = this.roomTypeList.length;
        }
        result = this.setRoomTypeInfoForm('','', 1, ReserveCommon.SeqPrefix + this.roomtypeSeq, null, 0, '', '', 0, idx);
        this.roomtypeSeq++;
        break;
      case InfoType.Deposit:
        result = this.setDepositInfoForm('', '', '', 0, '', '', '', ReserveCommon.SeqPrefix + this.depositSEQ);
        this.depositSEQ++;
        break;
      case InfoType.Remarks:
        result = this.setRemarksInfoForm('', ReserveCommon.SeqPrefix + this.remarksSEQ);
        this.remarksSEQ++;
        break;
    }
    return result;
  }

  /** FormGroup 宿泊情報セット */
  private setStayInfoForm(arrivalDate:string,departureDate: string ,stayDays: string ,
                    memberTotal: string , memberMale: string ,memberFemale: string ,
                    memberChildA: string ,memberChildB: string,memberChildC: string,
    reserveDate: string){
      return this.fb.group({
      arrivalDate: new FormControl(arrivalDate, [Validators.required])
      , departureDate: new FormControl(departureDate, [Validators.required])
      , stayDays: new FormControl(stayDays, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxNight)])
      , memberMale: new FormControl(memberMale, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberFemale: new FormControl(memberFemale, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildA: new FormControl(memberChildA, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildB: new FormControl(memberChildB, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberChildC: new FormControl(memberChildC, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMember)])
      , memberTotal: new FormControl({memberTotal, disabled: true}, [Validators.required, Validators.pattern(this.numberFormatPattern), Validators.min(this.minZero), Validators.max(this.maxMemberTotal)])
      , reserveDate: new FormControl(reserveDate, [Validators.required])
      , creator: new FormControl('')
      , cdt: new FormControl('')
      , version: new FormControl(0)
    },{
      validator:
      [
        ReserveCommon.CustomValidator.dateFromTo
      ]
    });
  }

  /** FormGroup 部屋タイプセット */
  private setRoomTypeInfoForm(useDate: string, roomType:string, roomCount: number, roomtypeSeq:string
                              , routeSeqList : string[] = null, assignCount : number = 0
                              , creator:string = '', cdt:string = '', version:number = 0, index:number = 0){
    var assigned = this.checkDisable_State_Assign();
    var disabled = this.disabledFlag == null ? false : this.disabledFlag;
    return this.fb.group({
      useDate: new FormControl(useDate)
      , roomType: new FormControl({value: roomType, disabled: assigned || disabled}, [Validators.required])
      , roomCount: new FormControl(roomCount, [Validators.required, Validators.min(this.minRoomCount), Validators.max(this.maxRoomCount) ])
      , roomtypeSeq: new FormControl(roomtypeSeq)
      , routeSeqList: new FormControl(routeSeqList)
      , assignCount: new FormControl(assignCount)
      , creator: new FormControl(creator)
      , cdt: new FormControl(cdt)
      , version: new FormControl(version)
      , index: new FormControl(index)
    },{
      validator:[
        ReserveCommon.CustomValidator.assignCount
      ]
    });  }

  /** FormGroup エージェントセット */
  private setAgentInfoForm(agentCode:string, agentRemarks: string){
    var disabled = this.disabledFlag == null ? false : this.disabledFlag;
    return this.fb.group({
      agentCode: new FormControl( {value:agentCode, disabled: disabled})
      , agentRemarks: new FormControl(agentRemarks,[Validators.maxLength(this.maxLengthText)])
    });
  }

  /** FormGroup 利用者情報セット */
  private setGuestInfoForm(guestName:string,guestNameKana: string ,phone: string ,cellphone: string
                          , companyName: string ,zipCode: string ,address: string ,email: string, customerNo: string){
    return this.fb.group({
      guestName: new FormControl(guestName,[Validators.required, Validators.maxLength(this.maxLengthName)])
      , guestNameKana: new FormControl(guestNameKana,[Validators.required, Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLengthName)])
      , phone: new FormControl(phone,[Validators.required, Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)])
      , cellphone: new FormControl(cellphone,[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)])
      , companyName: new FormControl(companyName,[Validators.maxLength(this.maxLengthName)])
      , zipCode: new FormControl(zipCode,[Validators.pattern(this.zipFormatPattern)])
      , address: new FormControl(address,[Validators.maxLength(this.maxLengthText)])
      , email: new FormControl(email,[Validators.pattern(this.emailFormatPattern), Validators.maxLength(this.maxLengthEmail)])
      , customerNo: new FormControl(customerNo,[Validators.minLength(this.maxLengthCustomerNo), Validators.maxLength(this.maxLengthCustomerNo)])
      , creator: new FormControl('')
      , cdt: new FormControl('')
      , version: new FormControl(0)
   });
  }

  /** FormGroup 備考情報 セット */
  private setRemarksInfoForm(remarks:string, noteSeq:string
                              , creator:string = '', cdt:string = '', version:number = 0){
    return this.fb.group({
      remarks: new FormControl(remarks, [Validators.maxLength(this.maxLengthText)])
      , noteSeq: new FormControl(noteSeq)
      , creator: new FormControl(creator)
      , cdt: new FormControl(cdt)
      , version: new FormControl(version)
    });
  }

  /** FormGroup 入金情報情報セット */
  private setDepositInfoForm(depositDate:string, denominationCode:string, printName:string
                        , price:number, billingRemarks:string, billSeparateSeq: string, adjustmentFlag: string
                        , detailsSeq:string, creator:string = '', cdt:string = '', version:number = 0){

    var adjustFlag = !this.CheckBillSeq(billSeparateSeq);
    var billSeq = Common.IsNullOrEmpty(billSeparateSeq) ? this.SetBillSeq() : billSeparateSeq;
    var disabled = this.disabledFlag == null ? false : this.disabledFlag;
    return this.fb.group({
      depositDate: new FormControl( {value:depositDate, disabled: adjustFlag})
      , denominationCode: new FormControl( {value:denominationCode, disabled: adjustFlag || disabled })
      , printName: new FormControl( {value:printName, disabled: adjustFlag}, [Validators.maxLength(this.maxLengthPrintName)])
      , price: new FormControl( {value:price, disabled: adjustFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minAmount), Validators.max(this.maxAmount)])
      , billingRemarks: new FormControl( {value:billingRemarks, disabled: adjustFlag}, [Validators.maxLength(this.maxLengthText)])
      , billSeparateSeq: new FormControl( {value:billSeq, disabled: adjustFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minBillNo), Validators.max(this.maxBillNo)])
      , adjustmentFlag: new FormControl( {value: adjustmentFlag, disabled:adjustFlag})  // 表示制御用
      , detailsSeq: new FormControl( {value:detailsSeq, disabled: adjustFlag})

      , balanceButton: new FormControl('') // ボタン配置用

      , billSeparateSeqError: new FormControl('') // エラーセット用

      , creator: new FormControl(creator)
      , cdt: new FormControl(cdt)
      , version: new FormControl(version)
    },{
      validator:[
        ReserveCommon.CustomValidator.denominationCodeRequired
        , ReserveCommon.CustomValidator.depositDateRequired
        , ReserveCommon.CustomValidator.depositBillNoRequired
        , ReserveCommon.CustomValidator.billNoAdjustmented
      ]
    });
  }
  //#endregion ----- FormGroup セット --------------------------------------------------

  /** Success系メッセージはSnackBarで出す (予約取消以外) */
  public showSnackBar(msg: string) {
    this.snackBar.open(msg, '×', {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 2 * 1000, /* 2sec表示 */
    });
  }

  /** 利用日の変更 **/
  public getChangeUseDate(datediff: number) {

    // 表示対象のデータが無い場合は、Exit
    // if (this.roomTypeList == null) {
    //   return;
    // }

    let useDate : string
    useDate = Common.ToFormatDate(Common.ToFormatStringDate(this.roomTypeInfoForm.controls.useDate.value));
    if (useDate == null ) {
      return;
    }

    // 一泊目の場合、入力チェック
    // if (useDate == moment(this.stayInfoForm.value.arrivalDate).format(SystemConst.DATE_FORMAT_YYYYMMDD)) {
    //   if (this.roomTypeList.length == 0) {
    //     Common.modalMessageError(Message.TITLE_ERROR, "到着日の部屋タイプを指定してください")
    //     return;
    //   }
    // }

    // 画面の状態を保存する
    this.saveRoomTypeInfo(useDate);

    // 表示対象の日を求める
    let useDatewk: Date
    useDatewk = new Date(Common.ToFormatDate(useDate));
    useDatewk = this.addDate(useDatewk, datediff);
    let targetDate : string = Common.ToFormatStringDate(useDatewk);

    // 到着日～出発日の範囲外の場合はExit
    if ((Common.ToFormatStringDate(this.stayInfoForm.controls.arrivalDate.value) <= targetDate) && (targetDate < Common.ToFormatStringDate(this.stayInfoForm.controls.departureDate.value)) ) {
    } else {
      return;
    }

    // 対象データを表示(部屋タイプ)
    this.initRoomTypeInfo(Common.ToFormatDate(targetDate));
  }

  // 日付の加算、減算処理
  private addDate(date: Date, days: number): Date{
    let resDate = new Date(date);
    resDate.setDate(resDate.getDate() + days);
    return resDate;
  }

  // 部屋タイプの保存
  saveRoomTypeInfo(useDate: string) {

    // 利用日がセットされていない場合(初回登録時)→保存しない
    if (useDate == "") {
      return;
    }

    var wkList = [];

    // 対象日のデータ以外を保存
    this.roomTypeListAll.forEach((roomType) => {
      if (roomType.controls.useDate.value != useDate) {
        wkList.push(roomType);
      }
    });

    // 対象日のデータを保存
    this.roomTypeSource.data.forEach((roomType) => {
      roomType.controls.useDate.value = useDate;
      wkList.push(roomType);
    });

    // データを保存
    this.roomTypeListAll=[];
    wkList.forEach((roomtype)  => {
      this.roomTypeListAll.push(roomtype)
    });

    // データ並び替え
    this.roomTypeListAll.sort(function(a,b){
      if(a.controls.useDate.value < b.controls.useDate.value) return -1;
      if(a.controls.useDate.value > b.controls.useDate.value) return 1;
      return 0;
    });
  }

  // 到着日の変更に伴う部屋タイプ情報の変更
  changeRoomTypefromArrivalDate() {

    // 画面の状態を保存する
    this.saveRoomTypeInfo(Common.ToFormatDate(Common.ToFormatStringDate(this.roomTypeInfoForm.controls.useDate.value)));

    // 部屋タイプの情報が無い場合は、Exit
    if (this.roomTypeListAll.length == 0 ) {
      return;
    }

    this.roomTypeList = [];
    this.roomTypeSource.data = [];

    let counter = 0;
    let diffDays = 0;

    this.roomTypeListAll.forEach((roomType) => {
      // 先頭の部屋タイプをもとに、日付をずらす日数を求める
      if (counter == 0 ) {
        let targetDate1 = roomType.controls.useDate.value;
        let targetDate2 = Common.ToFormatDate(Common.ToFormatStringDate(this.stayInfoForm.controls.arrivalDate.value));

        // 到着日を前に変更していた場合は、マイナス日数ずらす
        diffDays = Common.getDateDiff(targetDate1, targetDate2);
        if (targetDate1 > targetDate2 ) {
          diffDays= diffDays * (-1);
        }
      }

      let useDatewk: Date
      useDatewk = new Date(Common.ToFormatDate(roomType.controls.useDate.value));
      roomType.controls.useDate.value = Common.ToFormatDate(Common.ToFormatStringDate(this.addDate(useDatewk, diffDays)));

      if (roomType.controls.useDate.value == Common.ToFormatDate(Common.ToFormatStringDate(this.stayInfoForm.controls.arrivalDate.value))) {
        this.roomTypeInfoForm = this.setRoomTypeInfoForm(
          roomType.controls.useDate.value
          , roomType.controls.roomType.value
          , roomType.controls.roomCount.value
          , roomType.controls.roomtypeSeq.value.toString()
          , roomType.controls.routeSeqList.value
          , roomType.controls.assignCount.value
          , roomType.controls.creator.value
          , roomType.controls.cdt.value
          , roomType.controls.version.value
          , roomType.controls.index.value
        );

        this.roomTypeList.push(this.roomTypeInfoForm);
      }

      counter +=1;
    });

    if(this.roomTypeList.length==0){
      this.roomTypeList.push(this.roomTypeInfoForm);
    }
    this.roomTypeSource.data = this.roomTypeList;

  }

  // 泊数もしくは出発日の変更に伴う部屋タイプ情報の変更
  changeRoomTypefromDepartureDate() {

    // 画面の状態を保存する
    this.saveRoomTypeInfo(Common.ToFormatDate(Common.ToFormatStringDate(this.roomTypeInfoForm.controls.useDate.value)));

    // 部屋タイプの情報が無い場合は、Exit
    if (this.roomTypeListAll.length == 0 ) {
      return;
    }

    let roomTypeListTarget = [];

    // 出発日前日を求める
    let theDayBeforeDeparture: Date
    theDayBeforeDeparture = new Date(this.stayInfoForm.controls.departureDate.value);
    theDayBeforeDeparture = this.addDate(theDayBeforeDeparture, -1);

    // 泊数の延長、短縮を判断する
    let useDatewk = "";
    this.roomTypeListAll.forEach((roomType) => {
      if (useDatewk == "") {
        useDatewk = roomType.controls.useDate.value
      }

      if (roomType.controls.useDate.value > useDatewk) {
        useDatewk = roomType.controls.useDate.value
      }
    });

    // let diffDays = Common.getDateDiff(Common.ToFormatStringDate(theDayBeforeDeparture), useDatewk);

    var wkList = [];

    // 泊数短縮の場合
    if (theDayBeforeDeparture < new Date(useDatewk)) {
      // 期間内の情報を編集
      this.roomTypeListAll.forEach((roomType) => {
        if (roomType.controls.useDate.value <= Common.ToFormatDate(Common.ToFormatStringDate(theDayBeforeDeparture))) {
          wkList.push(roomType);
        }
      });

      this.roomTypeListAll=[];
      wkList.forEach((wk) => {
        this.roomTypeListAll.push(wk);
      });

    // 泊数延長の場合
    } else {
      // 出発日に最も近い利用日の情報を編集する
      this.roomTypeListAll.forEach((roomType) => {
        if (roomType.controls.useDate.value == useDatewk) {
          wkList.push(roomType);
        }
      });

      // 出発日に最も近い利用日+1日から変更後の出発日-1迄の期間で情報を展開する
      let startDate = Common.ToFormatDate(Common.ToFormatStringDate(this.addDate(new Date(useDatewk),1)));
      let endDate = Common.ToFormatDate(Common.ToFormatStringDate(this.stayInfoForm.controls.departureDate.value));
      let wkDate :string;

      wkDate = startDate;
      while (Common.getDateDiff(wkDate, endDate) > 0) {
        wkList.forEach((wk) => {
          var roomTypeInfoFormWk = this.setInitFormInfo(InfoType.RoomType, true);
          roomTypeInfoFormWk.patchValue ({
            useDate: wkDate
            , roomType:  wk.controls.roomType.value
            , roomCount: wk.controls.roomCount.value
            , roomtypeSeq: wk.controls.roomtypeSeq.value.toString()
            , routeSeqList: wk.controls.routeSeqList.value
            , assignCount: 0
            , creator: wk.controls.creator.value
            , cdt: wk.controls.cdt.value
            , version: wk.controls.version.value
          });

          this.roomTypeListAll.push(roomTypeInfoFormWk);
        });

        wkDate = Common.ToFormatDate(Common.ToFormatStringDate(this.addDate(new Date(wkDate),1)));
      }
    }

    // 到着日の情報を展開する
    this.roomTypeList = [];
    this.roomTypeSource.data = [];

    this.roomTypeListAll.forEach((roomType) => {
      if (roomType.controls.useDate.value == Common.ToFormatDate(Common.ToFormatStringDate(this.stayInfoForm.controls.arrivalDate.value))) {
        this.roomTypeInfoForm = this.setRoomTypeInfoForm(
          roomType.controls.useDate.value
          , roomType.controls.roomType.value
          , roomType.controls.roomCount.value
          , roomType.controls.roomtypeSeq.value.toString()
          , roomType.controls.roomtypeSeq.value
          , roomType.controls.assignCount.value
          , roomType.controls.creator.value
          , roomType.controls.cdt.value
          , roomType.controls.version.value
          , roomType.controls.index.value
        );

        this.roomTypeList.push(this.roomTypeInfoForm);
      }
    });

    if(this.roomTypeList.length==0){
      this.roomTypeList.push(this.roomTypeInfoForm);
    }
    this.roomTypeSource.data = this.roomTypeList;
  }
}

