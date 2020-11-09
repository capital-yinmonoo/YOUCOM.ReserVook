import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../core/auth/auth.model';
import { AuthService } from '../../../core/auth/auth.service';
import { DataImportService } from '../services/dataimport.service';
import { CustomerData, ReserveData, ResultData } from '../model/dataimport.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix } from 'src/app/core/system.const';

enum ImportType {
  Reserve,
  Customer
};

@Component({
  selector: 'app-dataimport',
  templateUrl: './dataimport.component.html',
  styleUrls: ['./dataimport.component.scss']
})


export class DataImportComponent implements OnInit {

  public readonly headerRowCount = 3;
  public readonly reserveColumnsCount = 20;
  public readonly customerColumnsCount = 13;

  @ViewChild('fileInputReserve', {static: false})
  public fileInputReserve;
  @ViewChild('fileInputCustomer', {static: false})
  public fileInputCustomer;
  public fileReserve: File = null;
  public fileCustomer: File = null;

  public reserveList : ReserveData[];
  public customerList : CustomerData[];

  csvSeparator = ",";
  reserveFilename = "予約情報_テンプレート";
  customerFilename = "顧客情報_テンプレート";
  reserveHeadcolumns = [
    '到着日','泊数','出発日','予約日','大人男','大人女','子供A','子供B','子供C',
    '取扱先','取扱先備考','電話番号','携帯電話','利用者名','フリガナ','会社名','郵便番号','メール','住所','顧客番号'
  ];

  reserveRequiredcolumns = [
    '必須','必須','必須','必須','必須','必須','必須','必須','必須',
    '任意','任意','必須','任意','必須','必須','任意','任意','任意','任意','任意',
  ];

  reserveDescriptioncolumns = [
    'yyyyMMdd形式(8桁)','0～100','yyyyMMdd形式(8桁)','yyyyMMdd形式(8桁)','0～999','0～999','0～999','0～999','0～999',
    'エージェントコードを入力','100文字以内','数字・ハイフンのみ','数字・ハイフンのみ','50文字以内','50文字以内',
    '50文字以内','xxx-xxxx形式','60文字以内','100文字以内','顧客番号(8桁)を入力',
  ];

  customerHeadcolumns = [
    '顧客名','顧客名カナ','郵便番号','住所','電話番号','携帯電話番号','メールアドレス','会社名','備考1','備考2','備考3','備考4','備考5',
  ];

  customerRequiredcolumns = [
    '必須','必須','任意','任意','必須','任意','任意','任意','任意','任意','任意','任意','任意',
  ];

  customerDescriptioncolumns = [
    '50文字以内','50文字以内','xxx-xxxx形式','100文字以内','数字・ハイフンのみ','数字・ハイフンのみ',
    '60文字以内','50文字以内','100文字以内','100文字以内','100文字以内','100文字以内','100文字以内',
  ];

  private _currentUser : User;
  constructor(private router: Router
              , private dataImportService: DataImportService
              , private authService:AuthService) {

    this._currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void {

  }

  //#region ---- Image Functions ----
  /**ファイル選択ボタンクリックイベント */
  public onClickFileSelectButton(type:number) {
    if(type == 0){
      this.fileInputReserve.nativeElement.click();

    }else{
      this.fileInputCustomer.nativeElement.click();
    }
  }

  public changeListener(files: FileList, type:number){

    if(files && files.length > 0) {
      let file : File = files.item(0);
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        let data = []
        let csv = reader.result.toString();
        let cols = csv.split(/\n/)

        for (let i = 0; i < cols.length; i++) {
          if(cols[i].trim() != ''){
            data[i] = cols[i].split(/,/)
          }
        }

        switch(type){
          case ImportType.Reserve:
            // 予約
            this.fileReserve = file;
            this.reserveList = this.SetImportReserveData(data);
            break;
          case ImportType.Customer:
            // 顧客
            this.fileCustomer = file;
            this.customerList = this.SetImportCustomerData(data);
            break;
        }
      }
    }

    this.fileInputReserve.nativeElement.value = '';
    this.fileInputCustomer.nativeElement.value = '';
  }

  private SetImportReserveData(data) {

    if(data.length < this.headerRowCount){
      // テンプレートCSVのヘッダ～各項目説明の行が存在しない
      return null;
    }else if(data.length > 0 && data[0].length != this.reserveColumnsCount){
      // CSVのカラム数がテンプレートCSVのカラム数と異なる
      return null;
    }else{
      let retList = new Array<ReserveData>();

      try{
        for (let i = 0; i < data.length; i++) {
          let tmpData : ReserveData = new ReserveData();
          for (let j = 0; j < this.reserveColumnsCount; j++) {
            // ダブルクォーテーションは除外
            let val = data[i][j].replace(/\"/g,'').replace(/\r/g,'');

            switch(j){
              case 0:
                tmpData.arrivalDate = val;
                break;
              case 1:
                tmpData.stayDays = val;
                break;
              case 2:
                tmpData.departureDate = val;
                break;
              case 3:
                tmpData.reserveDate = val;
                break;
              case 4:
                tmpData.memberMale = val;
                break;
              case 5:
                tmpData.memberFemale = val;
                break;
              case 6:
                tmpData.memberChildA = val;
                break;
              case 7:
                tmpData.memberChildB = val;
                break;
              case 8:
                tmpData.memberChildC = val;
                break;
              case 9:
                tmpData.agentCode = val;
                break;
              case 10:
                tmpData.agentRemarks = val;
                break;
              case 11:
                tmpData.phoneNo = val;
                break;
              case 12:
                tmpData.mobilePhoneNo = val;
                break;
              case 13:
                tmpData.guestName = val;
                break;
              case 14:
                tmpData.guestKana = val;
                break;
              case 15:
                tmpData.companyName = val;
                break;
              case 16:
                tmpData.zipCode = val;
                break;
              case 17:
                tmpData.email = val;
                break;
              case 18:
                tmpData.address = val;
                break;
              case 19:
                tmpData.customerNo = val;
                break;
              default:
                break;
            }
          }

          tmpData.companyNo = this._currentUser.displayCompanyNo;
          tmpData.creator = this._currentUser.userName;
          tmpData.updator= this._currentUser.userName;
          retList.push(tmpData);
        }
        return retList;
      }catch(e){
        console.log(e);
        return null;
      }
    }
  }

  private SetImportCustomerData(data) {

    if(data.length < this.headerRowCount){
      // テンプレートにあっていない
      return null;
    }else if(data.lenghtn > 0 && data[0].length != this.customerColumnsCount){
      // CSVのカラム数がテンプレートCSVのカラム数と異なる
      return null;
    }else{
      let retList = new Array<CustomerData>();

      try{
        for (let i = 0; i < data.length; i++) {
          let tmpData : CustomerData = new CustomerData();
          for (let j = 0; j < this.customerColumnsCount; j++) {
            // ダブルクォーテーションは除外
            let val = data[i][j].replace(/\"/g,'').replace(/\r/g,'');

            switch(j){
              case 0:
                tmpData.customerName = val;
                break;
              case 1:
                tmpData.customerKana = val;
                break;
              case 2:
                tmpData.zipCode = val;
                break;
              case 3:
                tmpData.address = val;
                break;
              case 4:
                tmpData.phoneNo = val;
                break;
              case 5:
                tmpData.mobilePhoneNo = val;
                break;
              case 6:
                tmpData.email = val;
                break;
              case 7:
                tmpData.companyName = val;
                break;
              case 8:
                tmpData.remarks1 = val;
                break;
              case 9:
                tmpData.remarks2 = val;
                break;
              case 10:
                tmpData.remarks3 = val;
                break;
              case 11:
                tmpData.remarks4 = val;
                break;
              case 12:
                tmpData.remarks5 = val;
                break;
              default:
                break;
            }
          }
          tmpData.companyNo = this._currentUser.displayCompanyNo;
          tmpData.creator = this._currentUser.userName;
          tmpData.updator= this._currentUser.userName;
          retList.push(tmpData);
        }
        return retList;
      }catch(e){
        console.log(e);
        return null;
      }
    }
  }

  public ImportReserveData(){
    let msg :string;

    if(this.reserveList == null){
      // テンプレートにあっていないCSVの取込
      msg = 'テンプレートに即していないCSVです。<br>画面のダウンロードボタンより入手できる<br>テンプレートCSVを使用してください';
      Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '001');
    }else{
      let impReserveList =  this.reserveList.slice();

      // ヘッダー行を削除
      impReserveList.splice(0, this.headerRowCount);

      if (impReserveList.length == 0){
        // 取込データ件数：0件
        msg = 'インポートデータが存在しません';
        Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '002');
      }else{
        // 予約データインポート処理
        this.dataImportService.importReserveData(impReserveList).subscribe((result : ResultData) => {
          // resultによって対応するメッセージ表示
          switch(result.resultCode){
            case 0:
              // インポート成功
              msg = '予約データをインポートしました';
              Common.modalMessageSuccess(Message.TITLE_SUCCESS, msg, MessagePrefix.SUCCESS + FunctionId.DATAIMPORT + '001');
              break;
            case 1:
              // 必須項目未入力
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'は必須項目です';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '003');
              break;
            case 2:
              // 入力形式が異なる
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'の入力形式が異なります。<br>'
                    + this.headerRowCount.toString() + '行目に記載されている形式に合わせてください';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '004');
              break;
            case 3:
              // 桁数オーバー
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'の文字数がオーバーしています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '005');
              break;
            case 4:
              // 最大値以上の値
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'で最大値より大きい値が入力されています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '006');
              break;
            case 5:
              // 最小値未満の値
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'で最小値未満の値が入力されています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '007');
              break;
            case 6:
              // マスタ未登録
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'はマスタに登録されていません。<br>'
                    + '先にマスタ登録を行ってください';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '007');
              break;
            default:
              // 不明なエラー
              msg = '予約データのインポートに失敗しました';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '008');
              break;
          }
        });
      }
    }
  }

  public ImportCustomerData(){
    let msg : string;

    if(this.customerList == null){
      // テンプレートにあっていないCSVの取込
      msg = 'テンプレートに即していないCSVです。<br>画面のダウンロードボタンより入手できる<br>テンプレートCSVを使用してください';
      Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '009');
    }else{
      let impCustomerList =  this.customerList.slice();

      // ヘッダー行を削除
      impCustomerList.splice(0, this.headerRowCount);

      if(impCustomerList.length == 0){
        // 取込データ件数：0件
        msg = 'インポートデータが存在しません';
        Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '010');
      }else{
        // 顧客データインポート処理
        this.dataImportService.importCustomerData(impCustomerList).subscribe((result : ResultData) => {
          // resultによって対応するメッセージ表示
          switch(result.resultCode){
            case 0:
              // インポート成功
              msg = '顧客データをインポートしました';
              Common.modalMessageSuccess(Message.TITLE_SUCCESS, msg, MessagePrefix.SUCCESS + FunctionId.DATAIMPORT + '002');
              break;
            case 1:
              // 必須項目未入力
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'は必須項目です';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '011');
              break;
            case 2:
              // 入力形式が異なる
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'の入力形式が異なります。<br>'
                    + this.headerRowCount.toString() + '行目に記載されている形式に合わせてください';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '012');
              break;
            case 3:
              // 桁数オーバー
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'の文字数がオーバーしています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '013');
              break;
            case 4:
              // 最大値以上の値
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'で最大値より大きい値が入力されています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '014');
              break;
            case 5:
              // 最小値未満の値
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'で最小値未満の値が入力されています';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '015');
              break;
            case 6:
              // マスタ未登録
              msg = (result.rowNo + this.headerRowCount).toString() + '行目の' + result.itemName + 'はマスタに登録されていません。<br>'
                    + '先にマスタ登録を行ってください';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '016');
              break;
            default:
              // 不明なエラー
              msg = '顧客データのインポートに失敗しました';
              Common.modalMessageError(Message.TITLE_ERROR, msg, MessagePrefix.ERROR + FunctionId.DATAIMPORT + '017');
              break;
          }
        });
      }
    }
  }

  public downloadCsv(type:number){

    let headerColumns = [];
    let requiredColumns = [];
    let descriptionColumns = [];
    let rowcolumns = [];
    let fileName = "";

    switch(type){
      case ImportType.Reserve:
      // 予約
        headerColumns = this.reserveHeadcolumns;
        requiredColumns = this.reserveRequiredcolumns;
        descriptionColumns = this.reserveDescriptioncolumns;
        fileName = this.reserveFilename;
        break;
      case ImportType.Customer:
      // 顧客
        headerColumns = this.customerHeadcolumns;
        requiredColumns = this.customerRequiredcolumns;
        descriptionColumns = this.customerDescriptioncolumns;
        fileName = this.customerFilename;
        break;
    }

    let csv = '\ufeff';

    // headers
    for (let i = 0; i < headerColumns.length; i++) {
      const column = headerColumns[i];
      csv += column;
      if (i < (headerColumns.length - 1)) {
        csv += this.csvSeparator;
      }
    }

    csv += '\n';

    // requireds
    for (let i = 0; i < requiredColumns.length; i++) {
      const column = requiredColumns[i];
      csv += column;
      if (i < (requiredColumns.length - 1)) {
        csv += this.csvSeparator;
      }
    }

    csv += '\n';

    // descriptions
    for (let i = 0; i < descriptionColumns.length; i++) {
      const column = descriptionColumns[i];
      csv += column;
      if (i < (descriptionColumns.length - 1)) {
        csv += this.csvSeparator;
      }
    }

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, fileName + '.csv');
    } else {
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', fileName + '.csv');
        link.click();
      } else {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        window.open(encodeURI(csv));
      }
      document.body.removeChild(link);
    }
  }
}
