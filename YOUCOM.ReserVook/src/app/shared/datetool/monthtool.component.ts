import { Component, Input, EventEmitter, Output } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'monthtool',
  template: `<div class="monthtool-content">
              <input class="monthtool-button" type="button" value="<" (click)="changeMonth(-1)"/>
              <input class="monthtool-button" type="button" value="今月" (click)="changeMonth(0)"/>
              <input class="monthtool-button" type="button" value=">" (click)="changeMonth(1)"/>
            </div>`,
  styles: [`
    .monthtool-content {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .monthtool-button {
      flex: auto;
      width: 15px;
      height: 30px;
    }
    `]
})

export class MonthtoolComponent {

  private currDate: Date;

  @Output()
  DateChange: EventEmitter<Date> = new EventEmitter();

  @Input()
  set CurrDate(date: Date) {
    this.currDate = date;
  }
  get CurrDate(): Date {
    return this.currDate;
  }

  changeMonth(month: number) {
    if (this.isEmpty(this.currDate)) {
      return;
    }
    if (month === 0) {
      this.currDate = new Date();
    } else {
      this.currDate = this.addDate(this.currDate,month);
    }
    this.DateChange.emit(this.currDate);
  }

  private addDate(date: Date, month: number): Date{

    if(date.getMonth() == 1 && month == -1)
    {
      let resDate = new Date((date.getFullYear()-1),12,1);
      return resDate;
    }else if(date.getMonth() == 12 && month == 1)
    {
      let resDate = new Date(date.getFullYear()+1,1,1);
      return resDate;
    }
    else
    {
      let resDate = new Date(date.getFullYear(),(date.getMonth()+month),1);
      return resDate;
    }
  }

  private isEmpty(obj: any): boolean {
    return obj === '' || isNullOrUndefined(obj);
  }
}
