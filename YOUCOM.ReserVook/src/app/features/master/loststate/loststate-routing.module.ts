import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LostStateListComponent } from './loststate-list/loststate-list.component';
import { LostStateFormComponent } from './loststate-form/loststate-form.component';

const lostStateRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: LostStateListComponent, },
  { path: 'form/:itemStateCode', component: LostStateFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(lostStateRoutes)],
    exports: [RouterModule]
})
export class LostStateRoutingModule { }
