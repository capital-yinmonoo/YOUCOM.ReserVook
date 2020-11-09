import { NameSearchService } from './../../namesearch/services/namesearch.service';
import { Component, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/auth/auth.model';
import { Message, SystemConst } from 'src/app/core/system.const';
import { NameSearchInfo, NameSearchCondition } from '../../namesearch/model/namesearch.model';
import moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS,} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Common } from 'src/app/core/common';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'YYYY年MM',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-reservesearch',
  templateUrl: './reservesearch.component.html',
  styleUrls: ['./reservesearch.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class ReserveSearchComponent implements AfterViewInit {

  private currentUser : User;

  public nameSearchList: Array<NameSearchInfo> = [];

//#region Form Controls
  public readonly maxLengthPhone = 20;
  public readonly maxLengthName = 50;
  public readonly maxLengthKeywords = 100;

  /** 半角数字で入力してください。 */
  public readonly phoneFormatPattern = '^[0-9-+ ]*$';

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  /** 半角数字とハイフン(-)で入力してください。 */
  public readonly msgPatternPhone = Message.PATTERN_PHONE;

  /** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPhone = this.maxLengthPhone.toString() + Message.MAX_LENGTH;
  /** 50文字以下で入力してください。 */
  public readonly msgMaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
  /** 100文字以下で入力してください。 */
  public readonly msgMaxLengthKeywords = this.maxLengthKeywords.toString() + Message.MAX_LENGTH;

  /** ラベル 区切り文字 */
  public readonly PrefixDelimiter = ":";

  public conditionForm = new FormGroup({
      guestName: new FormControl('', [Validators.maxLength(this.maxLengthName)]),
      guestPhone: new FormControl('', [Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)]),
      useDateFrom: new FormControl('', [Validators.required]),
      useDateTo: new FormControl('', [Validators.required]),
      keywords: new FormControl('', [Validators.maxLength(this.maxLengthKeywords)]),
  });

//#endregion

//#region ----- Property Table 関連 --------------------------------------------------
  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  /** 予約リスト Propaty */
  public readonly reserveListColumns = [
    { name: '', prop: 'select', width: 100, textalign: 'center', textformat: 'none'},
    { name: '予約番号', prop: 'reserveNo', width: 100, textalign: 'left', textformat: 'string'},
    { name: '利用者名', prop: 'nameKanji', width: 250, textalign: 'left', textformat: 'string'},
    { name: '利用者名カナ', prop: 'nameKana', width: 250, textalign: 'left', textformat: 'string'},
    { name: '電話番号', prop: 'phone', width: 175, textalign: 'left', textformat: 'string'},
    { name: '到着日', prop: 'arrivalDate', width: 120, textalign: 'left', textformat: 'date'},
    { name: '出発日', prop: 'departureDate', width: 120, textalign: 'left', textformat: 'date'},
    { name: '人数', prop: 'persons', width: 120, textalign: 'right', textformat: 'number'},
  ];

//#endregion

  constructor(private authService: AuthService,
              public dialogRef: MatDialogRef<ReserveSearchComponent>,
              private nameSearchService: NameSearchService,
              @Inject(MAT_DIALOG_DATA) public useDate: string) {

    this.currentUser = this.authService.getLoginUser();

  }

  private sleep : any

  ngOnInit(): void {
    moment.locale("ja");  // 曜日を日本語表記にする
    const paramDate = new Date(this.useDate.substring(0, 4) + "/" + this.useDate.substring(4, 6) + "/" + this.useDate.substring(6, 8) + " 00:00:00");
    this.conditionForm.controls["useDateFrom"].setValue(paramDate);
    this.conditionForm.controls["useDateTo"].setValue(paramDate);
  }

  ngAfterViewInit() {
    // 起動時描画が間に合わないので配列を入れ直して一覧をリフレッシュさせる
    this.sleep = setTimeout(function(dThis){
      dThis.nameSearchList = [...dThis.nameSearchList]
    }, 200, this)
  }

  ngOnDestroy(){
    clearTimeout(this.sleep);
  }

  /** DateTimePicker 日付変更 */
  public datepickerDateFromChanged(event: MatDatepickerInputEvent<moment.Moment>) {
    this.conditionForm.controls["useDateFrom"].setValue(event.value.toDate());
    this.checkDate();
  }
  public datepickerDateToChanged(event: MatDatepickerInputEvent<moment.Moment>) {
    this.conditionForm.controls["useDateTo"].setValue(event.value.toDate());
    this.checkDate();
  }

  /** 日付チェック FromToが逆のとき入れ替える */
  private checkDate() {
    const from = this.conditionForm.controls["useDateFrom"].value;
    const to = this.conditionForm.controls["useDateTo"].value;

    if (!Common.IsNullOrEmpty(from) && !Common.IsNullOrEmpty(to)) {
      if (from > to) {
        this.conditionForm.controls["useDateTo"].setValue(from);
        this.conditionForm.controls["useDateFrom"].setValue(to);
      }
    }
  }

  /** 検索 */
  public Search(){

    const cond: NameSearchCondition = {
      companyNo: this.currentUser.displayCompanyNo,
      name: this.conditionForm.value.guestName,
      phone: this.conditionForm.value.guestPhone,
      useDateFrom: moment(this.conditionForm.value.useDateFrom).format(SystemConst.DATE_FORMAT_YYYYMMDD),
      useDateTo: moment(this.conditionForm.value.useDateTo).format(SystemConst.DATE_FORMAT_YYYYMMDD),
      keyword: this.conditionForm.value.keywords,
      reserveOnly: true // 部屋ごとの名称は不要
    };

    this.nameSearchService.getNameSearchlist(cond).subscribe((res : NameSearchInfo[]) => {
      this.nameSearchList = res;
    },
    error => {
      alert(error);
    });

  }

  /** クリア */
  public Clear(){
    this.conditionForm.controls["guestName"].setValue("");
    this.conditionForm.controls["guestPhone"].setValue("");
    this.conditionForm.controls["useDateFrom"].setValue(new Date());
    this.conditionForm.controls["useDateTo"].setValue(new Date());
    this.conditionForm.controls["keywords"].setValue("");
  }

  /** 戻る */
  public CloseDialog() {
    this.dialogRef.close();
  }
}
