import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { CompanyRoutingModule } from './company-routing.module';
import { CompanyListComponent } from '../master/company/company-list/company-list.component';
import { CompanyFormComponent } from '../master/company/company-form/company-form.component';
import { CompanyService } from './services/company.service';

@NgModule({

  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    CompanyRoutingModule,
  ],
  declarations: [
    CompanyListComponent,
    CompanyFormComponent,
  ],
  providers: [CompanyService],
})
export class CompanyModule { }
