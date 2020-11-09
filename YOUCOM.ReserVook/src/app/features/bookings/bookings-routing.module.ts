import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingsComponent } from './bookings.component';

const bookingsRoutes: Routes = [
    {
        path: '',
        component: BookingsComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(bookingsRoutes)],
    exports: [RouterModule]
})
export class BookingsRoutingModule { }
