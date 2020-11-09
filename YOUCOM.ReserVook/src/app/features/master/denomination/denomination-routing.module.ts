import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DenominationListComponent } from './denomination-list/denomination-list.component';
import { DenominationFormComponent } from './denomination-form/denomination-form.component';

const denominationRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: DenominationListComponent, },
  { path: 'form/:denominationCode', component: DenominationFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(denominationRoutes)],
    exports: [RouterModule]
})
export class DenominationRoutingModule { }
