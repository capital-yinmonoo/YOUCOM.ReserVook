import { AuthAdminGuard } from '../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NameSearchListComponent } from './namesearch.component';

const nameSearchRoutes: Routes = [
  { path: '', component: NameSearchListComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(nameSearchRoutes)],
    exports: [RouterModule]
})
export class NameSearchRoutingModule { }
