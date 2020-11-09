import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointConvertListComponent } from './pointconvert-list/pointconvert-list.component';
import { PointConvertFormComponent } from './pointconvert-form/pointconvert-form.component';

const pointconvertRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: PointConvertListComponent, },
  { path: 'form/:scCd/:scSiteCd/:scPntsDiscntNm', component: PointConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(pointconvertRoutes)],
    exports: [RouterModule]
})
export class PointConvertRoutingModule { }
