import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RemarksConvertListComponent } from './remarksconvert-list/remarksconvert-list.component';
import { RemarksConvertFormComponent } from './remarksconvert-form/remarksconvert-form.component';

const remarksConvertRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: RemarksConvertListComponent, },
  { path: 'form/:scCd/:scXClmn', component: RemarksConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(remarksConvertRoutes)],
    exports: [RouterModule]
})
export class RemarksConvertRoutingModule { }
