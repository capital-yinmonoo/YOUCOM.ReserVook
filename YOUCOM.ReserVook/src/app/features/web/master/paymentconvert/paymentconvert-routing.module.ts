import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentConvertListComponent } from './paymentconvert-list/paymentconvert-list.component';
import { PaymentConvertFormComponent } from './paymentconvert-form/paymentconvert-form.component';

const paymentconvertRoutes: Routes = [
  { path: 'form', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: PaymentConvertListComponent, },
  { path: 'form/:scCd/:scSiteCd/:scPaymentOpts', component: PaymentConvertFormComponent, },
];

@NgModule({
    imports: [RouterModule.forChild(paymentconvertRoutes)],
    exports: [RouterModule]
})
export class PaymentConvertRoutingModule { }
