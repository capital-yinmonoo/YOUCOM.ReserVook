import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { RemarksConvertRoutingModule }  from './remarksconvert-routing.module';
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
import { RemarksConvertListComponent } from './remarksconvert-list/remarksconvert-list.component';
import { RemarksConvertFormComponent } from './remarksconvert-form/remarksconvert-form.component';
import { RemarksConvertService } from './services/remarksconvert.service';

@NgModule({
  imports: [
    SharedModule,
    RemarksConvertRoutingModule,
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
    RemarksConvertListComponent,
    RemarksConvertFormComponent,
  ],
  providers: [RemarksConvertService],

})
export class RemarksConvertModule { }
