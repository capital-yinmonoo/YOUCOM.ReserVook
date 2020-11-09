import { SharedModule }  from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { MatGridListModule, MatNativeDateModule, MatTableModule } from '@angular/material';
import { BookingsComponent } from './bookings.component';
import { BookingsRoutingModule }  from './bookings-routing.module';

@NgModule({
  imports: [
    SharedModule,
    MatGridListModule,
    MatNativeDateModule,
    MatTableModule,
    BookingsRoutingModule
  ],
  declarations: [
    BookingsComponent,
  ]
})
export class BookingsModule { }
