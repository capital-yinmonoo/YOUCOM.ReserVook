import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { RoomTypeConvertRoutingModule }  from './roomtypeconvert-routing.module';
import { MatTabsModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule,
  MatRadioModule
} from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { RoomTypeConvertListComponent } from './roomtypeconvert-list/roomtypeconvert-list.component';
import { RoomTypeConvertFormComponent } from './roomtypeconvert-form/roomtypeconvert-form.component';
import { RoomTypeConvertService } from './services/roomtypeconvert.service';

@NgModule({
  imports: [
    SharedModule,
    RoomTypeConvertRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    FlexLayoutModule,
    DragulaModule.forRoot()
  ],
  declarations: [
    RoomTypeConvertListComponent,
    RoomTypeConvertFormComponent,
  ],
  providers: [RoomTypeConvertService],

})
export class RoomTypeConvertModule { }
