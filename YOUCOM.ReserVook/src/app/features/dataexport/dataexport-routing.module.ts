import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataExportComponent } from './dataexport-form/dataexport.component';

const dataexportRoutes: Routes = [
    {
        path: '',
        component: DataExportComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(dataexportRoutes)],
    exports: [RouterModule]
})
export class DataExportRoutingModule { }
