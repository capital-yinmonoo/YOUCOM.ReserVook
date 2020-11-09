import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { WebreservesRoutingModule } from './webreserves-routing.module';
import { WebreserveListComponent } from './webreserve-list/webreserve-list.component';
import { WebreserveFormComponent } from './webreserve-form/webreserve-form.component';
import { WebreserveService } from './services/webreserve.service';


@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    MatGridListModule,
    MatNativeDateModule,
    MatDatepickerModule,
    WebreservesRoutingModule,
  ],
  declarations: [
    WebreserveListComponent,
    WebreserveFormComponent,
  ],
  providers: [WebreserveService],
})
export class WebreservesModule { }
