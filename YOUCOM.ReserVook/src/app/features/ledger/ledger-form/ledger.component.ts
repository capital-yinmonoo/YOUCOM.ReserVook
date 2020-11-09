import { isNullOrUndefined } from 'util';
import { LedgerService } from './../services/ledger.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { User } from 'src/app/core/auth/auth.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TableColumn } from '@swimlane/ngx-datatable/lib/types/table-column.type';
import { LedgerInfo, LedgerViewInfo } from '../model/ledger.model';
import { SharedService } from '../../../core/shared.service';

@Component({
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss'],
})

export class LedgerComponent implements OnInit {

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  /**画面入力日付 */
  public inputDate: Date;

  /**売上情報 */
  public ledgerList: LedgerViewInfo[];

  /**タイトル */
  public title: string;

  /**カラムヘッダ
   * @remarks 設定値:https://swimlane.gitbook.io/ngx-datatable/api/column/inputs
  */
  public columnInputs: TableColumn[] = [
    { name: "予約番号", prop: "reserveNo"},
    { name: "部屋名", prop: "roomName"},
    { name: "利用者名", prop: "guestName"},
    { name: "人数", prop: "members"},
    { name: "泊数", prop: "stayDays"},
    { name: "金額", prop: "amountPrice"},
    { name: "内消費税", prop: "insideTaxPrice"},
  ];

  /**ログインユーザー */
  private currentUser: User;

  constructor(private router: Router,
              private ledgerService: LedgerService,
              private authService: AuthService,
              private SharedService: SharedService) {

    this.currentUser = this.authService.getLoginUser();
  }

  public ngOnInit(){
    if(!isNullOrUndefined(this.SharedService.displayDate)){
      this.inputDate = this.SharedService.displayDate;
    }else{
      this.inputDate = new Date();
    }
    this.getData();
  }

  ngOnDestroy() {
    // イベント破棄
    this.SharedService.displayDate = this.inputDate;
  }

  public getChangeDate(event: Date) {
    this.inputDate = event;
    this.getData();
  }

  /**台帳情報 取得 */
  private getData(){

    // 初期化
    this.ledgerList = new Array<LedgerViewInfo>();

    // 条件セット
    let cond = new LedgerInfo();
    cond.companyNo =  this.currentUser.displayCompanyNo;
    cond.useDate = Common.ToFormatStringDate(this.inputDate);

    // データ取得
    this.ledgerService.getLedgerReport(cond).subscribe((res: LedgerInfo[]) => {

      if(res){

        let list = new Array<LedgerViewInfo>();
        res.forEach((row) => {

          let viewRow = new LedgerViewInfo();
          viewRow.reserveNo = row.reserveNo;

          //HACK:追加機能実装時、考慮が必要
          viewRow.roomName = "";
          row.assignRoomList.forEach((roomName) => {
            if(isNullOrUndefined(roomName)) { roomName = ""; }
            viewRow.roomName += roomName + " ";
          });

          viewRow.guestName = row.guestName;
          viewRow.members = row.memberMale + row.memberFemale + row.memberChildA + row.memberChildB + row.memberChildC;

          if(row.stayDays == 0){ // 日帰り
            viewRow.stayDays = "0";
          } else { // 宿泊
            let diffDays = Common.getDateDiff(row.arrivalDate, Common.ToFormatStringDate(this.inputDate));
            if ( row.departureDate == Common.ToFormatStringDate(this.inputDate)) { // 出発日
              viewRow.stayDays = "";
            } else { // 滞在中
              viewRow.stayDays = (diffDays + 1).toString()  + "/" + row.stayDays.toString();
            }
          }

          viewRow.amountPrice = row.amountPrice;
          viewRow.insideTaxPrice = row.insideTaxPrice;

          list.push(viewRow);

        });

        this.ledgerList = list; //直接pushすると表示されないので,workListに入れたものをセットする

      } else {
        Common.modalMessageError(Message.TITLE_ERROR, "台帳情報" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.LEDGER + '001');
        return;
      }

    });

  }

  public onClickReserveNo(reserveNo: string){
    this.router.navigate(["/company/reserve/", reserveNo]);
  }

}
