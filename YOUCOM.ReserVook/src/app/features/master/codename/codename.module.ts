import { NgModule } from '@angular/core';
// import { RoomsComponent } from './rooms.component';
// import { roomInfoComponent } from '../mastar/rooms/room-form/room-form.component';
// import { RoomAssignComponent } from './room-assign/room-assign.component';
import { SharedModule }  from '../../../shared/shared.module';
import { CodeNameRoutingModule }  from './codename-routing.module';
// import { RoomService} from './services/room.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatListModule
} from '@angular/material';
import { DragulaModule } from 'ng2-dragula';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { CodenameListComponent } from './codename-list/codename-list.component';
import { CodenameFormComponent } from './codename-form/codename-form.component';
import { CodenameService } from './services/codename.service';


// import { DateToolComponent } from './daytool/daytool.component';
// import { RoomListComponent } from '../mastar/rooms/room-list/room-list.component';

@NgModule({
  imports: [
    SharedModule,
    CodeNameRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    //RouterModule.forChild(RoomsRoutingModule),
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    DragulaModule.forRoot()

    //================================
  ],
  declarations: [
    CodenameListComponent,
    CodenameFormComponent,
    // RoomAssignComponent,
    // DateToolComponent,
    // RoomListComponent
  ],
  providers: [CodenameService],
})
export class CodenameModule { }
