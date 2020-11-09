import { AuthAdminGuard } from './../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodenameListComponent } from './codename-list/codename-list.component';
import { CodenameFormComponent } from './codename-form/codename-form.component';

const codenameRoutes: Routes = [
  { path: 'form/:divisionCode', redirectTo: 'form/:divisionCode/', pathMatch: 'full'},
  { path: 'list/:divisionCode', component: CodenameListComponent, },
  { path: 'form/:divisionCode/:code', component: CodenameFormComponent,},
];

@NgModule({
    imports: [RouterModule.forChild(codenameRoutes)],
    exports: [RouterModule]
})
export class CodeNameRoutingModule { }
