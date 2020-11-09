import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TrustyouService } from '../services/trustyou.service';
import { Trustyou, TrustyouCondition, TrustyouListColumn, TrustyouSendRecvCondition, TrustyouLog } from '../model/trustyou.model';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';
import { MatDialog } from '@angular/material';
import { TrustyouLogComponent } from '../../dialog/trustyoulog/trustyoulog.component';

@Component({
  selector: 'app-trustyou-list',
  templateUrl: './trustyou-list.component.html',
  styleUrls: ['./trustyou-list.component.scss'],
})

export class TrustyouListComponent implements OnInit {

  //#region ----- readonly --------------------------------------------------
  public readonly rowCount = 15;
  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
  };
  //#endregion

  editing = {};
  selected = [];
  selectedBefore = [];

  private _currentUser : User;        // ログインユーザー
  public inputDateFrom: Date;         // ngModel
  public inputDateTo: Date;           // ngModel
  public displayColumns = [];         // 表示用カラム
  public trustyouList: Trustyou[];    // データ
  public trustyouLogList: TrustyouLog[];  // データ

  /** 一覧の幅切替 */
  get viewStyle() {
    return{
      'width':  '100%',
    };
  }

  constructor(private router: Router
              , private authService: AuthService
              , public trustyouService: TrustyouService
              , public dialog: MatDialog) {
  }

  ngOnInit(): void {

    this._currentUser = this.authService.getLoginUser();
    this.SetColumns();

    // 日付初期化
    this.inputDateFrom = new Date();
    this.inputDateTo = new Date();

    // TrustYou連携データリスト取得
    this.getTrustyouList();

  }

  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.trustyouList[rowIndex][cell] = event.target.value;
    this.trustyouList = [...this.trustyouList];
    console.log('UPDATED!', this.trustyouList[rowIndex][cell]);
  }

  onSelect({selected}) {

    if (selected == undefined) return;

    // 以前のゴミデータが選択されることがあるので、trustyouListにないデータがselectedで来たら除外する
    let wkSelected: Array<Trustyou> = [];
    for(let x = 0; x < selected.length; x++){
      const idx = this.trustyouList.findIndex(f => f.companyNo == selected[x].companyNo
                                    && f.reserveNo == selected[x].reserveNo
                                    && f.arrivalDate == selected[x].arrivalDate
                                    && f.departureDate == selected[x].departureDate
                                    && f.roomNo == selected[x].roomNo
                                    && f.version == selected[x].version
                                    && f.udt == selected[x].udt);
      if (idx > -1) { wkSelected.push(selected[x]); }
    }
    selected = wkSelected;

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);


    if (this.selectedBefore.length > this.selected.length){
      // チェックを外した
      var removeRowSeq;

      if(this.selected.length == 0){
        // チェックを入れているデータなし → 全てFalseに変更
        this.trustyouList.map(x => x.isChecked = false);
      }else{
        for (var i = 0; i < this.selectedBefore.length; i++){
          var selectedInfo = this.selected[i];
          var selectedBeforeInfo = this.selectedBefore[i];

          if(selectedInfo == undefined || selectedInfo.seq != selectedBeforeInfo.seq){
            removeRowSeq = selectedBeforeInfo.seq;
            continue;
          }
        }
        this.trustyouList[removeRowSeq]["isChecked"] = false;
        this.trustyouList = [...this.trustyouList];
      }
    }else{
      // チェックを入れた
      var addRowSeq;

      if(this.selected.length == this.trustyouList.length){
        // チェックを入れたデータ件数と取得データ件数が同じ→全てTrueに変更
        this.trustyouList.map(x => x.isChecked = true);
      }else{
        for (var i = 0; i < this.selected.length; i++){
          var selectedInfo = this.selected[i];
          var selectedBeforeInfo = this.selectedBefore[i];

          if(selectedBeforeInfo == undefined || selectedInfo.seq != selectedBeforeInfo.seq){
            addRowSeq = selectedInfo.seq;
            continue;
          }
        }
        this.trustyouList[addRowSeq]["isChecked"] = true;
        this.trustyouList = [...this.trustyouList];
      }
    }

    this.selectedBefore.splice(0, this.selectedBefore.length);
    this.selectedBefore.push(...selected);
  }

  public SetColumns(){

    this.displayColumns = [
      { name: '状態', width: 20, prop: TrustyouListColumn.DisplayStatus , visible: true},
      { name: '到着日', width: 60, prop: TrustyouListColumn.DisplayArrivalDate, visible: true},
      { name: '出発日' ,width: 60, prop: TrustyouListColumn.DisplayDepartureDate, visible: true},
      { name: '予約番号' , width: 50, prop: TrustyouListColumn.ReserveNo, visible: true},
      { name: '部屋番号' , width: 35, prop: TrustyouListColumn.RoomNo, visible: true},
      { name: '宿泊者名(元)' , width: 150, prop: TrustyouListColumn.OutGuestName, visible: true},
      { name: 'EMail(元)', width: 200, prop: TrustyouListColumn.OutEmail, visible: true},
      { name: '宿泊者名', width: 150, prop: TrustyouListColumn.SendGuestName, visible: true},
      { name: 'EMail', width: 200, prop: TrustyouListColumn.SendEmail, visible: true},
      { name: '結果', width: 30, prop: TrustyouListColumn.DisplaySendResult, visible: true},
      { name: '送信日時', width: 130, prop: TrustyouListColumn.SendDateTime, visible: true},
    ];
  }

  /** TrustYou連携データリスト取得 */
  public getTrustyouList(){
    var cond = new TrustyouCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.useDateFrom = Common.ToFormatStringDate(this.inputDateFrom);
    cond.useDateTo = Common.ToFormatStringDate(this.inputDateTo);

    // 開始日付＞終了日付の場合、エラー
    if(cond.useDateFrom <= cond.useDateTo){
      // 指定期間内にチェックアウトした(客室状態＝CO、清掃開始、清掃済)のアサインデータ(TrustYou連携テーブルとジョイン)を取得
      this.trustyouService.getTrustyouList(cond).subscribe((result : Trustyou[]) => {
        this.trustyouList = result;

        // 初期値は全てチェックなし
        this.trustyouList.map(x => x.isChecked = false);

        // 送信用宿泊者名・EMailは空なら、チェックアウト時のものをセット
        this.trustyouList.forEach((value) => {
          if(value.sendGuestName == null || value.sendGuestName == ""){
            value.sendGuestName = value.outGuestName;
          }
          if(value.sendEmail == null || value.sendEmail == ""){
            value.sendEmail = value.outEmail;
          }
        });
      });
    }else{
      Common.modalMessageWarning(Message.TITLE_WARNING, '期間の指定が不正です。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '001');
    }
  }

  // ログダイアログを表示
  public OpenLog(isButtonClicked : boolean){
    var brankList = [];
    let dialogRef = this.dialog.open(TrustyouLogComponent
      , { width: '90vw', height: 'auto'
          , data: {recvLogList:  isButtonClicked ? brankList : this.trustyouLogList}
      });
  }

  public TemporarilySave(){
    // 画面に入力された内容でTrustYou連携データテーブルを登録・更新

    // 送信パラメーターセット
    var tempList = this.trustyouList;
    tempList.map(x => x.processUser = this._currentUser.userName);

    // データ一時保存処理
    this.trustyouService.saveTemporarilyData(tempList).subscribe((result : number) => {

      if(result > 0){
        Common.modalMessageSuccess(Message.TITLE_SUCCESS, '入力内容を保存しました', MessagePrefix.SUCCESS + FunctionId.TRUSTYOU + '001');
      }

      // 一覧を再描画
      this.getTrustyouList();
    });

  }

  // 連携データの送信
  public SendData(isCanceled : boolean){

    // 選択データのチェック
    if(!this.CheckSelectedData(isCanceled)){
      return;
    }

    // 送信パラメーターセット
    var sendDataList = this.trustyouList.filter(x => x.isChecked == true);
    sendDataList.map(x => x.sendGuestName.trim());
    sendDataList.map(x => x.sendEmail.trim());
    sendDataList.map(x => x.processUser = this._currentUser.userName);

    var sendRecvDond = new TrustyouSendRecvCondition;
    sendRecvDond.sendDataList = sendDataList;
    sendRecvDond.isCanceled = isCanceled;

    // データ送信処理
    this.trustyouService.sendRecvTrustyouData(sendRecvDond).subscribe((result : TrustyouLog[]) => {
      this.trustyouLogList = result;

      // データ送信結果を子画面で表示
      this.OpenLog(false);

      // 一覧を再描画
      this.getTrustyouList();
    });
  }

  //選択したデータのチェック
  private CheckSelectedData(isCanceled : boolean) : boolean {

    // チェックが1件もされていない場合、エラー
    if(!this.trustyouList.some(x => x.isChecked == true)){
      Common.modalMessageWarning(Message.TITLE_WARNING, '対象となるデータ件数が0件のため、送信出来ません。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '002');
      return false;
    }

    if(isCanceled){
      // チェックが入っているデータで、状態が「未」の場合、エラー
      if(this.trustyouList.some(x => x.isChecked == true && x.status != "9" && (x.sendResult == "" || x.sendResult == null))){
        Common.modalMessageWarning(Message.TITLE_WARNING, '未送信データがキャンセル対象となっています。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '003');
        return false;
      }
    }

    // チェックが入っているデータで、同一メールアドレスがある場合、エラー
    var checkList = this.trustyouList.filter(x => x.isChecked == true);
    var group = checkList.reduce((result, current) => {
      const element = result.find((p) => p.sendEmail === current.sendEmail);
      if (element) {
        element.count ++; // count
      } else {
        result.push({
          sendEmail: current.sendEmail,
          count: 1,
        });
      }
      return result;
    }, []);

    if(group.some(x => x.sendEmail != "" && x.count >= 2)){
      Common.modalMessageWarning(Message.TITLE_WARNING, '同一Emailのデータが複数チェックされています。<br>1つのメールアドレスに対して、<br>送信できるデータは1つまでです。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '004');
      return false;
    }

    // チェックが入っているデータで、メールアドレス・宿泊者名のどちらかが空の場合、エラー
    var blankList = checkList.filter(x => ((x.sendEmail == "" || x.sendEmail == null) || (x.sendGuestName == "" || x.sendGuestName == null)));

    if(blankList != undefined && blankList.length > 0){
      if(blankList[0].sendGuestName == ""){
        Common.modalMessageWarning(Message.TITLE_WARNING, '宿泊者名が空のデータがあるため、送信出来ません。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '005');
        return false;
      }else{
        Common.modalMessageWarning(Message.TITLE_WARNING, 'EMailが空のデータがあるため、送信出来ません。', MessagePrefix.WARNING + FunctionId.TRUSTYOU + '006');
        return false;
      }
    }

    // 全チェックがOKの場合のみTrue
    return true;
  }

  public setBackgroundColor(row) : string{
    if(row.hasTempData) {
      return "rgb(200, 200, 200)";
    }else{
      return "rgb(255, 255, 255)";
    }
  }

  getRowClass = (row) => {
    return {
      'row-color': row.hasTempData
    };
  }

}
