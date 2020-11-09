import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { GuestSearchService } from './services/guestsearch.service';
import { User } from 'src/app/core/auth/auth.model';
import { GuestInfo } from '../../reserve/model/reserve.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';

@Component({
  selector: 'app-guestsearch',
  templateUrl: './guestsearch.component.html',
  styleUrls: ['./guestsearch.component.scss']
})
export class GuestSearchComponent implements AfterViewInit {

  private _currentUser : User;

  // ngModel
  public phone: string;
  public guestNameKana: string;
  public currentPage : number;

  public searchResultList : GuestInfo[] = Array();

  /** ラベル 区切り文字 */
  public readonly PrefixDelimiter = ":";

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  public readonly guestListColumns = [
    { name: '', prop: 'select', width: 100, textalign: 'center'},
    { name: '顧客番号', prop: 'customerNo', width: 150, textalign: 'left'},
    { name: '利用者名', prop: 'guestName', width: 250, textalign: 'left'},
    { name: 'フリガナ', prop: 'guestNameKana', width: 250, textalign: 'left'},
    { name: '電話番号', prop: 'phone', width: 175, textalign: 'left'},
    { name: '携帯電話', prop: 'cellphone', width: 175, textalign: 'left'},
    { name: '会社名', prop: 'companyName', width: 300, textalign: 'left'},
    { name: '郵便番号', prop: 'zipCode', width: 100, textalign: 'left'},
    { name: '住所', prop: 'address', width: 500, textalign: 'left'},
    { name: 'メール', prop: 'email', width: 350, textalign: 'left'},
  ];

  constructor(private authService:AuthService
              , private guestSearchService : GuestSearchService
              , public dialogRef: MatDialogRef<GuestSearchComponent>
              , @Inject(MAT_DIALOG_DATA) public data: GuestInfo) {

    this._currentUser = this.authService.getLoginUser();
    this.phone = data.phone;
    this.guestNameKana = data.guestNameKana;
  }

  private sleep : any

  ngOnInit(){
    // 条件が入力されていれば起動時に検索実行
    if(this.phone.length > 0 || this.guestNameKana.length > 0){
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
    let cond = new GuestInfo();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.phone = this.phone;
    cond.guestNameKana = this.guestNameKana;

    // 検索結果 取得
    this.guestSearchService.getGuestInfoList(cond).subscribe((res: GuestInfo[]) => {
      if (res == null) { Common.modalMessageError(Message.TITLE_ERROR, "利用者一覧" + Message.GET_DATA_FAULT, MessagePrefix.ERROR + FunctionId.DIALOG_GUESTSEARCH + '001'); }
      this.searchResultList = res;
    });

  }

  /** クリア */
  public Clear(){
    this.phone = '';
    this.guestNameKana = '';
  }

  /** 戻る */
  public CloseDialog() {
    this.dialogRef.close();
  }
}
