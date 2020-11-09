import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'

import { itemRoutingModule } from './item-routing.module';
import { itemListComponent } from "../master/item/item-list/item-list.component";
import { itemFormComponent} from "../master/item/item-form/item-form.component";
import { itemService} from "./services/item.service";


@NgModule({
  declarations: [
    itemFormComponent,
    itemListComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    CommonModule,
    itemRoutingModule
  ],
  providers: [itemService],
})
export class ItemModule { }

