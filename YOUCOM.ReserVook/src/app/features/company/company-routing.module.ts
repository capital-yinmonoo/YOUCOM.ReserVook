import { AuthSuperAdminGuard } from './../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyListComponent } from '../master/company/company-list/company-list.component';
import { CompanyFormComponent } from '../master/company/company-form/company-form.component';

const companyRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: CompanyListComponent },
  { path: 'form/:id', component: CompanyFormComponent },
];

@NgModule({
    imports: [RouterModule.forChild(companyRoutes)],
    exports: [RouterModule]
})
export class CompanyRoutingModule { }
