import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmincomeComponent } from './confirmincome.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmincomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmincomeRoutingModule { }