import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { MatGridListModule } from '@angular/material/grid-list';
// import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// import {QRCodeModule} from 'angular2-qrcode';

import { CleaningsRoutingModule } from './cleanings-routing.module';
import { CleaningListComponent } from './cleaning-list/cleaning-list.component';
import { CleaningService } from './services/cleaning.service';
import { CleaningPrintComponent } from './cleaning-print/cleaning-print.component';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    MatGridListModule,
    // MatNativeDateModule,
    // MatDatepickerModule,
    CleaningsRoutingModule,
    // QRCodeModule,
  ],
  declarations: [
    CleaningListComponent
    , CleaningPrintComponent
  ],
  providers: [CleaningService],
})
export class CleaningsModule { }
