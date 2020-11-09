import { Component } from '@angular/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';


export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD(ddd)',
  },
  display: {
    dateInput: 'YYYY/MM/DD(ddd)',
    monthYearLabel: 'YYYY年MM月',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},

  //   // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
  //   // `MatMomentDateModule` in your applications root module. We provide it at the component level
  //   // here, due to limitations of our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
  //   {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AppComponent {
  title = 'ReserVook';

  constructor() {
    // translate.addLangs(['en', 'fr']);
    // translate.setDefaultLang('en');

    // const browserLang: string = translate.getBrowserLang();
    // translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');

    // this._adapter.setLocale('fr');
  }
}
