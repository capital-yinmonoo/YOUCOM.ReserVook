import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CleaningListComponent } from './cleaning-list/cleaning-list.component';
import { CleaningPrintComponent } from './cleaning-print/cleaning-print.component';

const cleaningsRoutes: Routes = [
    {
        path: '',
        component: CleaningListComponent,
    },
    {
      path: 'print',
      component: CleaningPrintComponent,
  },

];

@NgModule({
    imports: [RouterModule.forChild(cleaningsRoutes)],
    exports: [RouterModule]
})
export class CleaningsRoutingModule { }
