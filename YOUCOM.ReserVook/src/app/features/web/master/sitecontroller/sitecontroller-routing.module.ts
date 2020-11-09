import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteControllerListComponent } from './sitecontroller-list/sitecontroller-list.component';
import { SiteControllerFormComponent } from './sitecontroller-form/sitecontroller-form.component';

const siteControllerRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: SiteControllerListComponent, },
  { path: 'form/:scCd', component: SiteControllerFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(siteControllerRoutes)],
    exports: [RouterModule]
})
export class SiteControllerRoutingModule { }
