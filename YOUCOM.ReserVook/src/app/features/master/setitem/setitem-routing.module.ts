import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetItemListComponent } from './setitem-list/setitem-list.component';
import { SetItemFormComponent } from './setitem-form/setitem-form.component';

const setItemRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: SetItemListComponent },
  { path: 'form/:id', component: SetItemFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(setItemRoutes)],
  exports: [RouterModule]

})
export class SetItemRoutingModule { }
