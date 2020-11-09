import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { NameSearchRoutingModule } from './namesearch-routing.module';
import { NameSearchListComponent } from './namesearch.component';
import { NameSearchService } from './services/namesearch.service';


@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    MatGridListModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NameSearchRoutingModule,
  ],
  declarations: [
    NameSearchListComponent,
  ],
  providers: [NameSearchService],
})
export class NameSearchModule { }
