import { ReserveSearchComponent } from './features/dialog/reservesearch/reservesearch.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule }  from './shared/shared.module';

//Some import before, add this
import {MatMomentDateModule, MomentDateModule} from '@angular/material-moment-adapter';


// // Depending on whether rollup is used, moment needs to be imported differently.
// // Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// // syntax. However, rollup creates a synthetic default module and we thus need to import it using
// // the `default as` syntax.
// import * as _moment from 'moment';
// // tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';

// const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD(ddd)',
  },
  display: {
    dateInput: 'YYYY/MM/DD(ddd)',
    monthYearLabel: 'YYYY年MM',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};
import { MAT_LABEL_GLOBAL_OPTIONS } from "@angular/material";

import { CoreModule } from './core/core.module';
import { LayoutModule } from './core/layout/layout.module';
import { RequestInterceptor } from './core/auth/request.interceptor'
import { ErrorInterceptor } from './core/auth/error.interceptor';
import { GuestSearchComponent } from './features/dialog/guestsearch/guestsearch.component';
import { DetailedSearchFormComponent } from './features/detailedsearch/detailedsearch-form/detailedsearch-form.component';
import { LumpDeleteFormComponent } from './features/lumpdelete/lumpdelete-form/lumpdelete-form.component';
import { TrustyouLogComponent } from './features/dialog/trustyoulog/trustyoulog.component';
import { UseResultsComponent } from './features/dialog/useresults/useresults.component';
import { ReserveLogComponent } from './features/dialog/reservelog/reservelog.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    MatMomentDateModule,
    MomentDateModule,

    SharedModule,
    CoreModule,
    LayoutModule,
  ],
  declarations: [
    AppComponent,
    GuestSearchComponent,
    ReserveSearchComponent,
    DetailedSearchFormComponent,
    LumpDeleteFormComponent,
    TrustyouLogComponent,
    UseResultsComponent,
    ReserveLogComponent
  ],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    // {
    //   provide: DateAdapter,
    //   useClass: MomentDateAdapter,
    //   deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    // },

    // {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
   {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'} }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    // DialogComponent
    GuestSearchComponent,
    ReserveSearchComponent,
    DetailedSearchFormComponent,
    LumpDeleteFormComponent,
    TrustyouLogComponent,
    UseResultsComponent,
    ReserveLogComponent
  ]
})
export class AppModule { }
