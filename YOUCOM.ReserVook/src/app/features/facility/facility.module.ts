import { FacilityAssignComponent } from './facility-assign/facility-assign.component';
import { FacilityListComponent } from './../master/facility/facility-list/facility-list.component';
import { FacilityFormComponent } from './../master/facility/facility-form/facility-form.component';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule, MatButtonModule, MatSnackBarModule, MatTableModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { FacilityService } from './services/facility.service';
import { FacilityRoutingModule } from './facility-routing.module';
import { DragulaModule } from 'ng2-dragula';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatSnackBarModule,
    FacilityRoutingModule,
    MatTableModule,
    MatTabsModule,
    DragulaModule.forRoot()
  ],
  declarations: [
    FacilityFormComponent,
    FacilityListComponent,
    FacilityAssignComponent,
  ],
  providers: [FacilityService],
})
export class FacilityModule { }
