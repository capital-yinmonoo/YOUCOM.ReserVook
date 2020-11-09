import { Message, DBUpdateResult } from '../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/auth/auth.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../core/system.const';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';

import { WebReserveBaseInfo } from '../model/webreservebase.model';
import { WebreserveService } from '../services/webreserve.service';

@Component({
  selector: 'app-webreserve-list',
  templateUrl: './webreserve-list.component.html',
  styleUrls: ['./webreserve-list.component.scss']
})
export class WebreserveListComponent implements OnInit {

  private currentUser : User;
  inputDate: Date;
  webReserveBaseList: WebReserveBaseInfo[];

  constructor(private route: ActivatedRoute,private WebreserveService: WebreserveService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  newCount = 0;
  cancelCount = 0;
  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };
  //constructor(private router: Router, private webreserveService: WebreserveService) { }

  ngOnInit(): void {
    moment.locale("ja");  // 曜日を日本語表記にする

    if (!this.inputDate) {
      this.inputDate = moment().toDate();
      this.buildColumnByDate(moment(this.inputDate));
    }
  }

  /** DateTimePicker 日付変更(ボタン) */
  getChangeDate(event: Date) {
    this.inputDate = event;
    this.buildColumnByDate(moment(this.inputDate));
  }

  /** DateTimePicker 日付変更 */
  datepickerDateChanged(event: MatDatepickerInputEvent<moment.Moment>) {
    this.inputDate = event.value.toDate();
    this.buildColumnByDate(moment(this.inputDate));
  }

  /** データ取得 */
  buildColumnByDate(targetDate: moment.Moment) {
    var condition = new WebReserveBaseInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;
    condition.xTravelAgncBkngDate = targetDate.format(SystemConst.DATE_FORMAT_YYYYMMDD);

    this.WebreserveService.getWebReserveBaseList(condition).subscribe((res : WebReserveBaseInfo[]) => {
      if (res.length == 0)
      {
        this.newCount = 0;
        this.cancelCount = 0;
      }
      else
      {
        this.newCount = res[0].newCount;
        this.cancelCount = res[0].cancelCount;
      }
      this.webReserveBaseList = res;
    },
    error => {
      alert(error);
    });
  }

}
