import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UseResultsService } from './services/useresults.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { UseResultsInfo } from './model/useresults.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-useresults',
  templateUrl: './useresults.component.html',
  styleUrls: ['./useresults.component.scss']
})
export class UseResultsComponent implements AfterViewInit {

  private _currentUser : User;

  // ngModel
  public customerNo: string;
  public customerName: string;
  public searchResultList : UseResultsInfo[] = Array();

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  public readonly guestListColumns = [
    { name: '予約番号', prop: 'reserveNo', width: 200, textalign: 'left'},
    { name: '到着日', prop: 'displayArrivalDate', width: 200, textalign: 'left'},
    { name: '出発日', prop: 'displayDepartureDate', width: 200, textalign: 'left'},
    { name: '利用金額', prop: 'useAmount', width: 220, textalign: 'right'},
  ];

  constructor(private router: Router
              , private authService:AuthService
              , private useResultsService : UseResultsService
              , public dialogRef: MatDialogRef<UseResultsComponent>
              , @Inject(MAT_DIALOG_DATA) public data:any) {

    this._currentUser = this.authService.getLoginUser();
    this.customerNo = data.customerNo;
    this.customerName = data.customerName;
  }

  private sleep : any

  ngOnInit(){
    this.Search();
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
    let cond = new UseResultsInfo();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.customerNo = this.customerNo;

    // 検索結果 取得
    this.useResultsService.getUseResultsList(cond).subscribe((res: UseResultsInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "利用実績" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.DIALOG_USERESULTS + '001'); }
      this.searchResultList = res;
    });
  }

  /** 戻る */
  public CloseDialog() {
    this.dialogRef.close();
  }

  public onClickReserveNo(reserveNo: string){

    this.dialogRef.close();

    this.router.navigate(["/company/reserve/", reserveNo]);
  }

}
