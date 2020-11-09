import { SharedModule }  from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { MatGridListModule, MatNativeDateModule, MatTableModule } from '@angular/material';
import { DataExportComponent } from './dataexport-form/dataexport.component';
import { DataExportRoutingModule }  from './dataexport-routing.module';

@NgModule({
  imports: [
    SharedModule,
    MatGridListModule,
    MatNativeDateModule,
    MatTableModule,
    DataExportRoutingModule
  ],
  declarations: [
    DataExportComponent,
  ]
})
export class DataExportModule { }
