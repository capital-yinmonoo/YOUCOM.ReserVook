import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { NonAssignRoutingModule } from './nonassign-routing.module';
import { NonAssignListComponent } from './nonassign-list/nonassign-list.component';
import { MatTooltipModule } from '@angular/material';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    MatTooltipModule,
    NonAssignRoutingModule,
  ],
  declarations: [
    NonAssignListComponent,
  ],
})
export class NonAssignModule { }
