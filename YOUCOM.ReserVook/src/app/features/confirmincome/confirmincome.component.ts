import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ConfirmincomeService } from './confirmincome.service';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/auth/auth.model';
import { ConfirmIncome, IncomeQuery } from './confirmincome.model';
import { SystemConst } from 'src/app/core/system.const';
import { SharedService } from '../../core/shared.service';
import { isNullOrUndefined } from 'util';

@Component({
  templateUrl: './confirmincome.component.html',
  styleUrls: ['./confirmincome.component.scss'],
  providers: [DatePipe]
})

export class ConfirmincomeComponent implements OnInit {

  dataList: ConfirmIncome[];
  confirmIncomeList : ConfirmIncome[];
  confirmIncomeListTotal : ConfirmIncome[];

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  // curdayIncome:number=0;
  // curdaySales:number=0;
  // lastIncome:number=0;
  // lastSales:number=0;
  // totalIncome:number=0;
  // totalSales:number=0;

  ngOnInit(): void {
  }

  ngOnDestroy() {
    // イベント破棄
    this.SharedService.displayDate = this.inputDate;
  }

  constructor(private datePipe: DatePipe, private router: Router, private confirmincomeService: ConfirmincomeService,private authService:AuthService,private SharedService: SharedService) {
    this.currentUser = this.authService.getLoginUser()
    if(!isNullOrUndefined(this.SharedService.displayDate)){
      this.inputDate = this.SharedService.displayDate;
    }else{
      this.inputDate = new Date();
    }
    this.refillDate(this.inputDate);
  }

  getChangeDate(event: Date) {
    this.inputDate = event;
    this.getDate();
  }

  refillDate(event: Date){
    this.inputDate = event;
    this.getDate();
  }

  getDate(){

    var condition = new IncomeQuery;
    condition.queryDate = this.datePipe.transform(this.inputDate, 'yyyyMMdd');
    condition.companyCode = this.currentUser.displayCompanyNo;

    this.confirmincomeService.getIncomeList(condition).pipe().subscribe((res : ConfirmIncome[]) => {
      if (res) {
        this.dataList = res
        this.confirmIncomeList = this.dataList.filter(f => f.totalflag == false);
        this.confirmIncomeListTotal= this.dataList.filter(f =>f.totalflag == true);

      } else {
        console.log(res);
        alert("The service of getActualRoom has error.");
      }
    });
  }

  // delete(actualRoomId){
  //   this.confirmincomeService.deleteActualRoom(actualRoomId).pipe().subscribe(result => {
  //     if (result) {
  //       this.getDate();
  //     } else {
  //       console.log(result);
  //       alert("The service of getActualRoom has error.");
  //     }
  //   });;
  // }

  showset() {
    document.getElementById("sset").style.display = "none";
    document.getElementById("cset").style.display = "block";
  }
  closeset() {
    document.getElementById("sset").style.display = "block";
    document.getElementById("cset").style.display = "none";
  }
  calcuatecolumn(str) {
    var result = 0;
    this.confirmIncomeList.forEach((r) => {
      result += Number(r[str]);
    })

    return result;
  }

  gotoBill(id){
    this.router.navigate(['/company/detailbookissuance',{id:id}]);
  }

  csvSeparator = ",";
  exportFilename = "入金点検";
  headcolumns = [
    '予約番号', '利用者名','泊数', '前日迄売上', '当日売上', '前日迄入金', '当日入金金種', '当日入金金額', '残高'
  ];

  rowcolumns = [
    'reserveNo', 'guestName', 'stayDays', 'dayBeforeSales', 'todaySales', 'dayBeforeDeposit', 'denominationName', 'amountPrice', 'balance',];

  csvExport() {
    const data = this.dataList;
    let csv = '\ufeff';
    // headers
    for (let i = 0; i < this.headcolumns.length; i++) {
      const column = this.headcolumns[i];
      csv += '"' + column + '"';
      if (i < (this.headcolumns.length - 1)) {
        csv += this.csvSeparator;
      }
    }
    // body
    data.forEach((record) => {
      csv += '\n';
      for (let i_1 = 0; i_1 < this.rowcolumns.length; i_1++) {
        const column = this.rowcolumns[i_1];
        csv += '"' + this.resolveFieldData(record, column) + '"';
        if (i_1 < (this.rowcolumns.length - 1)) {
          csv += this.csvSeparator;
        }
      }
    });
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, this.exportFilename + this.datePipe.transform(this.inputDate, 'yyyyMMdd') + '.csv');
    } else {
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', this.exportFilename + this.datePipe.transform(this.inputDate, 'yyyyMMdd')+ '.csv');
        link.click();
      } else {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        window.open(encodeURI(csv));
      }
      document.body.removeChild(link);
    }
  }
  resolveFieldData(data, field) {
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

  public onClickReserveNo(reserveNo: string){
    this.router.navigate(["/company/reserve/", reserveNo]);
  }

  updatedays() { }

  inputDate: Date;
  currentUser : User;

}

