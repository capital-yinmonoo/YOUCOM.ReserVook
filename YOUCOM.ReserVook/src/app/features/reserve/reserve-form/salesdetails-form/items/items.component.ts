import { Component, OnInit, OnChanges, DoCheck, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SystemConst, Message, ItemDivision } from '../../../../../core/system.const';
import { Common } from '../../../../../core/common';
import { ReserveCommon } from '../../reserve.common';
import { SalesDetailsCommon } from '../salesdetails.common';
import { MasterInfo } from '../../../model/master.model';
import { SalesDetailsInfo } from '../../../model/reserve.model';
import moment, { Moment } from 'moment';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';

@Component({
  selector: 'items',
  templateUrl: './items.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss','../../reserve.component.scss', '../salesdetails.component.scss'],
})

export class ItemsComponent implements OnInit, OnChanges, DoCheck {

  // 親(salesdetails)からのパラメータ
  @Input() Days: number;
  @Input() UseDate: Moment;
  @Input() MasterInfo : MasterInfo;
  @Input() SalesDetailsList : Array<SalesDetailsInfo>;
  @Input() DisabledFlag : Boolean; // キャンセルフラグ
  @Input() MaxSetItemSeq: number;

  private detailsSeq = 1;
  private strUseDate : string;

  //#region ---- readonly --------------------------------------------------

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  // Header
  public readonly stayItemInfoHeader: string[]
  = ['addItemInfo', 'item', 'printName', 'unitPrice'
  , 'itemNumberM', 'itemNumberF', 'itemNumberC', 'amountPrice', 'mealDivision'
  , 'taxServiceDivision', 'taxRate', 'billSeparateSeq', 'detailsSeq'
  ];

  // Validate

  public readonly numberFormatPattern = '^[-]?[0-9]*$';

  public readonly maxMember : number = 999;
  public readonly minMember : number = this.maxMember * (-1);
  public readonly max9999 : number = 9999;
  public readonly maxLengthPrintName : number = 40;
  public readonly maxAmount : number = 99999999;
  public readonly minAmount : number = this.maxAmount * (-1);
  public readonly maxBillNo : number = 9;
  public readonly minBillNo : number = 1;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;

  //** -99999999以上の値で入力してください。 */
  public readonly msgMinAmount = this.minAmount.toLocaleString() + Message.MIN_DIGITS;
  //** 99999999以下の値で入力してください。 */
  public readonly msgMaxAmount = this.maxAmount.toLocaleString() + Message.MAX_DIGITS;

  //** 10以下の値で入力してください。 */
  public readonly msgMaxBillNo = this.maxBillNo.toString() + Message.MAX_DIGITS;
  //** 1以上の値で入力してください。 */
  public readonly msgMinBillNo = this.minBillNo.toString() + Message.MIN_DIGITS;

  //** 999以下の値で入力してください。 */
  public readonly msgMaxMember = this.maxMember.toString() + Message.MAX_DIGITS;
  //** -999以上の値で入力してください。 */
  public readonly msgMinMember = this.minMember.toString() + Message.MIN_DIGITS;

  //** 40文字以下で入力してください。 */
  public readonly msgMaxLengthPrintName = this.maxLengthPrintName.toString() + Message.MAX_LENGTH;

  //** 精算済みです。 */
  public readonly msgAdjustmented = Message.ADJUSTMENTED_ERROR;


  //** n行目 */
  public readonly msgLine = "行目";
  //** {項目名}は */
  public readonly msgIs = "は";

  //** 宿泊商品 */
  public readonly lblItem = "宿泊商品";
  //** 印字用名称 */
  public readonly lblPrintName = "印字用名称";
  //** 単価 */
  public readonly lblUnitPrice = "単価";
  //** 男 */
  public readonly lblMale = "男";
  //** 女 */
  public readonly lblFemale = "女";
  //** 子 */
  public readonly lblChild = "子";
  //** 金額 */
  public readonly lblAmount = "金額";
  //** ビル分割番号 */
  public readonly lblBillNo = "ビル分割番号";
  //#endregion

  loadFlag : Boolean = false; // 最初の1回だけデータ読込

  itemList = [];
  itemSource = new MatTableDataSource<any>();
  stayItemInfoForm = this.createItemData();

  constructor(private fb : FormBuilder) { }

  /** 初期化 */
  ngOnInit(): void {
    this.loadFlag = false;
    this.itemSource = new MatTableDataSource([this.stayItemInfoForm]);
    this.itemList = this.itemSource.data;
    this.strUseDate = null;
  }

  ngOnChanges(){
    var wkDate : string = this.UseDate.format(SystemConst.DATE_FORMAT_YYYYMMDD);
    if (this.strUseDate != null && this.strUseDate == wkDate) return;

    this.strUseDate = wkDate;
    let nextDay = moment(this.strUseDate).add(1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);
    this.itemList = this.itemSource.data;

    this.itemList.forEach(data => {

      // 翌日計上の場合は翌日をセット
      let setUseDate = this.strUseDate;
      if(this.checkNextDayFlag(data.controls['mealDivision'].value)){
        setUseDate = nextDay
      }

      data.patchValue({
        night: this.Days
        , useDate: setUseDate
      })
    });
    this.itemSource.data = this.itemList;
  }

  ngDoCheck(){
    if(this.SalesDetailsList != null && this.MasterInfo.M_ServiceRate != null && this.loadFlag === false){
      // 明細データセット
      this.setSalesDetailsInfo();
      this.loadFlag = true;
      return;
    }
  }

  /** 明細データセット */
  private setSalesDetailsInfo(){

    if(this.SalesDetailsList.length === 0) return;

    // クリア
    this.itemSource.data = [];
    this.itemList = [];

    // セット
    this.SalesDetailsList.forEach(data => {
      var taxServiceDiv = (data.taxDivision + data.serviceDivision);

      var info =  Common.CalcTaxServicePrice(taxServiceDiv, data.amountPrice, data.taxRate, this.MasterInfo.M_ServiceRate);
      var outsideServiceTaxPrice = info.outsideServiceTaxPrice;

      var newForm = this.setItemInfoForm(
          this.Days
          , data.useDate
          , data.itemDivision
          , data.itemCode
          , data.printName
          , data.unitPrice
          , data.itemNumberM
          , data.itemNumberF
          , data.itemNumberC
          , data.amountPrice
          , data.mealDivision
          , taxServiceDiv
          , data.taxDivision
          , data.serviceDivision
          , data.taxRateDivision
          , data.insideTaxPrice
          , data.insideServicePrice
          , data.outsideServicePrice
          , outsideServiceTaxPrice      // 外サの税額
          , data.taxRate
          , data.billSeparateSeq
          , data.setItemDivision
          , data.setItemSeq
          , data.adjustmentFlag
          , data.detailsSeq.toString()
        );
        this.itemList.push(newForm);
        this.itemSource.data = this.itemList;
        // this.calcAmountStayItem(newForm);
    });
  }

  /** 宿泊商品選択
   * @param  {} obj
   */
  public selectStayItem(obj) {

    // 商品変更時、セット商品の明細を削除
    if(this.CheckSetItemDivision_Parent(obj.controls['itemDivision'].value)){
      this.removeSetItemInfo(obj.controls['setItemSeq'].value);
      obj.controls['setItemSeq'].setValue(SystemConst.SET_ITEM_DIVISION_ITEM);
    }

    SalesDetailsCommon.selectItem(obj, this.MasterInfo.M_StayItemList, this.strUseDate)

    if(this.CheckSetItemDivision_Parent(obj.controls['itemDivision'].value)){

      let setItems = this.setSetItemDetails(obj);

      // セット商品(子)は(親)のすぐ下に表示する
      this.itemList = this.itemSource.data;
      let wkInfo = [];
      for (let i = 0, len = this.itemList.length; i < len; i++) {
        wkInfo.push(this.itemList[i]);
        if (this.itemList[i].controls['detailsSeq'].value == obj.controls['detailsSeq'].value) {
          wkInfo = wkInfo.concat(setItems);
        }
      }
      this.itemList = wkInfo;
      this.itemSource.data = this.itemList;
    }

    this.calcAmountStayItem(obj);
  }

  /** セット商品 明細展開
   * @param  {} obj
   */
  private setSetItemDetails(obj){

    let setItems = [];
    let setItemSeq = this.MaxSetItemSeq + 1;
    obj.controls['setItemSeq'].value = setItemSeq;

    let setList = this.MasterInfo.M_SetItemDetailsList.filter(x => x.setItemCode == obj.controls['item'].value);

    let number = Common.ToNumber(obj.controls['itemNumberM'].value)
               + Common.ToNumber(obj.controls['itemNumberF'].value)
               + Common.ToNumber(obj.controls['itemNumberC'].value);

    let nextDay = moment(this.strUseDate).add(1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);

    setList.forEach(setItem => {

      let item = this.MasterInfo.M_StayItemList.find(x => x.itemCode == setItem.itemCode);
      if(Common.IsNullOrEmpty(item)){
        item = this.MasterInfo.M_OtherItemList.find(x => x.itemCode == setItem.itemCode);
      }

      // 子商品に非課税がある場合、非課税とする
      let taxDiv = obj.controls['taxDivision'].value;
      let taxrate = obj.controls['taxRate'].value;
      if (item.taxDivision == SystemConst.NON_TAX_DIVISION) {
        taxDiv = SystemConst.NON_TAX_DIVISION;
        taxrate = 0;
      }

      let taxServiceDiv = (taxDiv + setItem.serviceDivision);
      let amount = number *  item.unitPrice;

      let setUseDate = this.strUseDate;
      if(this.checkNextDayFlag(item.mealDivision)){
        setUseDate = nextDay;
      }

      // 内サの場合には明細ごとで計算。
      // 外サの場合には対象額の総合計で求めて、明細に按分。

      // 金額の端数（差異）が出る場合、金額の大きいもので調整。

      let newForm = this.setItemInfoForm(
        this.Days
        , setUseDate
        , item.itemDivision
        , item.itemCode
        , item.printName
        , setItem.unitPrice
        , Common.ToNumber(obj.controls['itemNumberM'].value)
        , Common.ToNumber(obj.controls['itemNumberF'].value)
        , Common.ToNumber(obj.controls['itemNumberC'].value)
        , amount
        , item.mealDivision
        , taxServiceDiv
        , taxDiv
        , setItem.serviceDivision
        , setItem.taxrateDivision
        , 0 //data.insideTaxPrice
        , 0 //data.insideServicePrice
        , 0 //data.outsideServicePrice
        , 0 // outsideServiceTaxPrice
        , taxrate
        , obj.controls['billSeparateSeq'].value
        , SystemConst.SET_ITEM_DIVISION_SETITEM      // セット商品には'1'
        , setItemSeq
        , obj.controls['adjustmentFlag'].value
        , ReserveCommon.SeqPrefix + this.detailsSeq
      );
      this.detailsSeq++;
      setItems.push(newForm);
      this.calcAmountStayItem(newForm);

    });

    this.MaxSetItemSeq++;
    return setItems;
  }

  /** セット商品(子) 計算
   * @param  {} obj セット商品(親)
   */
  private calcSetItemDetails(obj){

    if(!this.CheckSetItemDivision_Parent(obj.controls['itemDivision'].value)) return;

    let insideTax_amountTotal = 0;      // 内税対象合計金額
    let outsideService_amountTotal = 0; // 外サ対象合計金額
    let insideTaxTotal = 0;             // 内税合計(外サ税分除く)
    let insideServiceTotal = 0;         // 内サ合計
    let outsideServicePriceTotal = 0;   // 外サ合計
    let outsideServiceTaxPriceTotal = 0;// 外サ税込額合計
    let maxAmount = 0;                  // 最大金額

    this.itemList = this.itemSource.data;

    // 単価変更時の差額は代表商品(明細1行目)で調整
    let count = 0;
    this.itemList.filter(x => x.controls['setItemDivision'].value == SystemConst.SET_ITEM_DIVISION_SETITEM
                           && x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value).forEach(child => {

      if(count != 0) return;  // continue(forEach)

      let setItemDetails = this.itemList.filter(x => x.controls['setItemDivision'].value == SystemConst.SET_ITEM_DIVISION_SETITEM
                          && x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value);

      let priceTotal = setItemDetails.reduce((p, x) => p + Common.ToNumber(x.controls['unitPrice'].value), 0);

      let parentPrice = Common.ToNumber(obj.controls['unitPrice'].value);
      if(parentPrice != priceTotal){
        let unitPrice = Common.ToNumber(child.controls['unitPrice'].value) + (parentPrice - priceTotal);
        let number = Common.ToNumber(child.controls['itemNumberM'].value)
                   + Common.ToNumber(child.controls['itemNumberF'].value)
                   + Common.ToNumber(child.controls['itemNumberC'].value);
        let amountPrice = unitPrice * number;

        child.controls['unitPrice'].setValue(unitPrice);
        child.patchValue({
          unitPrice: unitPrice
          , amountPrice: amountPrice
        });
      }

      count++;
    });

    // 集計
    this.itemList.filter(x => x.controls['setItemDivision'].value == SystemConst.SET_ITEM_DIVISION_SETITEM && x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value).forEach(child => {
        let wkAmount = Common.ToNumber(child.controls['amountPrice'].value);

        if(child.controls['taxDivision'].value == SystemConst.INSIDE_TAX_DIVISION){
          insideTax_amountTotal += wkAmount;
        }
        if(child.controls['serviceDivision'].value == SystemConst.OUTSIDE_SERVICE_DIVISION){
          outsideService_amountTotal += wkAmount;
        }

        if (maxAmount < wkAmount){
          maxAmount = wkAmount;
        }
    });

    // 税込、サービス料対象となる内訳の合計金額から税、サ額を計算
    let taxRate = Common.ToNumber(obj.controls['taxRate'].value);
    const wkTaxSrvDiv = SystemConst.INSIDE_TAX_DIVISION + obj.controls['serviceDivision'].value;
    const taxInfo = Common.CalcTaxServicePrice(wkTaxSrvDiv, insideTax_amountTotal, taxRate, this.MasterInfo.M_ServiceRate);
    insideTaxTotal = taxInfo.insideTaxPrice;
    insideServiceTotal = taxInfo.insideServicePrice;
    outsideServicePriceTotal = taxInfo.outsideServicePrice;
    outsideServiceTaxPriceTotal = taxInfo.outsideServiceTaxPrice;

    // セット商品(親)に合計を登録
    obj.patchValue({
      insideTaxPrice: insideTaxTotal
      , insideServicePrice: insideServiceTotal
      , outsideServicePrice: outsideServicePriceTotal
      , outsideServiceTaxPrice: outsideServiceTaxPriceTotal
    })

    let insideTax = insideTaxTotal;
    let insideService = insideServiceTotal
    let outsideServicePrice = outsideServicePriceTotal;
    let outsideServiceTaxPrice = outsideServiceTaxPriceTotal;

    // 按分の対象になるセット子商品を抽出
    const apportionmentItemList = this.itemList.filter(x => x.controls['setItemDivision'].value == SystemConst.SET_ITEM_DIVISION_SETITEM &&
                                                            x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value &&
                                                            x.controls['taxDivision'].value != SystemConst.NON_TAX_DIVISION &&
                                                            x.controls['serviceDivision'].value != SystemConst.NON_SERVICE_DIVISION);

    apportionmentItemList.forEach(child => {

      // HACK: 端数切捨て(固定)

      // 按分
      let amount = Common.ToNumber(child.controls['amountPrice'].value);

      let wkInsideTax = Common.ToNumber(Math.trunc((insideTaxTotal) * amount / insideTax_amountTotal));
      let wkInsideService = Common.ToNumber(Math.trunc(insideServiceTotal * amount / insideTax_amountTotal));

      let wkOutsideServicePrice = Common.ToNumber(Math.trunc(outsideServicePriceTotal * amount / outsideService_amountTotal));
      let wkOutsideServiceTaxPrice = Common.ToNumber(Math.trunc(outsideServiceTaxPriceTotal * amount / outsideService_amountTotal));

      // 按分残
      insideTax -= wkInsideTax;
      insideService -= wkInsideService;

      outsideServicePrice -= wkOutsideServicePrice;
      outsideServiceTaxPrice -= wkOutsideServiceTaxPrice;

      child.patchValue({
        insideTaxPrice: wkInsideTax
        , insideServicePrice: wkInsideService
        , outsideServicePrice: wkOutsideServicePrice
        , outsideServiceTaxPrice: wkOutsideServiceTaxPrice
      });

    });

    // 残った差額は金額が大きい商品で調整
    this.itemList.filter(x => x.controls['setItemDivision'].value == SystemConst.SET_ITEM_DIVISION_SETITEM && x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value).forEach(child => {
      if (Common.ToNumber(child.controls['amountPrice'].value) != maxAmount) return; // continue(forEach)

      child.patchValue({
        insideTaxPrice: child.controls['insideTaxPrice'].value += insideTax
        , insideServicePrice: child.controls['insideServicePrice'].value += insideService
        , outsideServicePrice: child.controls['outsideServicePrice'].value += outsideServicePrice
        , outsideServiceTaxPrice: child.controls['outsideServiceTaxPrice'].value += outsideServiceTaxPrice
      });
    });
    this.itemSource.data = this.itemList;
  }


  /** 翌日計上かどうかチェック
   * @param  {string} checkValue mealDivision
   */
  private checkNextDayFlag(checkValue : string){
    if(this.MasterInfo.M_MealDivision == null) return false;
    let nextDayFlag = this.MasterInfo.M_MealDivision.find(x => x.code == checkValue).codeValue;
    if(nextDayFlag == SystemConst.MEAL_DIVISION_NEXTDAY){
      return true;
    }
    return false;
  }


  /** 数量をセット商品の明細にコピー
   * @param  {} obj
   */
  public copyToSetItem_Member(obj){

    if(obj.controls['itemDivision'].value == ItemDivision.SetItem.toString()){

      let male = obj.controls['itemNumberM'].value;
      let female = obj.controls['itemNumberF'].value;
      let child = obj.controls['itemNumberC'].value;

      this.itemList = this.itemSource.data;
      this.itemList.filter(x => x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value).forEach(y => {
        y.patchValue({
          itemNumberM: male
          , itemNumberF: female
          , itemNumberC: child
        })
        this.calcAmountStayItem(y);
      });
      this.itemSource.data = this.itemList;
    }

    this.calcAmountStayItem(obj);
  }

  /** ビル分割番号をセット商品の明細にコピー
   * @param  {} obj
   */
  public copyToSetItem_BillSeparateNo(obj){

    let billSeparateSeq = obj.controls['billSeparateSeq'].value;

    if (!this.CheckBillSeq(billSeparateSeq)) return;

    if(obj.controls['itemDivision'].value == ItemDivision.SetItem.toString()){

      this.itemList = this.itemSource.data;
      this.itemList.filter(x => x.controls['setItemSeq'].value == obj.controls['setItemSeq'].value).forEach(y => {
        y.patchValue({
          billSeparateSeq: billSeparateSeq
        })
      });
      this.itemSource.data = this.itemList;
    }
  }

  /** 宿泊商品 金額計算
   * @param  {} obj
   */
  public calcAmountStayItem(obj){
    if (Common.IsNullOrEmpty(obj.controls['useDate'].value)){
      obj.patchValue({useDate:this.strUseDate});
    }
    SalesDetailsCommon.calcAmountItem(obj);
    this.calcSetItemDetails(obj);

  }

  /** 未精算のビルNoをセット
   * @param  {any} billSeparateSeq ビル分割番号
   * @returns boolean true: 未精算、 false: 精算
   * @remarks changeイベント側からはnumber/精算チェック側からはstringで受けるためany型
   */
  public SetBillSeq(): string {
    return ReserveCommon.SetMinBillSeq(this.minBillNo , this.maxBillNo);
  }

  /** 未精算かどうかチェック
   * @param  {any} billSeparateSeq ビル分割番号
   * @returns boolean true: 未精算、 false: 精算
   * @remarks changeイベント側からはnumber/精算チェック側からはstringで受けるためany型
   */
  public CheckBillSeq(billSeparateSeq : any): boolean{
    return ReserveCommon.CheckNotAdjustmented(billSeparateSeq, false);
  }

  /** セット商品(親)かどうかチェック
   * @param  {string} itemDivision 商品区分
   * @returns boolean true: セット商品(明細), false: 商品
   */
  public CheckSetItemDivision_Parent(itemDivision: string) : boolean{
    return (itemDivision == ItemDivision.SetItem.toString());
  }

  /** セット商品(明細)かどうかチェック
   * @param  {string} setItemDivision セット商品区分
   * @returns boolean true: セット商品(明細), false: 商品
   */
  public CheckSetItemDivision_Child(setItemDivision: string) : boolean{
    return (setItemDivision == SystemConst.SET_ITEM_DIVISION_SETITEM);
  }

  //#region ---- 行追加/削除 等 制御 --------------------------------------------------
  /** 行追加 宿泊商品 */
  addItemInfo() {
    this.itemList = this.itemSource.data;
    var newForm = this.createItemData();
    this.itemList.push(newForm);
    this.itemSource.data = this.itemList;
  }

  /** 行削除 宿泊商品 */
  removeItemInfo(obj) {

    let detailsSeq = obj.controls['detailsSeq'].value;

    this.itemList = this.itemSource.data;
    var wkInfo = [];
    for (var i = 0, len = this.itemList.length; i < len; i++) {
      if (this.itemList[i].controls['detailsSeq'].value != detailsSeq) {
        wkInfo.push(this.itemList[i]);
      }
    }

    this.itemList = wkInfo;
    this.itemSource.data = this.itemList;

    // セット商品(親)の場合、セット商品(子)も削除する
    if(this.CheckSetItemDivision_Parent(obj.controls['itemDivision'].value)){
      this.removeSetItemInfo(obj.controls['setItemSeq'].value);
    }

    if(this.itemSource.data.length == 0){
      this.addItemInfo()
    }
  }

  /** 行削除 セット商品 */
  private removeSetItemInfo(setItemSeq: number) {
    this.itemList = this.itemSource.data;
    var wkInfo = [];
    for (var i = 0, len = this.itemList.length; i < len; i++) {
      if (this.itemList[i].controls['itemDivision'].value == ItemDivision.SetItem.toString()
           || this.itemList[i].controls['setItemSeq'].value != setItemSeq) {
        wkInfo.push(this.itemList[i]);
      }
    }

    this.itemList = wkInfo;
    this.itemSource.data = this.itemList;
  }

  // /** 行コピー 宿泊商品 */
  // copyStayItemInfo(detailsSeq: string) {
  //   var wkInfo = this.stayItemList;
  //   for (var i = 0, len = this.stayItemList.length; i < len; i++) {
  //     if (this.stayItemList[i]["detailsSeq"] == detailsSeq) {
  //       wkInfo.push(
  //         {
  //           syohinName: this.stayItemList[i]["item"],
  //           unitPrice: this.stayItemList[i]["unitPrice"],
  //           itemNumberM: this.stayItemList[i]["itemNumberM"],
  //           itemNumberF: this.stayItemList[i]["itemNumberF"],
  //           itemNumberC: this.stayItemList[i]["itemNumberC"],
  //           amountPrice: this.stayItemList[i]["amountPrice"],
  //           taxServiceDivision: this.stayItemList[i]["taxServiceDivision"],
  //           taxRate: this.stayItemList[i]["taxRate"],
  //           billSeparateSeq: this.stayItemList[i]["billSeparateSeq"],

  //           detailsSeq: (this.detailsSeq),
  //         },
  //       );
  //       this.detailsSeq++;
  //     }
  //   }
  //   this.stayItemList = wkInfo;
  //   this.stayItemSource.data = this.stayItemList;
  // }
  //#endregion  ---- 行追加/削除 等 制御 --------------------------------------------------

  //#region ----- FormGroup セット --------------------------------------------------

  /** FormGroup 初期値セット */
  private createItemData(){
    var result
     = this.setItemInfoForm(this.Days, this.strUseDate, '', '', '', 0
                                , 0, 0, 0, 0, '0'
                                , '', '', '', ''
                                , 0, 0, 0, 0
                                , 0, '', SystemConst.SET_ITEM_DIVISION_ITEM, 0
                                , SystemConst.NOT_ADJUSTMENTED, ReserveCommon.SeqPrefix + this.detailsSeq);
    this.detailsSeq++;
    return result;
  }

  /** FormGroup 宿泊商品情報セット */
  private setItemInfoForm(night: number, useDate: string, itemDivision: string, itemCode: string, printName: string, unitPrice: number
                            , itemNumberM: number, itemNumberF: number, itemNumberC: number, amountPrice: number, mealDivision: string
                            , taxServiceDivision: string, taxDivision: string, serviceDivision: string, taxRateDivision: string
                            , insideTaxPrice: number, insideServicePrice: number, outsideServicePrice: number, outsideServiceTaxPrice: number
                            , taxRate: number, billSeparateSeq: string, setItemDivision: string, setItemSeq: number
                            , adjustmentFlag: string, detailsSeq:string){

    var adjustFlag = !this.CheckBillSeq(billSeparateSeq);
    var billSeq = Common.IsNullOrEmpty(billSeparateSeq) ? this.SetBillSeq() : billSeparateSeq;
    var setItemFlag = this.CheckSetItemDivision_Child(setItemDivision);
    var disabled = this.DisabledFlag == null ? false : this.DisabledFlag;
    return this.fb.group({
      night: new FormControl( {value:night, disabled: adjustFlag || setItemFlag} )
      , useDate: new FormControl( {value:useDate, disabled: adjustFlag || setItemFlag} )
      , itemDivision: new FormControl( {value:itemDivision, disabled: adjustFlag || setItemFlag} )
      , item: new FormControl( {value:itemCode, disabled: adjustFlag || setItemFlag || disabled })
      , printName: new FormControl( {value:printName, disabled: adjustFlag || setItemFlag},[Validators.maxLength(this.maxLengthPrintName)] )
      , unitPrice: new FormControl( {value:unitPrice, disabled: adjustFlag || setItemFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minAmount), Validators.max(this.maxAmount)] )
      , itemNumberM: new FormControl( {value:itemNumberM, disabled: adjustFlag || setItemFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minMember), Validators.max(this.maxMember)] )
      , itemNumberF: new FormControl( {value:itemNumberF, disabled: adjustFlag || setItemFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minMember), Validators.max(this.maxMember)] )
      , itemNumberC: new FormControl( {value:itemNumberC, disabled: adjustFlag || setItemFlag}, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minMember), Validators.max(this.maxMember)] )
      , amountPrice: new FormControl( {value:amountPrice.toLocaleString(), disabled: adjustFlag || setItemFlag}, [Validators.min(this.minAmount), Validators.max(this.maxAmount)] )
      , mealDivision: new FormControl( {value:mealDivision, disabled: true } )
      , taxServiceDivision: new FormControl( { value: taxServiceDivision, disabled: true })  // 表示用
      , taxDivision: new FormControl( {value:taxDivision, disabled: adjustFlag || setItemFlag} )            // DB登録用
      , serviceDivision: new FormControl( {value:serviceDivision, disabled: adjustFlag || setItemFlag} )    // DB登録用
      , taxRateDivision: new FormControl( {value:taxRateDivision, disabled: adjustFlag || setItemFlag} )    // DB登録用
      , insideTaxPrice: new FormControl( {value:insideTaxPrice, disabled: adjustFlag || setItemFlag} )             // DB登録用
      , insideServicePrice: new FormControl( {value:insideServicePrice, disabled: adjustFlag || setItemFlag} )     // DB登録用
      , outsideServicePrice: new FormControl( {value:outsideServicePrice, disabled: adjustFlag || setItemFlag} )   // DB登録用
      , outsideServiceTaxPrice: new FormControl( {value:outsideServiceTaxPrice, disabled:adjustFlag || setItemFlag})
      , taxRate: new FormControl( {value:taxRate, disabled: adjustFlag || setItemFlag} )
      , billSeparateSeq: new FormControl( {value:billSeq, disabled: adjustFlag || setItemFlag}, [Validators.min(this.minBillNo), Validators.max(this.maxBillNo)]  )

      , setItemDivision: new FormControl( {value:setItemDivision, disabled: adjustFlag || setItemFlag} )
      , setItemSeq: new FormControl( {value:setItemSeq, disabled: adjustFlag || setItemFlag} )

      , adjustmentFlag: new FormControl( {value:adjustmentFlag, disabled: adjustFlag || setItemFlag} )
      , detailsSeq: new FormControl( {value:detailsSeq, disabled: adjustFlag || setItemFlag} )
      , billSeparateSeqError: new FormControl('') // エラーセット用
    },
    {
      validator:
      [ SalesDetailsCommon.CustomValidator.itemRequired
        , SalesDetailsCommon.CustomValidator.itemBillNoRequired
        , ReserveCommon.CustomValidator.billNoAdjustmented
      ]
    });

  }

  //#endregion ----- FormGroup セット --------------------------------------------------
}
