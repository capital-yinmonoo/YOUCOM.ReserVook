import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataImportComponent } from './dataimport-form/dataimport.component';

const dataimportRoutes: Routes = [
    {
        path: '',
        component: DataImportComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(dataimportRoutes)],
    exports: [RouterModule]
})
export class DataImportRoutingModule { }
