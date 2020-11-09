import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { PlanConvertRoutingModule }  from './planconvert-routing.module';
import { MatTabsModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule,
  MatRadioModule
} from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { PlanConvertListComponent } from './planconvert-list/planconvert-list.component';
import { PlanConvertFormComponent } from './planconvert-form/planconvert-form.component';
import { PlanConvertService } from './services/planconvert.service';

@NgModule({
  imports: [
    SharedModule,
    PlanConvertRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    FlexLayoutModule,
    DragulaModule.forRoot()
  ],
  declarations: [
    PlanConvertListComponent,
    PlanConvertFormComponent,
  ],
  providers: [PlanConvertService],

})
export class PlanConvertModule { }
