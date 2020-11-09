import { NgModule } from '@angular/core';
import { HttpService } from './network/http.service';
import { LoaderService } from './layout/loader/loader.service';

@NgModule({
    declarations: [
    ],
    imports: [
    ],
    exports: [
    ],
    providers: [
        LoaderService,
        HttpService,
    ]
})
export class CoreModule { }
