import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SalesReportRoutingModule } from './salesreport-routing.module';
import { SaleDailyReportComponent } from './sales-daily-form/salesdailyreport.component';
import { SaleMonthlyReportComponent } from './sales-monthly-form/salesmonthlyreport.component';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    SalesReportRoutingModule,
    MatDatepickerModule
  ],
  declarations: [
    SaleDailyReportComponent,
    SaleMonthlyReportComponent
  ],
})
export class SaleReportModule { }
