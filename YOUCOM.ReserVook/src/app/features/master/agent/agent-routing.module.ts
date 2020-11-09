import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentFormComponent } from './agent-form/agent-form.component';

const agentRoutes: Routes = [
    { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
    { path: 'list', component: AgentListComponent, },
    { path: 'form/:agentCode', component: AgentFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(agentRoutes)],
    exports: [RouterModule]
})
export class AgentRoutingModule { }
