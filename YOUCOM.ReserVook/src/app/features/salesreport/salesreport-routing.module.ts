import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaleDailyReportComponent } from './sales-daily-form/salesdailyreport.component';
import { SaleMonthlyReportComponent } from './sales-monthly-form/salesmonthlyreport.component';

const routes: Routes = [
  {　path: 'daily', component: SaleDailyReportComponent },
  {　path: 'monthly', component: SaleMonthlyReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesReportRoutingModule { }
