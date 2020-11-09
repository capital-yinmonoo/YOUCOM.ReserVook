import { AuthAdminGuard } from '../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WebreserveListComponent } from './webreserve-list/webreserve-list.component';
import { WebreserveFormComponent } from './webreserve-form/webreserve-form.component';

const webreservesRoutes: Routes = [
  { path: '', component: WebreserveListComponent, },
  { path: ':scCd/:scRcvSeq', component: WebreserveFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(webreservesRoutes)],
    exports: [RouterModule]
})
export class WebreservesRoutingModule { }
