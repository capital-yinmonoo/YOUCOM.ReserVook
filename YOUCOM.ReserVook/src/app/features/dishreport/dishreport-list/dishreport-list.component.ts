import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DishReportService } from '../services/dishreport.service';
import { DishInfo, DishReportCondition, ColumnProperty } from '../model/dishreport.model';
import { SystemConst } from 'src/app/core/system.const';
import moment from 'moment';

@Component({
  selector: 'app-dishreport-list',
  templateUrl: './dishreport-list.component.html',
  styleUrls: ['./dishreport-list.component.scss'],
})
export class DishReportListComponent implements OnInit {

  //#region ---- readonly ----
  /** 印刷画面URL */
  private readonly printURL: string = '/company/dishreport/print';

  /** 表示する日付範囲(日数) */
  private readonly displayDays: number = 7;

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  public readonly ngx_table_sumrow_messages = {
    'emptyMessage': '',
  };

  /** 表示用カラム */
  public readonly displayColumns: ColumnProperty[] = [
    { name: '料理区分', width: 20, prop: 'mealDivisionName'},
    { name: '料理名', width: 200, prop: 'mealName'},
    { name: '合計数', width: 20, prop: 'sumMealNumber'},
  ];

  /** 表示用カラム(日) */
  public displayDayColumns: ColumnProperty[];
  //#endregion

  /** ログインユーザー情報 */
  private currentUser: User;

  /** 画面入力日 */
  public inputDate: Date;

  /** 料理日報リスト */
  public dishReportList: DishInfo[];
  /** 料理日報合計 */
  public dishReportSum: DishInfo[];

  constructor(private router: Router
              , private authService: AuthService
              , public dishreportService: DishReportService) {

    this.currentUser = this.authService.getLoginUser();

  }

  ngOnInit(): void {

    moment.locale("ja");

    // 日付初期化(System Date)
    this.inputDate = new Date();

    // 料理日報データ取得
    this.getData();

  }

  /** 日付変更 */
  public onChangeDate(event: Date) {
    this.inputDate = event;
    this.getData();
  }

  /** 料理日報データ取得 */
  public getData() {

    // 終了日付取得
    const wkDate = moment(this.inputDate);
    const endDate = wkDate.add(this.displayDays - 1, 'day').format(SystemConst.DATE_FORMAT_YYYYMMDD);

    // 検索条件セット
    const cond: DishReportCondition = {
      companyNo: this.currentUser.displayCompanyNo
      , fromUseDate: Common.ToFormatStringDate(this.inputDate)
      , toUseDate: endDate
    };

    // データ取得
    this.dishreportService.getDishReportList(cond).subscribe((res : DishInfo[]) => {
      this.dishReportList = res;

      // 合計行は別リストにセット
      this.dishReportSum = this.dishReportList.filter(f => f.itemCode == '');
      this.dishReportList.pop();

    });

    // 表示用カラム(日)をセット
    this.setDayColumn();

  }

  /** 表示用カラム(日)をセット */
  private setDayColumn(){

    this.displayDayColumns = [];

    for(let i = 0; i < this.displayDays; i++) {

      const name = moment(this.inputDate).add(i, 'day').format("YY/MM/DD (ddd)");

      let wkColumn: ColumnProperty = { name: name, width: 40, prop: 'dishDayInfo'};

      this.displayDayColumns.push(wkColumn);
    }

  }

  /** 印刷 */
  public print() {

    this.dishreportService.printDate = this.inputDate;
    this.dishreportService.days = this.displayDays;
    this.dishreportService.header = this.displayColumns.concat(this.displayDayColumns);
    this.dishreportService.data = this.dishReportList.concat(this.dishReportSum);

    this.router.navigate([this.printURL]);
  }

  /** 印刷可否 */
  public printable(): boolean {
    if (isNullOrUndefined(this.dishReportList) || this.dishReportList.length == 0) {
      return false;
    } else {
      return true;
    }
  }

}
