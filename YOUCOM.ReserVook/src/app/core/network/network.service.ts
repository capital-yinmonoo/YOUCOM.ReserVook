import { Injectable,NgModule} from '@angular/core';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import{ServiceType,NetworkUrls} from "../network/network.urls";

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }


@Injectable()@NgModule({
    imports: [
        NetworkUrls,
      ],
  })
export class NetworkService<T>
{
    constructor (public http: HttpClient) {

    }
    private nUrls = new NetworkUrls();

    ReqPost(e:ServiceType,obj:Object){
        console.error(this.nUrls.urls[e]);
        return this.http.post(this.nUrls.urls[e], obj, httpOptions)
    }
    RecPost(rec: (val: T) => void ,vall:T){
        rec(vall);
    }
}