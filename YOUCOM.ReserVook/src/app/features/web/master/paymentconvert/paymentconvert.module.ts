import { AuthAdminGuard } from '../../../../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SharedModule }  from '../../../../shared/shared.module';
import { PaymentConvertRoutingModule }  from './paymentconvert-routing.module';
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
import { PaymentConvertListComponent } from './paymentconvert-list/paymentconvert-list.component';
import { PaymentConvertFormComponent } from './paymentconvert-form/paymentconvert-form.component';
import { PaymentConvertService } from './services/paymentconvert.service';

@NgModule({
  imports: [
    SharedModule,
    PaymentConvertRoutingModule,
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
    PaymentConvertListComponent,
    PaymentConvertFormComponent,
  ],
  providers: [PaymentConvertService],

})
export class PaymentConvertModule { }
