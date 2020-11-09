import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { SharedModule } from 'src/app/shared/shared.module';
import { CompanyGroupRoutingModule } from './companygroup-routing.module';
import { CompanyGroupService } from './services/companygroup.service';
import { CompanyGroupListComponent } from './companygroup-list/companygroup-list.component';
import { CompanyGroupFormComponent } from './companygroup-form/companygroup-form.component';
import { MatTableModule } from '@angular/material';

@NgModule({
  declarations: [
    CompanyGroupFormComponent,
    CompanyGroupListComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    HttpModule,
    CommonModule,
    MatTableModule,
    CompanyGroupRoutingModule
  ],
  providers: [CompanyGroupService],
})
export class CompanyGroupModule { }

