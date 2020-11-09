import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ConfirmincomeRoutingModule } from './confirmincome-routing.module';
import { ConfirmincomeComponent } from './confirmincome.component';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    ConfirmincomeRoutingModule,
    MatGridListModule,
    MatNativeDateModule,
    MatDatepickerModule
  ],
  declarations: [
    ConfirmincomeComponent,
  ],
})
export class ConfirmincomeModule { }
