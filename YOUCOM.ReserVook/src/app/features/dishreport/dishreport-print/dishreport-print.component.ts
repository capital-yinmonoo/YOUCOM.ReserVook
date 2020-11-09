import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { ColumnProperty, RowInfoProperty } from './../model/dishreport.model';
import { PrintPage } from 'src/app/core/system.const';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/layout/header/header.service';
import moment from 'moment';
import { DishInfo as DishReportList } from '../../dishreport/model/dishreport.model';
import { DishReportService } from '../../dishreport/services/dishreport.service';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'dishreport-print',
  templateUrl: './dishreport-print.component.html',
  styleUrls: ['./dishreport-print.component.scss']
})

export class DishreportPrintComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly listURL = '/company/dishreport';

  /** 1ページ当たりの行数 */
  private readonly printRowCount = 25;

  /** 料理日報 一覧情報(一覧画面から受取) */
  private _data: DishReportList[];
  /** 対象日付(開始日) (一覧画面から受取) */
  private _fromDate: Date;
  /** 表示範囲(日) (一覧画面から受取) */
  private _days: number;
  /** ヘッダ情報 (一覧画面から受取) */
  public _header: ColumnProperty[];

  /** 開始日 (印刷用) */
  public printFromDate: string;
  /** 終了日 (印刷用) */
  public printToDate: string;
  /** 印刷データ(印刷用にPage, Row, Colの3次構造) */
  public printList: RowInfoProperty[][][] = [];
  /** 印刷日時 */
  public printDateTime: string;

  constructor(private router: Router
              , private header: HeaderService
              , public dishreportService: DishReportService) {

    this._fromDate = this.dishreportService.printDate;
    this._days = this.dishreportService.days;
    this._header = this.dishreportService.header;
    this._data = this.dishreportService.data;
  }

  ngOnInit(): void {

    moment.locale("ja");  // 曜日を日本語表記にする
    this.printDateTime = moment().format('llll');  // YYYY年M月D日(ddd) hh:mm

    this.setPrintMode(true);

    if(!isNullOrUndefined(this._data)){
      this.setData();
    }else{
      // データがなければ一覧に戻る
      this.router.navigate([this.listURL]);
    }
  }

  /** 現在のコンポーネントを生成したとき */
  ngAfterViewInit(){

    Common.setPrintPage(document, PrintPage.A4_LANDSCAPE);

    setTimeout( () => {
      window.print(); // 印刷ダイアログ
      this.router.navigate([this.listURL]); // 印刷したら戻る
    }, 100);
  }

  /** 画面を閉じる際にデータをクリア */
  ngOnDestroy(){
    this.setPrintMode(false);
    this.dishreportService.header = null;
    this.dishreportService.data = null;
  }

  /** 印刷モードを設定 */
  private setPrintMode(printMode: boolean){
    if(printMode){
      this.header.hide(); // ヘッダを隠す
    }else{
      this.header.show(); // ヘッダを再表示
    }
  }

  /** 受け取ったデータを表示用に整形 */
  private setData(){

    // ヘッダ 日付セット
    this.printFromDate = moment(this._fromDate).format('YYYY年M月D日(ddd)');
    this.printToDate = moment(this._fromDate).add("day", this._days - 1).format('YYYY年M月D日(ddd)');

    let rowCount = 0;
    let pageInfo: RowInfoProperty[][] = [];
    let rowInfo: RowInfoProperty[] = [];

    this._data.forEach(x => {

      let isFirstLoop: boolean = true;
      let dishDayInfoIdx: number = 0;

      for(let i = 0; i < this._header.length; i++) {
        switch(this._header[i].prop) {
          case 'mealDivisionName':
            rowInfo.push({ prop: this._header[i].prop, value: x.mealDivisionName });
            break;

          case 'mealName':
            rowInfo.push({ prop: this._header[i].prop, value: x.mealName });
            break;

          case 'sumMealNumber':
            rowInfo.push({ prop: this._header[i].prop, value: x.sumMealNumber.toLocaleString() });
            break;

          case 'dishDayInfo':
            if(isFirstLoop) {
              dishDayInfoIdx -= i;
              isFirstLoop = false;
            }
            rowInfo.push({ prop: this._header[i].prop, value: x.dishDayInfo[dishDayInfoIdx + i].mealNumber.toLocaleString() });
            break;
        }
      }

      pageInfo.push(rowInfo);
      rowCount++;
      rowInfo = [];

      // 改ページ判定
      if(rowCount == this.printRowCount){
        rowCount = 0;
        this.printList.push(pageInfo);
        pageInfo =[];
      }

    });

    // 最終ページの内容をセット
    if(rowCount != 0){
      this.printList.push(pageInfo);
    }

  }

}
