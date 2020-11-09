import { AuthAdminGuard } from './../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { SiteConvertRoutingModule }  from './siteconvert-routing.module';
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
import { SiteConvertListComponent } from './siteconvert-list/siteconvert-list.component';
import { SiteConvertFormComponent } from './siteconvert-form/siteconvert-form.component';
import { SiteConvertService } from './services/siteconvert.service';

@NgModule({
  imports: [
    SharedModule,
    SiteConvertRoutingModule,
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
    SiteConvertListComponent,
    SiteConvertFormComponent,
  ],
  providers: [SiteConvertService],

})
export class SiteConvertModule { }
