import { SharedModule } from '../../shared/shared.module';
import { ReserveRoutingModule } from './reserve-routing.module';
import { NgModule } from '@angular/core';
import { MatTableModule, MatSnackBarModule, MatTooltipModule, MatPaginatorModule } from '@angular/material';
import { ReserveComponent } from './reserve-form/reserve.component';
import { SalesDetailsComponent } from './reserve-form/salesdetails-form/salesdetails.component';
import { ItemsComponent } from './reserve-form/salesdetails-form/items/items.component';

@NgModule({
  imports: [
    SharedModule,
    ReserveRoutingModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  declarations: [
    ReserveComponent
    , SalesDetailsComponent
    , ItemsComponent
  ],
})
export class ReserveModule { }
