import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'

import { StaffsRoutingModule } from './staffs-routing.module';
import { StaffService } from './services/staff.service';

import { StaffFormComponent } from '../master/staffs/staff-form/staff-form.component';
import { StaffListComponent } from '../master/staffs/staff-list/staff-list.component';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    StaffsRoutingModule,
  ],
  declarations:[
    StaffFormComponent,
    StaffListComponent,],
  providers: [StaffService,StaffListComponent,StaffFormComponent],
})
export class StaffsModule { }
