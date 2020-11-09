import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ReserveLogService } from './services/reservelog.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { ReserveLogInfo, processDivision } from './model/reservelog.model';

@Component({
  selector: 'app-reservelog',
  templateUrl: './reservelog.component.html',
  styleUrls: ['./reservelog.component.scss']
})
export class ReserveLogComponent implements OnInit, AfterViewInit, OnDestroy {

  /** ログインユーザー情報 */
  private currentUser: User;

  // ngModel
  public reserveNo: string;
  public reserveLogList: ReserveLogInfo[] = [];

  /** timerイベントクリア用変数 */
  private sleep: any;

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  /** テーブル列情報 */
  public readonly reserveLogListColumns = [
    { name: '日付', prop: 'changeDate', width: 110, textalign: 'left'},
    { name: '時刻', prop: 'changeTime', width: 100, textalign: 'left'},
    { name: '担当者', prop: 'creator', width: 150, textalign: 'left'},
    { name: '区分', prop: 'processDivName', width: 50, textalign: 'left'},
    { name: '変更項目', prop: 'changeItem', width: 150, textalign: 'left'},
    { name: '変更前', prop: 'beforeValue', width: 450, textalign: 'left'},
    { name: '変更後', prop: 'afterValue', width: 450, textalign: 'left'},
  ];

  constructor(private authService: AuthService
              , private reserveLogService: ReserveLogService
              , public dialogRef: MatDialogRef<ReserveLogComponent>
              , @Inject(MAT_DIALOG_DATA) public data: any) {

    this.currentUser = this.authService.getLoginUser();
    this.reserveNo = data.reserveNo;
  }

  //#region ---- Event Method ----
    ngOnInit() {
      this.getData();
    }

    ngAfterViewInit() {
      // 起動時描画が間に合わないので配列を入れ直して一覧をリフレッシュさせる
      this.sleep = setTimeout(function(dThis){
        dThis.reserveLogList = [...dThis.reserveLogList]
      }, 200, this)
    }

    ngOnDestroy() {
      clearTimeout(this.sleep);
    }
  //#endregion

  //#region ---- Data Access ----
    /** データ取得 */
    private getData(){

      // 検索条件
      let cond = new ReserveLogInfo();
      cond.companyNo = this.currentUser.displayCompanyNo;
      cond.reserveNo = this.reserveNo;

      // 検索結果 取得
      this.reserveLogService.getList(cond).subscribe((res: ReserveLogInfo[]) => {

        if (res == null) {
          Common.modalMessageError(Message.TITLE_ERROR, "予約変更履歴" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.DIALOG_RESERVELOG + '001');
        }
        else {
          this.reserveLogList = res;

          this.reserveLogList.forEach(f => {

            f.changeDate = f.cdt.substring(0, 4) + "/" + f.cdt.substring(4, 6) + "/" + f.cdt.substring(6, 8);
            f.changeTime = f.cdt.substring(9, 11) + ":" + f.cdt.substring(11, 13) + ":" + f.cdt.substring(13, 15);
            switch (f.processDivision) {
              case processDivision.Add.toString():
                f.processDivName = "追加";
                break;
              case processDivision.Update.toString():
                f.processDivName = "変更";
                break;
              case processDivision.Delete.toString():
                f.processDivName = "削除";
                break;
              default:
                Common.modalMessageError(Message.TITLE_ERROR, "予約変更履歴" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.DIALOG_RESERVELOG + '002').then(t => {this.closeDialog()});
            }
          });

        }

      });
    }
  //#endregion

  /** 戻る */
  public closeDialog() {
    this.dialogRef.close();
  }

  /** 1行おきに背景色を付ける */
  public getRowClass = (row: any) => {
    return {
      'row-color': row.seqGroup % 2 === 0
    };
  }

}
