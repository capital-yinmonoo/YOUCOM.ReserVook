import { BillPrintComponent } from './bill-print.component';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { BillPrintRoutingModule } from './bill-print-routing.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    BillPrintRoutingModule
  ],
  declarations: [
  ],
  providers: [],
})
export class BillPrintModule { }
