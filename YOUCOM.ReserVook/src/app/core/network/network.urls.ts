import { NgModule, OnInit } from '@angular/core';
import { apiUrl } from '../../../assets/environment.json';

export enum ServiceType {
    account = 0 ,
    buy,
}

@NgModule({
})
export class NetworkUrls implements OnInit
{
    public urls: string[] = [ apiUrl && '/user/emailAndPwd' ]
    ngOnInit () {
    }
}
