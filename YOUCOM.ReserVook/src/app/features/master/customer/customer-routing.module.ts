import { AuthAdminGuard } from '../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';

const customerRoutes: Routes = [
  { path: 'form', redirectTo: 'form/', pathMatch: 'full'},
  { path: 'list', component: CustomerListComponent, },
  { path: 'form/:customerNo', component: CustomerFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(customerRoutes)],
    exports: [RouterModule]
})
export class CustomerRoutingModule { }
