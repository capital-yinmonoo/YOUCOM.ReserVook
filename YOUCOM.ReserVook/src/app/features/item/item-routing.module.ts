import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { itemListComponent } from "../master/item/item-list/item-list.component";
import { itemFormComponent} from "../master/item/item-form/item-form.component";

const itemRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: itemListComponent, },
  { path: 'form/:id', component: itemFormComponent, }
];

@NgModule({
  imports: [RouterModule.forChild(itemRoutes)],
  exports: [RouterModule]

})
export class itemRoutingModule { }
