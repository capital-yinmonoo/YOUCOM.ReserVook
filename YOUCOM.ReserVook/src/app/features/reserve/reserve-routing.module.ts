import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReserveComponent } from './reserve-form/reserve.component';

const routes: Routes = [
  {
    path: '',
    component: ReserveComponent,
  },
  {
    path: ':reserveNo',
    component: ReserveComponent,
  },
  {
    path: ':params',
    component: ReserveComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReserveRoutingModule { }
