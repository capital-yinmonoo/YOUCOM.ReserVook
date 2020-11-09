import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from '../../../core/system.const';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.model';
import { SalesReportInfo, SalesReportCondition } from '../model/salesreport.model';
import { SalesReportService } from '../services/salesreport.service';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TableColumn } from '@swimlane/ngx-datatable/lib/types/table-column.type';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import { FormControl, FormBuilder } from '@angular/forms';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM',
  },
  display: {
    dateInput: 'YYYY/MM',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  templateUrl: './salesmonthlyreport.component.html',
  styleUrls: ['./salesmonthlyreport.component.scss'],
  providers: [{
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class SaleMonthlyReportComponent implements OnInit, OnDestroy{

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  /**画面入力日付 */
  public inputDate: Date;
  private wkDate = new Date();
  public yearMonth = new FormControl();
  public headerForm = this.formBuilder.group({
    yearMonth: this.yearMonth,
  });

  /**売上入金情報 */
  public dataList: SalesReportInfo[];

  /**売上情報 */
  public salesList: SalesReportInfo[];
  /**売上分類毎合計情報 */
  public salesSubTotal: SalesReportInfo[];

  /**入金情報 */
  public depositList: SalesReportInfo[];
  /**入金分類毎合計情報 */
  public depositTotal: SalesReportInfo[];

  /**カラムヘッダ */
  public mainTableColumn: TableColumn[] = [
    { name: "商品分類", prop: "itemDivisionName"},
    { name: "商品コード", prop: "itemCode"},
    { name: "商品名", prop: "printName"},
    { name: "基本単価", prop: "unitPrice"},
    { name: "数量", prop: "itemNumber"},
    { name: "金額", prop: "netAmount"},
    { name: "内消費税", prop: "insideTaxPrice"},
    { name: "内サービス料", prop: "insideServicePrice"},
    { name: "外サービス料", prop: "outsideServicePrice"},
    { name: "合計金額", prop: "amountPrice"},
  ];

  /**ログインユーザー */
  private currentUser: User;

  private element: HTMLElement;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private salesReportService: SalesReportService,
              private authService: AuthService,
              private elementRef: ElementRef,
              private formBuilder: FormBuilder,) {

    this.currentUser = this.authService.getLoginUser();
    this.element = this.elementRef.nativeElement;
  }
  ngOnDestroy(): void {
    this.headerForm = null;
  }

  ngOnInit(): void {
    this.inputDate = new Date();
    this.getData();
  }

  public chosenYearHandler(normalizedYear: Moment) {
    this.wkDate.setFullYear(normalizedYear.year());
  }

  public chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.wkDate.setMonth(normalizedMonth.month());
    this.getChangeDate(this.wkDate);
    datepicker.close();
  }

  public getChangeDate(event: Date) {
    this.inputDate = event;
    this.getData();
  }

  /**売上情報 取得 */
  private getData(){

    this.yearMonth.setValue(this.inputDate);

    // 条件セット
    const cond: SalesReportCondition = {
      companyNo: this.currentUser.displayCompanyNo,
      useDate: Common.ToFormatStringDate(this.inputDate),
      monthlyFlag: true,
    };

    // データ取得
    this.salesReportService.getSalesReport(cond).subscribe((res: SalesReportInfo[]) => {

      if(res){

        this.dataList = res;
        this.salesList = this.dataList.filter(f => f.depositFlag == false);
        this.depositList = this.dataList.filter(f => f.depositFlag == true);
        this.calcTotal();

      } else {
        Common.modalMessageError(Message.TITLE_ERROR, "売上情報" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.SALESREPORT_MONTHLY + '001');
        return;
      }

    });

  }

  /**合計計算 */
  private calcTotal() {

    // 初期化
    let calcSalesTotal = this.initTotalInfo("売上総合計");
    let calcDepositTotal = this.initTotalInfo("入金総合計");

    let isFirst = true;
    let wkitemDivisionName: string;
    let wkSubtotalList = new Array<SalesReportInfo>();
    let calcSubTotal = new SalesReportInfo();

    this.dataList.forEach((row) => {

      // 初回ブレイク
      if(isFirst){
        wkitemDivisionName = row.itemDivisionName;
        calcSubTotal = this.initTotalInfo(row.itemDivisionName + "計");
        isFirst = false;
      }

      if(row.depositFlag) {
        // 入金合計
        calcDepositTotal.amountPrice += row.amountPrice;
        calcDepositTotal.netAmount += row.netAmount;
        calcDepositTotal.insideServicePrice += row.insideServicePrice;
        calcDepositTotal.insideTaxPrice += row.insideTaxPrice;
        calcDepositTotal.outsideServicePrice += row.outsideServicePrice;
        calcDepositTotal.itemNumber += row.itemNumber;

      } else {

        // 商品区分毎合計
        if(wkitemDivisionName == row.itemDivisionName){
          calcSubTotal.amountPrice += row.amountPrice;
          calcSubTotal.netAmount += row.netAmount;
          calcSubTotal.insideServicePrice += row.insideServicePrice;
          calcSubTotal.insideTaxPrice += row.insideTaxPrice;
          calcSubTotal.outsideServicePrice += row.outsideServicePrice;
          calcSubTotal.itemNumber += row.itemNumber;

        } else {
          wkSubtotalList.push(calcSubTotal);
          calcSubTotal = this.initTotalInfo(row.itemDivisionName + "計");

          calcSubTotal.amountPrice += row.amountPrice;
          calcSubTotal.netAmount += row.netAmount;
          calcSubTotal.insideServicePrice += row.insideServicePrice;
          calcSubTotal.insideTaxPrice += row.insideTaxPrice;
          calcSubTotal.outsideServicePrice += row.outsideServicePrice;
          calcSubTotal.itemNumber += row.itemNumber;

          wkitemDivisionName = row.itemDivisionName;
        }

        // 総合計
        calcSalesTotal.amountPrice += row.amountPrice;
        calcSalesTotal.netAmount += row.netAmount;
        calcSalesTotal.insideServicePrice += row.insideServicePrice;
        calcSalesTotal.insideTaxPrice += row.insideTaxPrice;
        calcSalesTotal.outsideServicePrice += row.outsideServicePrice;
        calcSalesTotal.itemNumber += row.itemNumber;
      }

    });
    wkSubtotalList.push(calcSubTotal);

    // 直接pushすると表示されないため、ワークリストに一旦入れてセットする
    wkSubtotalList.push(calcSalesTotal);
    this.salesSubTotal = wkSubtotalList;

    let wklist = new Array<SalesReportInfo>();
    wklist.push(calcDepositTotal);
    this.depositTotal = wklist;

  }

  private initTotalInfo(title: string): SalesReportInfo{
    let info = new SalesReportInfo();
    info.printName = title;
    info.amountPrice = 0;
    info.netAmount = 0;
    info.insideServicePrice = 0;
    info.insideTaxPrice = 0;
    info.outsideServicePrice = 0;
    info.itemNumber = 0;

    return info;
  }

  /**CSV出力 */
  public exportCSV() {
    const fileName = "売上月報" + Common.ToFormatStringDate(this.inputDate).substring(0, 6);
    const data = this.dataList;
    let csv = "\ufeff";

    // headers
    for (let i = 0; i < this.mainTableColumn.length; i++) {
      const column = this.mainTableColumn[i].name;
      csv += "\"" + column + "\"";
      if (i < (this.mainTableColumn.length - 1)) {
        csv += ",";
      }
    }

    // body
    data.forEach((record) => {
      csv += "\n";
      for (let i = 0; i < this.mainTableColumn.length; i++) {
        const column = this.mainTableColumn[i].prop.toString();
        csv += "\"" + record[column] + "\"";
        if (i < (this.mainTableColumn.length - 1)) {
          csv += ",";
        }
      }
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;"});
    const url = window.URL.createObjectURL(blob);
    const link: HTMLAnchorElement = this.element.querySelector('#csv-download') as HTMLAnchorElement;
    link.href = url;
    link.download = fileName + ".csv";
    link.click();

  }
}

