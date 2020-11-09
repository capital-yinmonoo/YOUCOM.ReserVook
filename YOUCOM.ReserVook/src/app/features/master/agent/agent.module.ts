import { AuthAdminGuard } from './../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../shared/shared.module';
import { AgentRoutingModule }  from './agent-routing.module';
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
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentFormComponent } from './agent-form/agent-form.component';
import { AgentService } from './services/agent.service';

@NgModule({
  imports: [
    SharedModule,
    AgentRoutingModule,
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
    AgentListComponent,
    AgentFormComponent,
  ],
  providers: [AgentService],

})
export class AgentModule { }
