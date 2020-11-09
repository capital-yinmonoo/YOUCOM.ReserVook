import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { MatGridListModule } from '@angular/material/grid-list';
import { DishReportRoutingModule } from './dishreport-routing.module';
import { DishReportListComponent } from './dishreport-list/dishreport-list.component';
import { DishReportService } from './services/dishreport.service';
import { DishreportPrintComponent } from './dishreport-print/dishreport-print.component';

@NgModule({

  imports: [
    SharedModule
    , FormsModule
    , HttpModule
    , MatGridListModule
    , DishReportRoutingModule
  ],
  declarations: [
    DishReportListComponent
    , DishreportPrintComponent
  ],
  providers: [DishReportService],
})
export class DishReportModule { }
