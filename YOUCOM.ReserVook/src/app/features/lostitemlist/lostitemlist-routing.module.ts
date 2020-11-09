import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LostItemListListComponent } from './lostitemlist-list/lostitemlist-list.component';
import { LostItemListFormComponent } from './lostitemlist-form/lostitemlist-form.component';

const lostItemListRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: LostItemListListComponent, },
  { path: 'form/:managementNo', component: LostItemListFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(lostItemListRoutes)],
    exports: [RouterModule]
})
export class LostItemListRoutingModule { }
