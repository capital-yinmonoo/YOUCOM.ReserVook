import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../core/auth/auth.model';
import { AuthService } from '../../../core/auth/auth.service';
import { DataExportService } from '../services/dataexport.service';
import { ReserveDataCondition, ReserveData, CustomerData, CustomerDataCondition } from '../model/dataexport.model';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Common } from 'src/app/core/common';
import { SystemConst, Message, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import moment from 'moment';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';

enum ExportType {
  Reserve,
  Customer
};

@Component({
  selector: 'app-dataexport',
  templateUrl: './dataexport.component.html',
  styleUrls: ['./dataexport.component.scss']
})

export class DataExportComponent implements OnInit {

  public readonly maxLengthPhone = 20;
  public readonly maxLengthName = 50;
  public readonly maxAmount = 99999999;
  public readonly minAmount = 0;

  /** 日付形式(yyyy/MM/dd)で入力してください。 */
  public readonly msgPatternDate = Message.PATTERN_DATE;
  /** 半角数字とハイフン(-)で入力してください。 */
  public readonly msgPatternPhone = Message.PATTERN_PHONE;
  /** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  /** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  /** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPhone = this.maxLengthPhone.toString() + Message.MAX_LENGTH;
  /** 50文字以下で入力してください。 */
  public readonly msgMaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
  /** 0以上の値で入力してください。 */
  public readonly msgMinAmount = this.minAmount.toLocaleString() + Message.MIN_DIGITS;
  /** 99999999以下の値で入力してください。 */
  public readonly msgMaxAmount = this.maxAmount.toLocaleString() + Message.MAX_DIGITS;

  // エスケープ「\\」は2つ
  public readonly numberFormatPattern = '^[-]?[0-9]*$';
  public readonly phoneFormatPattern = '^[0-9-+ ]*$';
  public readonly kanaFormatPattern = '^[0-9０-９a-zA-Zァ-ンヴー 　]*$';

  public useDateInputs : boolean = false;

  csvSeparator = ",";
  reserveFilename = "予約情報";
  customerFilename = "顧客情報";
  reserveHeadcolumns = [
    '予約番号','到着日','泊数','出発日','予約日','大人男','大人女','子供A','子供B','子供C',
    'エージェントコード','エージェント名','エージェント備考','電話番号','携帯電話番号',
    '利用者名','フリガナ','会社名','郵便番号','メール','住所','顧客番号','売上明細金額合計'
  ];

  reserveRowcolumns = [
    'reserveNo','arrivalDate','stayDays','departureDate','reserveDate',
    'memberMale','memberFemale','memberChildA','memberChildB','memberChildC',
    'agentCode','agentName','agentRemarks','phoneNo','mobilePhoneNo','guestName','guestKana',
    'companyName','zipCode','email','address','customerNo','useAmountTotal',
  ];

  customerHeadcolumns = [
    '顧客番号','利用者名','フリガナ','郵便番号','住所','電話番号','携帯電話','メール','会社名','備考1','備考2','備考3','備考4','備考5',
  ];

  customerRowcolumns = [
    'customerNo','customerName','customerKana','zipCode','address',
    'phoneNo','mobilePhoneNo','email','companyName','remarks1','remarks2','remarks3','remarks4','remarks5',
  ];


  // 初期化
  reserveCondForm = this.SetInitFormInfo(ExportType.Reserve);
  customerCondForm = this.SetInitFormInfo(ExportType.Customer);

  private _currentUser : User;
  constructor(private router: Router
              , private dataExportService: DataExportService
              , private authService:AuthService
              , private fb: FormBuilder) {

    this._currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void {

    moment.locale("ja");  // 曜日を日本語表記にする

    this.useDateInputs = false;
  }

  /** FormGroup 初期値セット */
  private SetInitFormInfo(infoType: number){
    var result : FormGroup;
    switch(infoType){
      case ExportType.Reserve:
        result = this.SetReserveCondForm('', '', '', '');
        break;
      case ExportType.Customer:
        result = this.SetCustoemrCondForm('', '', '', '', '', '');
        break;
    }
    return result;
  }

  /** FormGroup 予約検索条件情報セット */
  private SetReserveCondForm(arrivalDateFrom:string, arrivalDateTo:string, departureDateFrom: string, departureDateTo: string){
      return this.fb.group({
        arrivalDateFrom: new FormControl(arrivalDateFrom)
      , arrivalDateTo: new FormControl(arrivalDateTo)
      , departureDateFrom: new FormControl(departureDateFrom)
      , departureDateTo: new FormControl(departureDateTo)
    });
  }

  /** FormGroup 顧客検索条件情報セット */
  private SetCustoemrCondForm(guestName:string, phoneNo:string, useDateFrom: string, useDateTo: string, useAmountMin: string, useAmountMax: string){
      return this.fb.group({
        phoneNo: new FormControl(phoneNo,[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)])
      , guestKana: new FormControl(guestName,[Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLengthName)])
      , useDateFrom: new FormControl(useDateFrom)
      , useDateTo: new FormControl(useDateTo)
      , useAmountMin: new FormControl(useAmountMin, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minAmount), Validators.max(this.maxAmount)])
      , useAmountMax: new FormControl(useAmountMax, [Validators.pattern(this.numberFormatPattern), Validators.min(this.minAmount), Validators.max(this.maxAmount)])
    });
  }

  private FormatDate(value){
    var strDate : string = '';
    if (!Common.IsNullOrEmpty(value)){
      var date = moment(value);
      strDate = date.format(SystemConst.DATE_FORMAT_YYYYMMDD);
    }
    return strDate;
  }

  private ExportCsv(dataList, infoType){

    let headerColumns = [];
    let rowcolumns = [];
    let fileName = "";

    switch(infoType){
      case ExportType.Reserve:
        headerColumns = this.reserveHeadcolumns;
        rowcolumns = this.reserveRowcolumns;
        fileName = this.reserveFilename;
        break;
      case ExportType.Customer:
        headerColumns = this.customerHeadcolumns;
        rowcolumns = this.customerRowcolumns;
        fileName = this.customerFilename;
        break;
    }

    const data = dataList;

    let csv = '\ufeff';
    // headers
    for (let i = 0; i < headerColumns.length; i++) {
      const column = headerColumns[i];
      csv += '"' + column + '"';
      if (i < (headerColumns.length - 1)) {
        csv += this.csvSeparator;
      }
    }

    // body
    data.forEach((record) => {
      csv += '\n';
      for (let i_1 = 0; i_1 < rowcolumns.length; i_1++) {
        const column = rowcolumns[i_1];
        csv += '"' + this.ResolveFieldData(record, column) + '"';
        if (i_1 < (rowcolumns.length - 1)) {
          csv += this.csvSeparator;
        }
      }
    });

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

  ResolveFieldData(data, field) {
    if (data && field) {
      if (field.indexOf(':') === -1) {
        return data[field];
      } else {
        const fields = field.split(':');
        let value = data;
        for (let i = 0, len = fields.length; i < len; ++i) {
          if (value === null) {
            return null;
          }
          value = value[fields[i]];
        }
        return value;
      }
    } else {
      return null;
    }
  }

  public ExportReserveData(){

    // 予約抽出条件を基にデータ取得
    var cond = new ReserveDataCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.arrivalDateFrom = this.FormatDate(this.reserveCondForm.controls['arrivalDateFrom'].value);
    cond.arrivalDateTo = this.FormatDate(this.reserveCondForm.controls['arrivalDateTo'].value);
    cond.departureDateFrom = this.FormatDate(this.reserveCondForm.controls['departureDateFrom'].value);
    cond.departureDateTo = this.FormatDate(this.reserveCondForm.controls['departureDateTo'].value);

    let isArrDateFromEnpty : boolean = isNullOrUndefined(cond.arrivalDateFrom) || cond.arrivalDateFrom == '';
    let isArrDateToEnpty : boolean = isNullOrUndefined(cond.arrivalDateTo) || cond.arrivalDateTo == '';
    let isDepDateFromEnpty : boolean = isNullOrUndefined(cond.departureDateFrom) || cond.departureDateFrom == '';
    let isDepDateToEnpty : boolean = isNullOrUndefined(cond.departureDateTo) || cond.departureDateTo =='';

    if((!isArrDateFromEnpty && !isArrDateToEnpty && cond.arrivalDateFrom > cond.arrivalDateTo) || (!isDepDateFromEnpty && !isDepDateToEnpty  && cond.departureDateFrom > cond.departureDateTo)){
      // 開始日付＞終了日付の場合、エラー
      Common.modalMessageWarning(Message.TITLE_WARNING, '期間の指定が不正です。', MessagePrefix.WARNING + FunctionId.DATAEXPORT + '001');
    } else if(isArrDateFromEnpty && isArrDateToEnpty && isDepDateFromEnpty && isDepDateToEnpty){
      // 到着日・出発日どちらとも未入力の場合、エラー
      Common.modalMessageWarning(Message.TITLE_WARNING, '到着日・出発日が指定されていません。', MessagePrefix.WARNING + FunctionId.DATAEXPORT + '003');
    } else {
      this.dataExportService.getReserveDataList(cond).subscribe((result : ReserveData[]) => {
        let reserveDataList = result;

        if(reserveDataList.length == 0){
          Common.modalMessageNotice(Message.TITLE_NOTICE, '抽出条件に当てはまるデータはありません。', MessagePrefix.NOTICE + FunctionId.DATAEXPORT + '001');
        }else{
          //取得データを基にCSV出力
          this.ExportCsv(reserveDataList, ExportType.Reserve);
        }
      });
    }

  }

  public ExportCustomerData(){

    // 顧客抽出条件を基にデータ取得
    var cond = new CustomerDataCondition();
    cond.companyNo = this._currentUser.displayCompanyNo;
    cond.phoneNo = this.customerCondForm.controls['phoneNo'].value;
    cond.guestKana = this.customerCondForm.controls['guestKana'].value;
    cond.useDateFrom = this.FormatDate(this.customerCondForm.controls['useDateFrom'].value);
    cond.useDateTo = this.FormatDate(this.customerCondForm.controls['useDateTo'].value);
    cond.useAmountMin = this.useDateInputs ? this.customerCondForm.controls['useAmountMin'].value : '';
    cond.useAmountMax = this.useDateInputs ? this.customerCondForm.controls['useAmountMax'].value : '';

    // 開始日付＞終了日付の場合、エラー
    if(cond.useDateFrom != '' && cond.useDateTo != '' && cond.useDateFrom > cond.useDateTo){
      Common.modalMessageWarning(Message.TITLE_WARNING, '期間の指定が不正です。', MessagePrefix.WARNING + FunctionId.DATAEXPORT + '002');
    }else{
      this.dataExportService.getCustomerDataList(cond).subscribe((result : CustomerData[]) => {
        let customerDataList = result;

        if(customerDataList.length == 0){
          Common.modalMessageNotice(Message.TITLE_NOTICE, '抽出条件に当てはまるデータはありません。', MessagePrefix.NOTICE + FunctionId.DATAEXPORT + '002');
        }else{
          //取得データを基にCSV出力
          this.ExportCsv(customerDataList, ExportType.Customer);
        }
      });
    }
  }

  public ChangeUseDate(){

    let useDateFrom = this.FormatDate(this.customerCondForm.controls['useDateFrom'].value);
    let useDateTo = this.FormatDate(this.customerCondForm.controls['useDateTo'].value);

    this.useDateInputs = ((useDateFrom != undefined && useDateFrom != '') || (useDateTo != undefined && useDateTo != ''));
  }
}
