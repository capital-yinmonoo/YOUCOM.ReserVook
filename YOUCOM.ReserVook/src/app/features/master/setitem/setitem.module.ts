import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { SharedModule } from 'src/app/shared/shared.module';
import { SetItemRoutingModule } from './setitem-routing.module';
import { SetItemService } from './services/setitem.service';
import { SetItemListComponent } from './setitem-list/setitem-list.component';
import { SetItemFormComponent } from './setitem-form/setitem-form.component';
import { MatTableModule } from '@angular/material';

@NgModule({
  declarations: [
    SetItemFormComponent,
    SetItemListComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    CommonModule,
    MatTableModule,
    SetItemRoutingModule
  ],
  providers: [SetItemService],
})
export class SetItemModule { }

