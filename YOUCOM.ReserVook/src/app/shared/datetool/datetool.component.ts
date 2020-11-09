import { Component, Input, EventEmitter, Output } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { Common } from 'src/app/core/common';
import moment from 'moment';

@Component({
  selector: 'datetool',
  template: `<div class="datetool-content">
              <input class="datetool-button" type="button" value="<<" (click)="changeDay(-7)"/>
              <input class="datetool-button" type="button" value="<" (click)="changeDay(-1)"/>
              <input class="datetool-button" type="button" value="今日" (click)="changeDay(0)"/>
              <input class="datetool-button" type="button" value=">" (click)="changeDay(1)"/>
              <input class="datetool-button" type="button" value=">>" (click)="changeDay(7)"/>
            </div>`,
  styles: [`
    .datetool-content {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .datetool-button {
      flex: auto;
      width: 45px;
      height: 30px;
    }
    `]
})

export class DateToolComponent {

  private currDate: Date;

  private minDate: Date;
  private maxDate: Date;

  @Output()
  DateChange: EventEmitter<Date> = new EventEmitter();

  @Input()
  set CurrDate(date: Date) {
    this.currDate = date;
  }
  get CurrDate(): Date {
    return this.currDate;
  }

  @Input()
  set MinDate(date: Date) {
    this.minDate = date;
  }

  @Input()
  set MaxDate(date: Date) {
    this.maxDate = date;
  }

  changeDay(days: number) {
    if (this.isEmpty(this.currDate)) {
      return;
    }

    let wkDate : Date;
    if (days === 0) {
      wkDate = new Date();
    } else {
      wkDate = this.addDate(this.currDate, days);
    }

    // 最小値･最大値の制限
    let setDate = this.checkMinMax(wkDate);

    this.currDate  = setDate;
    this.DateChange.emit(this.currDate);
  }

  private addDate(date: Date, days: number): Date{
      let resDate = new Date(date);
      resDate.setDate(resDate.getDate() + days);
      return resDate;
  }

  private isEmpty(obj: any): boolean {
    return obj === '' || isNullOrUndefined(obj);
  }

  private checkMinMax(wkDate : Date) : Date{

    let setDate : Date = wkDate;
    let checkDays = moment(wkDate);

    // 最小値
    if (!this.isEmpty(this.minDate)) {

      let min = moment(this.minDate);
      let diffDays = min.diff(checkDays, 'days');

      // 最小値より小さい場合は最小値をセット
      if (diffDays > 0){
        setDate = this.minDate;
      }
    }

    // 最大値
    if(!this.isEmpty(this.maxDate)){
      let max = moment(this.maxDate);
      let diffDays = max.diff(checkDays, 'days');

      // 最大値より大きい場合は最大値をセット
      if (diffDays < 0){
        setDate = this.maxDate;
      }
    }

    return setDate;
  }

}
