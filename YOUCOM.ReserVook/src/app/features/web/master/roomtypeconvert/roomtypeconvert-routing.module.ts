import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomTypeConvertListComponent } from './roomtypeconvert-list/roomtypeconvert-list.component';
import { RoomTypeConvertFormComponent } from './roomtypeconvert-form/roomtypeconvert-form.component';

const roomtypeconvertRoutes: Routes = [
  { path: 'form/', redirectTo: '/master/roomtypeconvert/list', pathMatch: 'full'},
  { path: 'list', component: RoomTypeConvertListComponent, },
  { path: 'form/:scCd/:scRmtypeCd', component: RoomTypeConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(roomtypeconvertRoutes)],
    exports: [RouterModule]
})
export class RoomTypeConvertRoutingModule { }
