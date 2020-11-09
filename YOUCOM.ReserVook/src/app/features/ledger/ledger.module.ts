import { LedgerComponent } from './ledger-form/ledger.component';
import { LedgerRoutingModule } from './ledger-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    LedgerRoutingModule,
    MatDatepickerModule,
  ],
  declarations: [
    LedgerComponent,
  ],
})
export class LedgerModule { }
