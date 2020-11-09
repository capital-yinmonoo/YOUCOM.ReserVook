import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanConvertListComponent } from './planconvert-list/planconvert-list.component';
import { PlanConvertFormComponent } from './planconvert-form/planconvert-form.component';

const planconvertRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: PlanConvertListComponent, },
  { path: 'form/:scCd/:scPackagePlanCd/:scMealCond/:scSpecMealCond', component: PlanConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(planconvertRoutes)],
    exports: [RouterModule]
})
export class PlanConvertRoutingModule { }
