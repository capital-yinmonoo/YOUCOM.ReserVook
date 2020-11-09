import { Message, DBUpdateResult } from '../../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { RemarksConvertInfo } from '../model/remarksconvert.model';
import { RemarksConvertService } from '../services/remarksconvert.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-remarksconvert-list',
  templateUrl: './remarksconvert-list.component.html',
  styleUrls: ['./remarksconvert-list.component.scss']
})
export class RemarksConvertListComponent implements OnInit {

  private currentUser : User;
  remarksconverts: RemarksConvertInfo[];

  constructor(private route: ActivatedRoute,private remarksConvertService: RemarksConvertService,private authService:AuthService, private dialog: MatDialog) {
    this.currentUser = this.authService.getLoginUser();
   }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

   ngOnInit(): void {
    // 情報読込
    var condition = new RemarksConvertInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.remarksConvertService.GetRemarksConvertList(condition).subscribe((res: RemarksConvertInfo[]) => {
      this.remarksconverts = res;
    });
   }

}
