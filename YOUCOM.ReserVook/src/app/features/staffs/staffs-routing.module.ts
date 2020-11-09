import { AuthStaffGuard, AuthSuperAdminGuard } from './../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StaffListComponent } from '../master/staffs/staff-list/staff-list.component';
import { StaffFormComponent } from '../master/staffs/staff-form/staff-form.component';

const staffsRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full', canActivate: [ AuthSuperAdminGuard ]},
  { path: 'list', component: StaffListComponent, canActivate: [ AuthSuperAdminGuard ], },
  { path: 'form/:companyNo/:userEmail', component: StaffFormComponent, canActivate: [ AuthStaffGuard ], },
];

@NgModule({
    imports: [RouterModule.forChild(staffsRoutes)],
    exports: [RouterModule]
})

export class StaffsRoutingModule { }

