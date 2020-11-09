import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { MatGridListModule } from '@angular/material/grid-list';
import { TrustyouRoutingModule } from './trustyou-routing.module';
import { TrustyouListComponent } from './trustyou-list/trustyou-list.component';
import { TrustyouService } from './services/trustyou.service';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    MatGridListModule,
    TrustyouRoutingModule,
  ],
  declarations: [
     TrustyouListComponent
  ],
  providers: [TrustyouService],
})
export class TrustyouModule { }
