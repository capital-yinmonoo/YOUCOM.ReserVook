import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../core/auth/request.interceptor'
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatIconModule, MatInputModule, MatListModule,
         MatMenuModule, MatProgressBarModule, MatSelectModule, MatSidenavModule, MatSlideToggleModule, MatTabsModule, MatToolbarModule,
         MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,} from '@angular/material';
import { BidiModule } from '@angular/cdk/bidi';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { NgMaterialMultilevelMenuModule } from 'ng-material-multilevel-menu';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ErrorInterceptor } from '../core/auth/error.interceptor';
import { BillPrintComponent } from '../features/print/bill-print/bill-print.component';
import { DateToolComponent } from './datetool/datetool.component';
import { MonthtoolComponent } from './datetool/monthtool.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
  minScrollbarLength: 20
};

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BillPrintComponent
    , DateToolComponent // 共有するコンポーネントを追加
    , MonthtoolComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,

    LoadingBarRouterModule,
    FlexLayoutModule,
    BidiModule,
    PerfectScrollbarModule,
    NgMaterialMultilevelMenuModule,
    NgxDatatableModule,

    BillPrintComponent
    , DateToolComponent // 共有するコンポーネントを追加
    , MonthtoolComponent
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  entryComponents: []
})
export class SharedModule { }
