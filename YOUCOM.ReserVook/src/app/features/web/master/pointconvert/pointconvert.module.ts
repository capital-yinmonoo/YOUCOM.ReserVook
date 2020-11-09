import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { PointConvertRoutingModule }  from './pointconvert-routing.module';
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
import { PointConvertListComponent } from './pointconvert-list/pointconvert-list.component';
import { PointConvertFormComponent } from './pointconvert-form/pointconvert-form.component';
import { PointConvertService } from './services/pointconvert.service';

@NgModule({
  imports: [
    SharedModule,
    PointConvertRoutingModule,
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
    PointConvertListComponent,
    PointConvertFormComponent,
  ],
  providers: [PointConvertService],

})
export class PointConvertModule { }
