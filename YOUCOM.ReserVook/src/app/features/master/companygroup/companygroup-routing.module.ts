import { AuthSuperAdminGuard } from './../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyGroupListComponent } from './companygroup-list/companygroup-list.component';
import { CompanyGroupFormComponent } from './companygroup-form/companygroup-form.component';

const companyGroupRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full', canActivate: [ AuthSuperAdminGuard ]},
  { path: 'list', component: CompanyGroupListComponent, canActivate: [ AuthSuperAdminGuard ] },
  { path: 'form/:id', component: CompanyGroupFormComponent, canActivate: [ AuthSuperAdminGuard ] }
];

@NgModule({
  imports: [RouterModule.forChild(companyGroupRoutes)],
  exports: [RouterModule]

})
export class CompanyGroupRoutingModule { }
