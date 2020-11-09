import { Message, DBUpdateResult } from '../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../core/auth/auth.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../core/system.const';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NameSearchInfo, NameSearchCondition } from './model/namesearch.model';
import { NameSearchService } from './services/namesearch.service';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-namesearch',
  templateUrl: './namesearch.component.html',
  styleUrls: ['./namesearch.component.scss']
})
export class NameSearchListComponent implements OnInit {

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

  conditionForm = new FormGroup({
    guestName: new FormControl('', [Validators.maxLength(this.maxLengthName)]),
    guestPhone: new FormControl('', [Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)]),
    useDateFrom: new FormControl('', [Validators.required]),
    useDateTo: new FormControl('', [Validators.required]),
    keywords: new FormControl('', [Validators.maxLength(this.maxLengthKeywords)]),
  });

  private currentUser : User;
  nameSearchList: NameSearchInfo[];

  constructor(private router: Router,private NameSearchService: NameSearchService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  newCount = 0;
  cancelCount = 0;
  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void {
    moment.locale("ja");  // 曜日を日本語表記にする

    this.conditionForm.controls["useDateFrom"].setValue(moment().toDate());
    this.conditionForm.controls["useDateTo"].setValue(moment().toDate());
  }

  /** DateTimePicker 日付変更 */
  datepickerDateFromChanged(event: MatDatepickerInputEvent<moment.Moment>) {
    this.conditionForm.controls["useDateFrom"].setValue(event.value.toDate())
  }
  datepickerDateToChanged(event: MatDatepickerInputEvent<moment.Moment>) {
    this.conditionForm.controls["useDateTo"].setValue(event.value.toDate());
  }

  search(){
    this.getNameSearch();
  }

  /** データ取得 */
  getNameSearch() {
     var condition = new NameSearchCondition();
     condition.companyNo = this.currentUser.displayCompanyNo;
     condition.name = this.conditionForm.value.guestName;
     condition.phone = this.conditionForm.value.guestPhone;
     condition.useDateFrom = moment(this.conditionForm.value.useDateFrom).format(SystemConst.DATE_FORMAT_YYYYMMDD);
     condition.useDateTo = moment(this.conditionForm.value.useDateTo).format(SystemConst.DATE_FORMAT_YYYYMMDD);
     condition.keyword = this.conditionForm.value.keywords;
     condition.reserveOnly = false; // 部屋ごとの名称も取得

    this.NameSearchService.getNameSearchlist(condition).subscribe((res : NameSearchInfo[]) => {
      this.nameSearchList = res;
    },
    error => {
      alert(error);
    });
  }

  public onClickReserveNo(reserveNo: string){
    this.router.navigate(["/company/reserve/", reserveNo]);
  }
}
