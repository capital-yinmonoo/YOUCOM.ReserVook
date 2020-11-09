import { NgModule } from '@angular/core';
import { roomInfoComponent } from '../master/rooms/room-form/room-form.component';
import { RoomAssignComponent } from './room-assign/room-assign.component';
import { SharedModule }  from '../../shared/shared.module';
import { RoomsRoutingModule }  from './rooms-routing.module';
import { RoomService} from './services/room.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule, MatIconModule, MatSnackBarModule, MatButtonModule, MatTooltipModule } from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { RoomListComponent } from '../master/rooms/room-list/room-list.component';
import { RoomDisplayLocationComponent } from '../master/rooms/room-display-location/room-display-location.component';
import { RoomDetailsComponent } from './room-details/room-details.component';

@NgModule({
  imports: [
    SharedModule,
    RoomsRoutingModule,
    MatTabsModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    FlexLayoutModule,
    DragulaModule.forRoot()
  ],
  declarations: [
    roomInfoComponent,
    RoomAssignComponent,
    RoomListComponent,
    RoomDisplayLocationComponent,
    RoomDetailsComponent
  ],
  providers: [RoomService],
})
export class RoomsModule { }
