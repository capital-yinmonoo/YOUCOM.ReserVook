import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../shared/shared.module';
import { LostStateRoutingModule }  from './loststate-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule
} from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { LostStateListComponent } from './loststate-list/loststate-list.component';
import { LostStateFormComponent } from './loststate-form/loststate-form.component';
import { LostStateService } from './services/loststate.service';

@NgModule({
  imports: [
    SharedModule,
    LostStateRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    DragulaModule.forRoot()

  ],
  declarations: [
    LostStateListComponent,
    LostStateFormComponent,
  ],
  providers: [LostStateService],

})
export class LostStateModule { }
