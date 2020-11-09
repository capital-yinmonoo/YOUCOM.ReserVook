import { Component, OnInit, DoCheck, Input
        , ViewChildren, QueryList, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { ReserveService } from '../../services/reserve.service';
import { User } from '../../../../core/auth/auth.model';
import { Common } from '../../../../core/common';
import { SystemConst, Message, ItemDivision, MessagePrefix, FunctionId } from '../../../../core/system.const';
import { SalesDetailsCommon } from './salesdetails.common';
import { Base } from '../../../../shared/model/baseinfo.model';
import { MasterInfo } from '../../model/master.model';
import { ItemInfo, TaxServiceDivision, SetItemInfo } from '../../../item/model/item';
import { TaxRateInfo } from '../../../master/taxrate/model/taxrateinfo.model';
import { ItemsComponent } from './items/items.component';
import { SalesDetailsInfo } from '../../model/reserve.model';
import moment, { Moment } from 'moment';
import { CodeNameInfo } from 'src/app/features/master/codename/model/codename.model';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'sales-details',
  templateUrl: './salesdetails.component.html',
  styleUrls: ['../reserve.component.scss', './salesdetails.component.scss']
})

export class SalesDetailsComponent implements OnInit, DoCheck, AfterViewInit, AfterViewChecked {

  // 親からもらうパラメータ
  @Input() StayDays: Array<number>; // 泊数リスト
  @Input() ArrivalDate: Moment;     // 到着日
  @Input() SalesDetails: Array<SalesDetailsInfo>;    // 宿泊商品
  @Input() DisabledFlag : Boolean; // 無効化フラグ
  @Input() MaxSetItemSeq: number;

  // ViewのComponentを取得
  @ViewChildren(ItemsComponent) itemForm :QueryList<ItemsComponent>;

  // Viewの値を格納する配列
  itemList = [];

  private _currentUser : User;      // ログインユーザー
  public MasterInfo : MasterInfo;   // マスタ類

  loadFlag : Boolean = false; // 最初の1回だけデータ読込

  constructor(private reserveService: ReserveService
              , private authService:AuthService
              // , private cd: ChangeDetectorRef
              ) {

    this._currentUser = this.authService.getLoginUser();
  }

  /** 初期化 */
  ngOnInit(): void {
    this.loadFlag = false;
    this.getInitMasterInfo();
  }

  ngDoCheck(){
    if(this.MasterInfo.M_ServiceRate != null && this.loadFlag === false){
      // 共通モジュール に渡す
      SalesDetailsCommon.setMaster(this.MasterInfo);
      this.loadFlag = true;
      return;
    }
  }
  ngOnDestroy(): void {
    this.itemForm = null;
  }

//#region ----- 他に渡す用のデータ作成/セット --------------------------------------------------

  /** 泊数と到着日から利用日を算出
   * @param  {number} days n泊目
   * @returns Moment 利用日
   */
  public setUseDate(days : number) : Moment{
    var useDate = moment(this.ArrivalDate).add(days - 1, 'days');
    return useDate;
  }

  /** 利用日の売上明細を抽出
   * @param  {number} days
   * @returns Array
   */
  public setSalesDetails(days : number) : Array<SalesDetailsInfo>{

    if (this.SalesDetails == null || this.MasterInfo.M_MealDivision == null) return null

    var mealDivision_today = this.MasterInfo.M_MealDivision.filter(x => x.codeValue == SystemConst.MEAL_DIVISION_TODAY).map(y => y.code);
    var mealDivision_nextDay = this.MasterInfo.M_MealDivision.filter(x => x.codeValue == SystemConst.MEAL_DIVISION_NEXTDAY).map(y => y.code);

    var useDate = this.setUseDate(days).format(SystemConst.DATE_FORMAT_YYYYMMDD);
    var nextDay = moment(useDate).add(1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);

    // 当日計上分と翌日計上分
    var list = this.SalesDetails.filter(x => (x.useDate == useDate && mealDivision_today.indexOf(x.mealDivision) >= 0)
                                           || (x.useDate == nextDay && mealDivision_nextDay.indexOf(x.mealDivision) >= 0));

    return list;
  }

//#endregion ----- この画面の処理 --------------------------------------------------

//#region ----- 売上明細の合計 --------------------------------------------------

// 商品情報 合計部分表示用変数
  public salesSubTotal = 0;
  public salesTotal = 0;
  public insideTax = 0;
  public outsideService = 0;

  // ビル分割Noごと
  public salesTotalsByBill : Array<number>;

  /** 商品情報 合計表示 */
  private calcSalesTotal() {

    // クリア
    this.salesSubTotal = 0;
    this.salesTotal = 0;
    this.insideTax = 0;
    this.outsideService = 0;

    // ビル分割番号の最大値をセット
    let maxBillSepNo = 0;
    this.itemList.forEach((dailyList) => {
      for (let i = 0; i < dailyList.length; i++){
        let wkNo = Common.ToNumber(dailyList[i].controls['billSeparateSeq'].value);
        if (wkNo > maxBillSepNo) maxBillSepNo = wkNo;
      }
    });

    this.salesTotalsByBill = new Array<number>(maxBillSepNo + 1).fill(0);

    // 商品の合計を計算
    this.itemList.forEach((dailyList) => {
      for (let i = 0; i < dailyList.length; i++){

        if (dailyList[i].controls['itemDivision'].value == ItemDivision.SetItem.toString()) continue;

        this.salesSubTotal += Common.ToNumber(dailyList[i].controls['amountPrice'].value);
        this.insideTax += Common.ToNumber(dailyList[i].controls['insideTaxPrice'].value);
        this.outsideService += Common.ToNumber(dailyList[i].controls['outsideServicePrice'].value);

        // ビル分割番号毎に集計
        let billSepNo = dailyList[i].controls['billSeparateSeq'].value;
        this.salesTotalsByBill[billSepNo] += Common.ToNumber(dailyList[i].controls['amountPrice'].value);
        this.salesTotalsByBill[billSepNo] += Common.ToNumber(dailyList[i].controls['outsideServicePrice'].value);
      }
    });

    // 合計
    this.salesTotal +=  this.salesSubTotal + this.outsideService;
  }
//#endregion ----- この画面の処理 --------------------------------------------------

//#region ----- View 関連 --------------------------------------------------
  /** Viewの初期化処理時 */
  ngAfterViewInit(){
    this.ngAfterViewChecked();
  }

  private readonly timeout :number = 300;

  /** Viewの値が変わったあと */
  ngAfterViewChecked(){
    // Viewの値取得
    this.getStayItemList();

    // 商品情報 合計表示
    if (this.itemList != null
         && this.itemList.length > 0 ){

        this.calcSalesTotal();
    }
  }

  /** 商品の値を取得 */
  getStayItemList() {
    if(this.itemForm == null) return null;

    // 商品
    this.itemForm.forEach( (item, days) => {
      this.itemList[days] = item.itemList;
    });
  }

//#endregion ----- View 関連 --------------------------------------------------

//#region ----- マスタ類 取得 --------------------------------------------------
  /** マスタ類 取得 */
  private getInitMasterInfo(){

    this.MasterInfo = new MasterInfo();

    var cond = new Base();
    cond.companyNo = this._currentUser.displayCompanyNo;

    // 宿泊商品リスト
    this.reserveService.getMasterItemList_StayItem(cond).subscribe((res: ItemInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "宿泊商品リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '001'); }
      this.MasterInfo.M_StayItemList = res;
    });

    // その他商品リスト
    this.reserveService.getMasterItemList_OtherItem(cond).subscribe((res: ItemInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR,"その他商品リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '002'); }
      this.MasterInfo.M_OtherItemList = res;
    });

    // セット商品リスト(親)
    this.reserveService.getMasterItemList_SetItem(cond).subscribe((res: ItemInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "セット商品リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '003'); }
      this.MasterInfo.M_SetItemList = res;
    });

    // セット商品リスト(子)
    this.reserveService.getMasterSetItemList(cond).subscribe((res: SetItemInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "セット商品リスト(明細)" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '004'); }
      this.MasterInfo.M_SetItemDetailsList = res;
    });

    // 料理区分
    this.reserveService.getCodeNameInfo(SystemConst.DIVISION_MEAL, cond).subscribe((res: CodeNameInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "料理区分リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '005'); }
      this.MasterInfo.M_MealDivision = res;
    });

    // 税サ区分
    this.reserveService.getTaxServiceListView(cond).subscribe((res: TaxServiceDivision[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR,"税サ区分リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '006'); }
      this.MasterInfo.M_TaxServiceDivisionList = res;
    });

    // 税率
    this.reserveService.getTaxRate(cond).subscribe((res: TaxRateInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR,"税率リスト" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '007');}
      this.MasterInfo.M_TaxRateList = res;
    });

    // サービス料率
    this.reserveService.getServiceRate(cond).subscribe((res: number) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR,"サービス料率" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESDETAILS + '008'); }
      this.MasterInfo.M_ServiceRate = res;
    });
  }
  //#endregion ----- マスタ類 取得 --------------------------------------------------

  //#region ----- ページング 関連 --------------------------------------------------

  // // ページは切り替わるがコンポーネントがクリアされるのでオミット
  // pageSize = 5;
  // limit = 0;
  // offset = this.limit + this.pageSize;
  // pageSizeOptions: number[] = [5, 10];

  // setPageSizeOptions(setPageSizeOptionsInput: string) {
  //   this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);

  // }

  // get length() : number{
  //   var wkLength = 1;
  //   if(!Common.IsNullOrEmpty(this.StayDays)){
  //     wkLength = this.StayDays.length
  //   }
  //   return wkLength;
  // }

  // public getPaginatorData(event) {
  //   this.limit = event.pageSize * event.pageIndex;
  //   this.offset = this.limit + event.pageSize;
  //   return event;
  // }
  //#endregion ----- ページング 関連 --------------------------------------------------

}
