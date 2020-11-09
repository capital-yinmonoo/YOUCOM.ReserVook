import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillPrintComponent } from './bill-print.component';

const printRoutes: Routes = [
    { path: '', component: BillPrintComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(printRoutes)],
    exports: [RouterModule]
})
export class BillPrintRoutingModule { }
