import { isNullOrUndefined } from 'util';
import { BillTitle } from './../../bill/model/billPrintInfo.model';
import { DomSanitizer } from '@angular/platform-browser';
import { BillService } from './../../bill/bill.service';
import { CompanyInfo } from "../../company/model/company.model";
import { CompanyService } from "../../company/services/company.service";
import { BillDetails, BillHeader, BillInfo, BillFooter, TaxList, Receipt } from "../../bill/model/billPrintInfo.model";
import { ReserveService } from "../../reserve/services/reserve.service";
import { Component, OnInit, Input, SimpleChanges, OnChanges } from "@angular/core";
import { AuthService } from "src/app/core/auth/auth.service";
import { User } from "src/app/core/auth/auth.model";
import { Reserve, SalesDetailsInfo, DepositInfo } from "../../reserve/model/reserve.model";
import { ActivatedRoute, Router } from "@angular/router";
import { Message, SystemConst, PrintPage, MessagePrefix, FunctionId } from "src/app/core/system.const";
import { Base } from "src/app/shared/model/baseinfo.model";
import { TaxRateInfo } from "../../master/taxrate/model/taxrateinfo.model";
import { Common } from "src/app/core/common";
import { DenominationService } from '../../master/denomination/services/denomination.service';
import { DenominationInfo } from '../../master/denomination/model/denominationinfo.model';

@Component({
  selector: "billprint",
  templateUrl: "./bill-print.component.html",
  styleUrls: ["./bill-print.component.scss"]
})

export class BillPrintComponent implements OnInit, OnChanges{

  /** 予約情報取得用 */
  private reserveInfo : Reserve;

  // マスタ情報保持用
  private M_TaxRateList: TaxRateInfo[];
  public M_Company: CompanyInfo;
  private M_BillFooterComment: Array<string>;
  private M_BillTitle: BillTitle;
  private M_Denominations : DenominationInfo[];

  /**ログインユーザ情報 */
  private _currentUser :User;

  // ビル情報セット用
  public billInfoList : Array<BillInfo> = [];
  public billInfo : BillInfo = new BillInfo();
  public taxList: Array<TaxList> = [];
  public sumSalesCharges: number = 0;
  public sumDepositCharges: number = 0;
  public sumExcludeReceiptAmount: number = 0;
  public logoData: string | ArrayBuffer;
  private billSepareteNo: string;
  private billNo: string;

  /** ビル宛名 敬称 (様) */
  private readonly TitleSuffix : string = "　様"

  // 親コンポーネント(BillComponent)からのパラメータ
  @Input() name: string;
  @Input() roomNo: string;
  @Input() proviso: string;
  @Input() reserveNo: string;
  @Input() sepBillNo: string;

//#region Event Method
  constructor(private route: ActivatedRoute,
              private router: Router,
              private reserveService: ReserveService,
              private authService: AuthService,
              private companyService: CompanyService,
              private billService: BillService,
              private denominationService: DenominationService,
              private domSanitizer: DomSanitizer) {
    this._currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void { }

  // View初期後イベント
  ngAfterViewInit(){

    // 印刷ボタン押下時
    if (this.billService.getPrintOutFlg()){
    // ビル印刷連携値取得サービスから予約番号を取得
    const conditions = this.billService.getBillCondition();
    this.reserveNo = conditions[0].ReserveNo;

    Common.setPrintPage(document, PrintPage.A4_PORTRAIT);
    }

    // ビル作成
    if (!this.main()) {
      Common.modalMessageNotice(Message.TITLE_NOTICE,"アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.NOTICE + FunctionId.PRINT + '001').then(() => {
        this.router.navigate(["/company/rooms"]);
        return;
      });
    }

  }

  ngOnChanges(changes: SimpleChanges) {

    // ビル分割No変更時
    if (changes.sepBillNo) {

        // ビル作成
        if (!this.main()) {
          Common.modalMessageNotice(Message.TITLE_NOTICE,"アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.NOTICE + FunctionId.PRINT + '002').then(() => {
            this.router.navigate(["/company/rooms"]);
            return;
          });
        }
    }

    // 宛名,部屋,但し書き変更時 必要な変数のみ書き換え
    if (changes.name || changes.roomNo || changes.proviso) {

      if(!(this.billSepareteNo == "" || this.billSepareteNo == undefined || this.billSepareteNo == null)) {

        this.billInfoList.forEach((value) => {
          value.BillHeader.Name = Common.leftB(this.name, 100) + this.TitleSuffix;
          value.BillHeader.RoomNo = Common.leftB(this.roomNo, 9);
          value.Receipt.Name = Common.leftB(this.name, 100) + this.TitleSuffix;
          value.Receipt.Proviso = this.proviso.padEnd(20, "　").substring(0, 20);
        });

      }
    }
  }
//#endregion

  /** ビルを作成 */
  private main(): boolean{
    // マスタ類 取得
    if (this.getInitMasterInfo() != 0){
      return false;
    }

    // 条件セット
    const cond = new Reserve();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;

    if (!Common.IsNullOrEmpty(this.reserveNo)) {
      // 予約番号があればデータ取得
      if (!this.getReserveInfo()) {
        Common.modalMessageError(Message.TITLE_ERROR,"予約データ" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.PRINT + '001').then(() => {
          this.router.navigate(["/company/rooms"]);
          return false;
        });

      }
    }

    return true;

  }

  /** マスタ類 取得
   * @returns {number} 0:OK else:NG
   */
  private getInitMasterInfo(): number{

    let cond = new Base();
    cond.companyNo = this._currentUser.displayCompanyNo;

    // 税率
    this.reserveService.getTaxRate(cond).subscribe((res: TaxRateInfo[]) => {
      if (res == null) {
        Common.modalMessageError(Message.TITLE_ERROR, "税率リスト" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.PRINT + '002').then(() => {
          this.router.navigate(["/company/rooms"]);
        });
      }
      this.M_TaxRateList = res;
    });

    // 請求先
    this.companyService.getCompany(this._currentUser.displayCompanyNo).subscribe((res: CompanyInfo) => {
      if (res == null) {
        Common.modalMessageError(Message.TITLE_ERROR, "請求先" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.PRINT + '003').then(() => {
          this.router.navigate(["/company/rooms"]);
        });
      }
      this.M_Company = res;
      // // 最大桁印字テスト
      // this.M_Company = this.setDammyCompanyInfo();
    });

    // ロゴ
    this.companyService.getCompanyImage(cond.companyNo).subscribe( val => {

      // 登録データ無しor取得失敗時は画像Urlに変換せず、テキスト表示
      if (!isNullOrUndefined(val) && val.size > 0) {
        this.createImageFromBlob(val);
      }

    });

    // ビルフッタ コメント行
    this.M_BillFooterComment = this.billService.getBillFooterComment()

    // ビル・領収書のタイトル
    this.M_BillTitle = this.billService.getBillTitle()

    // 金種リスト(領収区分チェック用)
    let condition : DenominationInfo = new DenominationInfo();
    condition.companyNo = this._currentUser.displayCompanyNo
    this.denominationService.GetDenominationList(condition).subscribe((res: DenominationInfo[]) => {
      this.M_Denominations = res;
    });

    return 0;
  }

  /**APIから取得したBlobより画像Urlに変換 */
  private createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.logoData = reader.result;
      },
      false
    );
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  /** 予約データ取得 */
  private getReserveInfo(): boolean{

    const cond: Reserve = new Reserve();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;

    this.reserveService.getReserveInfoByPK(cond).subscribe(result => {

      if (result) {
        this.reserveInfo = result;

        if (this.reserveInfo != null) {

          // 初期化
          this.billInfoList = [];

          // 分割No毎にビル情報をセット
          if (this.billService.getPrintOutFlg()){ /* 印刷ボタン押下時 */

            // ビル印字条件を連携値取得サービスから取得
            const conditions = this.billService.getBillCondition();

            conditions.forEach((value) => {
              if (!value.PrintOutFlg) { return; }

              this.reserveNo = value.ReserveNo;
              this.name = value.Name;
              this.roomNo = value.RoomNo;
              this.proviso = value.Proviso;
              this.billSepareteNo = value.SepBillNo;

              this.setBillInfo();

            });

            // 印刷ボタンで画面遷移した際印刷ダイアログを出す
            setTimeout( () => {
              this.billService.clearBillCondition();
              this.billService.setPrintOutFlg(false);
              window.print();
              this.router.navigate(['/company/bill/' + this.reserveNo ]);
            }, 100)

          } else { /* ブラウザプレビュー時 */

            // 未指定、初期はビル分割No=1の内容を表示
            if(this.billSepareteNo == "" || this.billSepareteNo == undefined || this.billSepareteNo == null){
              this.sepBillNo = "1";
            }

            this.billSepareteNo = this.sepBillNo;
            this.setBillInfo();

          }

        } else {
          Common.modalMessageError(Message.TITLE_ERROR,"予約データ" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.PRINT + '004').then(() => {
            this.router.navigate(["/company/rooms"]);
            return false;
          });
        }

      } else {
        Common.modalMessageError(Message.TITLE_ERROR,"予約データ" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.PRINT + '005').then(() => {
          this.router.navigate(["/company/rooms"]);
          return false;
        });
      }
    });

    return true;

  }

//#region View用変数へセット

  /** ビル情報をセット */
  private setBillInfo(){

    /**1ページの最大明細行数 */
    const MAX_ROWS :number = 18;

    /**ページカウンタ*/
    let pageCount :number = 1;
    /**明細行カウンタ*/
    let rowCount: number = 0;
    /**初回フラグ */
    let isFirst: boolean = true;

    // 初期化
    this.billInfo = new BillInfo();
    this.taxList = [];
    this.sumSalesCharges = 0;
    this.sumDepositCharges = 0;
    this.sumExcludeReceiptAmount = 0;

    // ビル分割Noでフィルタリング
    /**売上明細リスト */
    const salesdetails = this.reserveInfo.itemInfo.filter(f => f.billSeparateSeq == this.billSepareteNo);
    /**入金明細リスト */
    const depositdetails = this.reserveInfo.depositInfo.filter(f => f.billSeparateSeq == this.billSepareteNo);

    // ビルNoを明細より取得
    if (salesdetails == null || salesdetails == undefined || salesdetails.length == 0 ||
        salesdetails[0].billNo == null || salesdetails[0].billNo == undefined || salesdetails[0].billNo.length == 0) {
        // ビルNoが明細に入っていない場合エラーとする
        return -1;
    }
    this.billNo = salesdetails[0].billNo;

    // 初回ヘッダセット
    this.setBillHeaderInfo(pageCount);

    // 売上明細をビル用変数へセット
    salesdetails.forEach((value) => {

      // 金額はセット商品(子)または単独商品から集計
      if (value.setItemDivision == SystemConst.SET_ITEM_DIVISION_SETITEM || value.setItemSeq == 0) {
        this.setTaxList(value);
        this.sumSalesCharges += value.amountPrice;
      }

      // セット商品の内訳は印字しない
      if (value.setItemDivision == SystemConst.SET_ITEM_DIVISION_SETITEM) { return; /* <- Continue foreach */ }

      // 改ページ判定
      if(!isFirst && rowCount >= MAX_ROWS){

        this.setBillFooterInfo(false);
        this.setReceiptInfo(false);
        this.addEmptyRowsIfTaxListIsNull();

        this.billInfoList.push(Object.create(this.billInfo));

        pageCount++;
        rowCount = 0;
        this.billInfo = new BillInfo();

        this.setBillHeaderInfo(pageCount);

      }

      // 初回フラグ リセット
      if(isFirst){ isFirst = false; }

      this.setBillDetailSalesInfo(value);

      // 改ページ判定
      if(!isFirst && rowCount >= MAX_ROWS){

        this.setBillFooterInfo(false);
        this.setReceiptInfo(false);
        this.addEmptyRowsIfTaxListIsNull();

        this.billInfoList.push(Object.create(this.billInfo));

        pageCount++;
        rowCount = 0;
        this.billInfo = new BillInfo();

        this.setBillHeaderInfo(pageCount);

      }

      // 外サービス料
      if (value.serviceDivision == SystemConst.OUTSIDE_SERVICE_DIVISION) {
        let outsideServiceTax = 0;
        let outsideServicePrice = 0;

        // セット(親)
        if (value.setItemDivision == SystemConst.SET_ITEM_DIVISION_ITEM && value.setItemSeq != 0) {
          // セット(子)を取得,外サ計算,1行印字
          const setChildItems = salesdetails.filter(f => f.setItemSeq == value.setItemSeq && f.setItemDivision == SystemConst.SET_ITEM_DIVISION_SETITEM);
          for (let i = 0; !isNullOrUndefined(setChildItems) && i < setChildItems.length; i++) {
            outsideServiceTax += this.calcOutSideServiceTax(setChildItems[i]);
            outsideServicePrice += value.outsideServicePrice;
          }
        }
        // 単独商品
        else {
          outsideServiceTax = this.calcOutSideServiceTax(value);
          outsideServicePrice = value.outsideServicePrice;
        }

        let detail = new SalesDetailsInfo();
        detail.useDate = Common.ToFormatDate(value.useDate);
        detail.printName = "サービス料";
        detail.itemNumberM = 1;
        detail.itemNumberF = 0;
        detail.itemNumberC = 0;
        detail.unitPrice = outsideServicePrice + outsideServiceTax;
        detail.amountPrice = detail.unitPrice;
        detail.taxRate = value.taxRate;

        this.setBillDetailSalesInfo(detail);

        this.sumSalesCharges += (outsideServicePrice + outsideServiceTax);
        rowCount++;
      }

      rowCount++;

    });

    // 入金明細をビル用変数へセット
    depositdetails.forEach((value) => {

      // 改ページ判定
      if(!isFirst && rowCount >= MAX_ROWS){

        this.setBillFooterInfo(false);
        this.setReceiptInfo(false);
        this.addEmptyRowsIfTaxListIsNull();

        this.billInfoList.push(Object.create(this.billInfo));

        pageCount++;
        rowCount = 0;
        this.billInfo = new BillInfo();

        this.setBillHeaderInfo(pageCount);

      }

      // 初回フラグ リセット
      if(isFirst){ isFirst = false; }

      this.setBillDetailDepositInfo(value);

      this.sumDepositCharges += value.price;

      // 領収区分チェック
      if (this.isExcluedeReceipt(value.denominationCode)){
        this.sumExcludeReceiptAmount += value.price;
      }

      rowCount++;

    });

    // 最終ページの残りの明細行を埋める
    for(let i = rowCount; i < MAX_ROWS; i++){
      const billDetail = new BillDetails();
      this.billInfo.BillDetails.push(Object.create(billDetail));
    }

    // 最終ページのフッタ以降をセット
    this.setBillFooterInfo(true);
    this.setConsumptionTax();
    this.setReceiptInfo(true);
    this.addEmptyRowsIfTaxListIsNull();

    this.billInfoList.push(Object.create(this.billInfo));

  }

  /**
   * 明細書 ヘッダをセット
   * @param page ページ番号
   */
  private setBillHeaderInfo(page: number){

    let billHeader = new BillHeader();

    billHeader.TitleMain = Common.leftB(this.M_BillTitle.BillTitle, 20);
    billHeader.TitleSub = Common.leftB(this.M_BillTitle.BillSubTitle, 30);
    billHeader.Name = Common.leftB(this.name, 100) + this.TitleSuffix;
    billHeader.RoomNo = Common.leftB(this.roomNo, 6);
    billHeader.ArrivedDate = Common.ToFormatDate(this.reserveInfo.stayInfo.arrivalDate);
    billHeader.DepartureDate = Common.ToFormatDate(this.reserveInfo.stayInfo.departureDate);
    billHeader.Nights = this.reserveInfo.stayInfo.stayDays.toLocaleString().substring(0, 3);
    billHeader.Persons = "大人" + (this.reserveInfo.stayInfo.memberMale + this.reserveInfo.stayInfo.memberFemale).toLocaleString().padStart(3, " ").substring(0, 3) + "人 " +
                         "小人" + (this.reserveInfo.stayInfo.memberChildA + this.reserveInfo.stayInfo.memberChildB + this.reserveInfo.stayInfo.memberChildC).toLocaleString().padStart(3, " ").substring(0, 3) + "人"
    billHeader.IssueDate = Common.getSystemDate(SystemConst.DATE_FORMAT_YYYY_MM_DD);
    billHeader.Pages = page.toString().substring(0, 3);
    billHeader.BillNo = this.billNo.substring(0, 10);
    this.billInfo.BillHeader = Object.create(billHeader);
  }

  /**
   * 明細書 明細行 売上をセット
   * @param info 売上情報
   */
  private setBillDetailSalesInfo(info: SalesDetailsInfo){

    let billDetail = new BillDetails();

    billDetail.UseDate = Common.ToFormatDate(info.useDate);
    billDetail.ItemName = Common.leftB(this.suffixTaxrateWithItemName(info.printName, info.taxRate, info.useDate), 40);
    billDetail.Qty = (info.itemNumberM + info.itemNumberF + info.itemNumberC).toLocaleString().substring(0, 10);
    billDetail.UnitPrice = info.unitPrice.toLocaleString().substring(0, 10);
    billDetail.Charges = info.amountPrice.toLocaleString().substring(0, 12);
    billDetail.Paid = "";

    this.billInfo.BillDetails.push(Object.create(billDetail));
  }

  /**
   * 明細書 外サ分の消費税額を求める
   * @param info 売上情報
   */
  private calcOutSideServiceTax(info: SalesDetailsInfo){

    // 外サ分の消費税額を求める
    let outsideServiceTax = 0;
    if (info.taxDivision == SystemConst.INSIDE_SERVICE_DIVISION){
      // 内税
      outsideServiceTax = info.insideTaxPrice - Math.trunc(info.amountPrice * info.taxRate / (100 + info.taxRate));
    }

    return outsideServiceTax;
  }

  /**
   * 明細書 明細行 入金をセット
   * @param info 入金情報
   */
  private setBillDetailDepositInfo(info: DepositInfo){

    let billDetail = new BillDetails();

    billDetail.UseDate = Common.ToFormatDate(info.depositDate);
    billDetail.ItemName = Common.leftB(info.printName, 40);
    billDetail.Qty = "";
    billDetail.UnitPrice = "";
    billDetail.Charges = "";
    billDetail.Paid = info.price.toLocaleString().substring(0, 11);

    this.billInfo.BillDetails.push(Object.create(billDetail));
  }

  /**
   * 明細書フッタをセット
   * @param lastPage 最終ページ:true, 以外:false
   */
  private setBillFooterInfo(lastPage: boolean){

    let billFooter = new BillFooter();

    if (lastPage) // 最終ページのみ印字
    {
      billFooter.TotalCharges = this.sumSalesCharges.toLocaleString().substring(0, 12);
      billFooter.TotalPaid = this.sumDepositCharges.toLocaleString().substring(0, 12);
      billFooter.BalanceDue = (this.sumSalesCharges - this.sumDepositCharges).toLocaleString().substring(0, 12);
      billFooter.ReceiptAmount = (this.sumDepositCharges - this.sumExcludeReceiptAmount).toLocaleString().substring(0, 12);

    }
    else // 最終ページ以外は合計金額等は伏字で印字
    {
      let nonLastPageText = "*****"; // 伏字

      billFooter.TotalCharges = nonLastPageText;
      billFooter.TotalPaid = nonLastPageText;
      billFooter.BalanceDue = nonLastPageText;
      billFooter.ReceiptAmount = nonLastPageText;
    }

    billFooter.Account = Common.leftB(this.M_Company.billingAddress, 120);

    billFooter.Comment1 = Common.leftB(this.M_BillFooterComment[0], 70);
    billFooter.Comment2 = Common.leftB(this.M_BillFooterComment[1], 70);
    billFooter.Comment3 = Common.leftB(this.M_BillFooterComment[2], 70);

    this.billInfo.BillFooter = billFooter;
  }

  /**
   * 税率毎に内消費税を算出してセット
   */
  private setConsumptionTax(){

    // Order By Taxrate ASC
    this.taxList = this.taxList.sort(function(a, b){ return Common.ToNumber(a.TaxRate) - Common.ToNumber(b.TaxRate); });

    // Calc ConsumptionTax By Taxrate
    this.taxList.forEach((value) => {
      value.ConsumptionTax = Common.CalcConsumptionTax(SystemConst.INSIDE_TAX_DIVISION,
                                                        Common.ToNumber(value.TaxRate),
                                                        Common.ToNumber(value.IncludeTaxAmount)).toLocaleString().padStart(8," ");
    });

    this.billInfo.TaxList = this.taxList;

  }

  /**
   * 領収書をセット
   * @param lastPage 最終ページ:true, 以外:false
   */
  private setReceiptInfo(lastPage: boolean){

    let receipt = new Receipt();

    if (lastPage) // 最終ページのみ印字
    {
      receipt.TotalAmount = "￥" + this.billInfo.BillFooter.ReceiptAmount + "-";
    }
    else // 最終ページ以外は合計金額等は伏字で印字
    {
      let nonLastPageText = "*****"; // 伏字

      receipt.TotalAmount = nonLastPageText;
    }

    receipt.TitleMain = Common.leftB(this.M_BillTitle.ReceiptTitle, 20);
    receipt.TitleSub = Common.leftB(this.M_BillTitle.ReceiptSubTitle, 20);
    receipt.BillNo = this.billNo.substring(0, 10);
    receipt.Name = this.name.padEnd(20, "　").substring(0, 20);
    receipt.IssueDate =  Common.getSystemDate(SystemConst.DATE_FORMAT_YYYY_MM_DD);
    receipt.Proviso = this.proviso.padEnd(20, "　").substring(0, 20);

    this.billInfo.Receipt = Object.create(receipt);
  }

  /** 税率毎に税込金額をセット
   * @param info 売上明細情報
   */
  private setTaxList(info: SalesDetailsInfo){

    // 非課税
    if(info.taxRate == 0) { return; }

    // 外サ分の消費税額を求める
    let outsideServiceTax = 0;
    if (info.serviceDivision == SystemConst.OUTSIDE_SERVICE_DIVISION)
    {
      if (info.taxDivision == SystemConst.INSIDE_TAX_DIVISION){
        // 内税
        outsideServiceTax = info.insideTaxPrice - Math.trunc(info.amountPrice * info.taxRate / (100 + info.taxRate));
      }
    }

    // 税率毎に(金額 - 外サ)をセット
    const index = this.taxList.findIndex(f => f.TaxRate == info.taxRate.toString())
    if(index >= 0){
      this.taxList[index].IncludeTaxAmount = (Common.ToNumber(this.taxList[index].IncludeTaxAmount) + info.amountPrice + info.outsideServicePrice + outsideServiceTax).toLocaleString().padStart(8," ");
    }
    else
    {
      let wkinfo = new TaxList();
      wkinfo.TaxRate = info.taxRate.toString();
      wkinfo.IncludeTaxAmount = (info.amountPrice + info.outsideServicePrice + outsideServiceTax).toLocaleString().padStart(8," ");

      this.taxList.push(wkinfo);
    }

  }

  /** 印字する税率毎情報がないとき空行を追加 */
  private addEmptyRowsIfTaxListIsNull(){

    if(this.billInfo.TaxList == null || this.billInfo.TaxList.length == 0) {
      let wkTaxList = new TaxList();
      wkTaxList.TaxRate = "";
      wkTaxList.IncludeTaxAmount = "";
      wkTaxList.ConsumptionTax = "";

      this.billInfo.TaxList.push(wkTaxList);
    }

  }

  /** 軽減税率,非課税商品は税率を商品名の末尾に追加
   * @param itemName 商品名
   * @param taxRate 税率
   * @param baseDate 基準日
   * @returns 印字用の商品名
  */
  private suffixTaxrateWithItemName(itemName: string, taxRate: number, baseDate: string): string {

    // 非課税は出力する
    if(taxRate == 0) { return itemName + "(0%)" }

    // 基準日の標準税率を取得
    const baseTaxRateInfo = this.M_TaxRateList.find(f => (f.beginDate <= baseDate && baseDate < f.endDate) && f.taxrateDivision == SystemConst.NORMAL_TAXRATE_DIVISION);

    // 基準日の標準税率と一致しないものは税率を出力する
    if(baseTaxRateInfo.taxRate != taxRate){ return itemName + "(" + taxRate.toString() + "%)" }

    return itemName;
  }

  /** 印字確認用ダミーデータセット */
  private setDammyCompanyInfo() : CompanyInfo {

    let dammyInfo = new CompanyInfo();
    dammyInfo.companyName = "施設名最大１００文字１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０";
    dammyInfo.companyName += "１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９＊";
    dammyInfo.zipCode ="123-4567";
    dammyInfo.address = "住所　最大１００文字１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０";
    dammyInfo.address += "１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９＊";
    dammyInfo.phoneNo = "1234567890-1234567890";  // MAX:20
    dammyInfo.billingAddress = "請求先　最大６０文字１２３４５６７８９０１２３４５６７８９０"
    dammyInfo.billingAddress += "１２３４５６７８９０１２３４５６７８９０１２３４５６７８９＊" // MAX:60

    return dammyInfo;
  }

  public getLenB(text: string) : number {
    return Common.getLenB(text);
  }

  /** お名前のバイト数で文字サイズを調整する
   * @param  {string} billName お名前
   * @returns number style pattern
   */
  public judgeSetBillName(billName : string) : number {

    let suffixLen = this.getLenB(this.TitleSuffix);
    let targetLen = this.getLenB(billName);

    let lengthList : number[] = [40, 50, 60, 70, 80]

    for (let i = 0; i < lengthList.length; i++){
      if (targetLen <= (lengthList[i] + suffixLen)) return i;
    }

    return lengthList.length;
  }

  /** 領収区分をチェック
   * @param  {String} code
   * @returns boolean true:領収金額に含めない, false:領収金額に含める
   */
  private isExcluedeReceipt(code: String) : boolean {

    let info = this.M_Denominations.find(x => x.denominationCode == code)
    if (isNullOrUndefined(info)) return false;

    if (info.receiptDiv == SystemConst.RECEIPT_DIV_EXCLUDE) return true;

    return false;
  }


//#endregion

}
