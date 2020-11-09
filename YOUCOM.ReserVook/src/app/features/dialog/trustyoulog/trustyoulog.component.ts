import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TrustyouLogService } from './services/trustyoulog.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { TrustyouLog, TrustyouLogCondition } from '../../trustyou/model/trustyou.model';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD(ddd)',
  },
  display: {
    dateInput: 'YYYY/MM/DD(ddd)',
    monthYearLabel: 'YYYY年MM月',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-trustyoulog',
  templateUrl: './trustyoulog.component.html',
  styleUrls: ['./trustyoulog.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class TrustyouLogComponent implements AfterViewInit {

  private _currentUser : User;

  // ngModel
  public logList: TrustyouLog[];
  public inputDate: Date;           // ngModel
  public searchResultList : TrustyouLog[] = Array();

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  public readonly guestListColumns = [
    { name: '送信日付', prop: 'displayProcessDate', width: 100, textalign: 'left'},
    { name: '送信時刻', prop: 'displayProcessTime', width: 100, textalign: 'left'},
    { name: '送信担当者', prop: 'processUser', width: 120, textalign: 'left'},
    { name: 'メッセージ', prop: 'logMessage', width: 850, textalign: 'left'},
  ];

  constructor(private authService:AuthService
              , private trustyouLogService : TrustyouLogService
              , public dialogRef: MatDialogRef<TrustyouLogComponent>
              , @Inject(MAT_DIALOG_DATA) public data:any) {

    this._currentUser = this.authService.getLoginUser();
    this.logList = data.recvLogList;
  }

  private sleep : any

  ngOnInit(){
    // 日付初期化
    this.inputDate = new Date();

    // 呼び出し側からログリストが渡されていればそれを表示
    if(this.logList.length > 0){
      this.searchResultList = this.logList;
    }else{
      this.Search();
    }
  }

  ngAfterViewInit() {
    // 起動時描画が間に合わないので配列を入れ直して一覧をリフレッシュさせる
    this.sleep = setTimeout(function(dThis){
      dThis.searchResultList = [...dThis.searchResultList]
    }, 200, this)
  }

  ngOnDestroy(){
    clearTimeout(this.sleep);
  }

  /** 検索 */
  public Search(){

    // 検索条件
    let cond = new TrustyouLogCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.processDate = Common.ToFormatStringDate(this.inputDate);

    // 検索結果 取得
    this.trustyouLogService.getTrustyouLogList(cond).subscribe((res: TrustyouLog[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "ログ情報" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.DIALOG_TRSTYOULOG + '001'); }
      this.searchResultList = res;
    });
  }

  /**日付変更イベント */
  public onChangeDate(event: Date){
    this.inputDate = event;
    this.Search();
  }

  /** 戻る */
  public CloseDialog() {
    this.dialogRef.close();
  }
}
