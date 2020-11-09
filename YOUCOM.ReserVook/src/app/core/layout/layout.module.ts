import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule }  from '../../shared/shared.module';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from '../../features/login/login.component';
import { AuthSuperAdminGuard, AuthAdminGuard, AuthStaffGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { DialogComponent } from '../../shared/dialog/dialog.component'
import { LoaderComponent } from '../../shared/loader/loader.component';
import { HeaderService } from './header/header.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        LayoutRoutingModule,
    ],
    declarations: [
        LayoutComponent,
        LoaderComponent,
        HeaderComponent,
        LoginComponent,
        DialogComponent,
    ],
    providers: [
        AuthSuperAdminGuard,
        AuthAdminGuard,
        AuthStaffGuard,
        AuthService,
        HeaderService
    ],
    entryComponents: [
      DialogComponent,
      LoaderComponent,
    ]
})
export class LayoutModule { }
