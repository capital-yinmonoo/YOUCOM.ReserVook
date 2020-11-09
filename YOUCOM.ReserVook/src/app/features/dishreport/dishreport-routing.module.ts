import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DishReportListComponent } from './dishreport-list/dishreport-list.component';
import { DishreportPrintComponent } from './dishreport-print/dishreport-print.component';

const routes: Routes = [
  { path: '', component: DishReportListComponent },
  { path: 'print', component: DishreportPrintComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DishReportRoutingModule { }
