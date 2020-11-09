import { AuthAdminGuard } from './../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roomInfoComponent } from '../master/rooms/room-form/room-form.component';
import { RoomAssignComponent } from './room-assign/room-assign.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { RoomListComponent } from '../master/rooms/room-list/room-list.component';
import { RoomDisplayLocationComponent } from '../master/rooms/room-display-location/room-display-location.component';

const roomsRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: '', component: RoomAssignComponent,},
  { path: 'list', component: RoomListComponent, canActivate: [ AuthAdminGuard ]},
  { path: 'displaylocation', component: RoomDisplayLocationComponent, canActivate: [ AuthAdminGuard ]},
  { path: 'form/:roomNo', component: roomInfoComponent, canActivate: [ AuthAdminGuard ]},
  { path: 'details/:reserveNo', component: RoomDetailsComponent, canActivate: [ AuthAdminGuard ]}
];

@NgModule({
    imports: [RouterModule.forChild(roomsRoutes)],
    exports: [RouterModule]
})
export class RoomsRoutingModule { }
