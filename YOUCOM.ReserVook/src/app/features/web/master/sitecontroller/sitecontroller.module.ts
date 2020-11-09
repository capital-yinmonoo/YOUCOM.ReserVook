import { AuthAdminGuard } from './../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { SiteControllerRoutingModule }  from './sitecontroller-routing.module';
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
import { SiteControllerListComponent } from './sitecontroller-list/sitecontroller-list.component';
import { SiteControllerFormComponent } from './sitecontroller-form/sitecontroller-form.component';
import { SiteControllerService } from './services/sitecontroller.service';

@NgModule({
  imports: [
    SharedModule,
    SiteControllerRoutingModule,
    SharedModule,
    MatTabsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    DragulaModule.forRoot()

  ],
  declarations: [
    SiteControllerListComponent,
    SiteControllerFormComponent,
  ],
  providers: [SiteControllerService],

})
export class SiteControllerModule { }
