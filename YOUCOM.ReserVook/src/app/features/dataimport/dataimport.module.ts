import { SharedModule }  from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { MatGridListModule, MatNativeDateModule, MatTableModule } from '@angular/material';
import { DataImportComponent } from './dataimport-form/dataimport.component';
import { DataImportRoutingModule }  from './dataimport-routing.module';

@NgModule({
  imports: [
    SharedModule,
    MatGridListModule,
    MatNativeDateModule,
    MatTableModule,
    DataImportRoutingModule
  ],
  declarations: [
    DataImportComponent,
  ]
})
export class DataImportModule { }
