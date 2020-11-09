import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NonAssignListComponent } from './nonassign-list/nonassign-list.component';

const assignmentsRoutes: Routes = [
    { path: '', component: NonAssignListComponent,},
];

@NgModule({
    imports: [RouterModule.forChild(assignmentsRoutes)],
    exports: [RouterModule]
})
export class NonAssignRoutingModule { }
