import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BillRoutingModule } from './bill-routing.module';
import { BillComponent } from './bill.component';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    BillRoutingModule,
  ],
  declarations: [
    BillComponent
  ],
})
export class BillModule { }
