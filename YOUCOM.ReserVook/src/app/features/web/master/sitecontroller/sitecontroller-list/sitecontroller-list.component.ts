import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../core/auth/auth.model';
import { SiteControllerInfo } from '../../sitecontroller/model/sitecontroller.model';
import { SiteControllerService } from '../../sitecontroller/services/sitecontroller.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemConst } from '../../../../../core/system.const';

@Component({
  selector: 'app-sitecontroller-list',
  templateUrl: './sitecontroller-list.component.html',
  styleUrls: ['./sitecontroller-list.component.scss']
})
export class SiteControllerListComponent implements OnInit {

  private currentUser : User;
  sitecontrollers: SiteControllerInfo[];

  constructor(private route: ActivatedRoute,private siteControllerService: SiteControllerService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
   }

   ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // 情報読込
    var condition = new SiteControllerInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;

    this.siteControllerService.GetSiteControllerList(condition).subscribe((res: SiteControllerInfo[]) => {
      this.sitecontrollers = res;
    });
  }
}
