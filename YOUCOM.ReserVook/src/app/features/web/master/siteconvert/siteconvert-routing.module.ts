import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteConvertListComponent } from './siteconvert-list/siteconvert-list.component';
import { SiteConvertFormComponent } from './siteconvert-form/siteconvert-form.component';

const siteconvertRoutes: Routes = [
  { path: 'form/', redirectTo: '/master/siteconvert/list', pathMatch: 'full'},
  { path: 'list', component: SiteConvertListComponent, },
  { path: 'form/:scCd/:scSiteCd', component: SiteConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(siteconvertRoutes)],
    exports: [RouterModule]
})
export class SiteConvertRoutingModule { }
