import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrustyouListComponent } from './trustyou-list/trustyou-list.component';

const trustyouRoutes: Routes = [
    {
        path: '',
        component: TrustyouListComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(trustyouRoutes)],
    exports: [RouterModule]
})
export class TrustyouRoutingModule { }
