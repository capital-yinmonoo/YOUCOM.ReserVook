import { NgModule } from '@angular/core';
import { SharedModule }  from '../../shared/shared.module';
import { LostItemListRoutingModule }  from './lostitemlist-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule,
  MatTableModule
} from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { LostItemListListComponent } from './lostitemlist-list/lostitemlist-list.component';
import { LostItemListFormComponent } from './lostitemlist-form/lostitemlist-form.component';
import { LostItemListService } from './services/lostitemlist.service';

@NgModule({
  imports: [
    SharedModule,
    LostItemListRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    DragulaModule.forRoot(),
    MatTableModule
  ],
  declarations: [
    LostItemListListComponent,
    LostItemListFormComponent,
  ],
  providers: [LostItemListService],

})
export class LostItemListModule { }
