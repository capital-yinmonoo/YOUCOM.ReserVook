import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../shared/shared.module';
import { DenominationRoutingModule }  from './denomination-routing.module';
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
import { DenominationListComponent } from './denomination-list/denomination-list.component';
import { DenominationFormComponent } from './denomination-form/denomination-form.component';
import { DenominationService } from './services/denomination.service';

@NgModule({
  imports: [
    SharedModule,
    DenominationRoutingModule,
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
    DenominationListComponent,
    DenominationFormComponent,
  ],
  providers: [DenominationService],

})
export class DenominationModule { }
