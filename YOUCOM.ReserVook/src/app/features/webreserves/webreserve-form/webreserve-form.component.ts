import { Message, DBUpdateResult } from '../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../../../core/auth/auth.model';
import { Router, ParamMap } from '@angular/router';

import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Common } from "src/app/core/common";

import { WebReserveBaseInfo } from '../model/webreservebase.model';
import { WebReserveInfo } from '../model/webreserve.model';
import { WebreserveService } from '../services/webreserve.service';

import { AuthService } from '../../../core/auth/auth.service';
import { SystemConst } from '../../../core/system.const';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-webreserve-form',
  templateUrl: './webreserve-form.component.html',
  styleUrls: ['./webreserve-form.component.scss']
})
export class WebreserveFormComponent implements OnInit, OnDestroy
{
  private currentUser : User;
  scCd: string;
  scRcvSeq: number
  webReserveBaseInfo: WebReserveBaseInfo;
  webReserveInfo: WebReserveInfo;
  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  isTLL : boolean = false;

  constructor(private route: ActivatedRoute, private WebreserveService: WebreserveService, private authService:AuthService, private header: HeaderService) {
    this.currentUser = this.authService.getLoginUser();
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.scCd = param.get("scCd");
      this.scRcvSeq = Common.ToNumber(param.get("scRcvSeq"));
      if(this.scCd == SystemConst.SC_CD_TLL){
        this.isTLL = true;
      }else{
        this.isTLL = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit(): void {

    this.header.lockCompanySeleter();

    var condition = new WebReserveBaseInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;
    condition.scCd = this.scCd;
    condition.scRcvSeq = this.scRcvSeq;

    this.WebreserveService.getWebreserveInfo(condition).subscribe(
      ((res : WebReserveInfo) =>
      {
        this.webReserveInfo = res;
      }
    ),
    error => {
      alert(error);
    });
  }

}
