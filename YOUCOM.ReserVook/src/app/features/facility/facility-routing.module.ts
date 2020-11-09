import { FacilityFormComponent } from './../master/facility/facility-form/facility-form.component';
import { FacilityListComponent } from './../master/facility/facility-list/facility-list.component';
import { FacilityAssignComponent } from './facility-assign/facility-assign.component';
import { AuthAdminGuard } from './../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const facilityRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full' },
  { path: 'assign', component: FacilityAssignComponent,},
  //{ path: 'assign/:params', component: FacilityAssignComponent,},
  { path: 'list', component: FacilityListComponent, canActivate: [ AuthAdminGuard ]},
  { path: 'form/:code', component: FacilityFormComponent, canActivate: [ AuthAdminGuard ]}
];

@NgModule({
    imports: [RouterModule.forChild(facilityRoutes)],
    exports: [RouterModule]
})
export class FacilityRoutingModule { }
