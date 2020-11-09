import { HeaderService } from 'src/app/core/layout/header/header.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { CompanyInfo } from '../../../company/model/company.model';
import { CompanyService } from '../../../company/services/company.service';
import { User, EnumRole } from 'src/app/core/auth/auth.model';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})

export class CompanyListComponent implements OnInit, OnDestroy {

  private currentUser : User;
  public companyList: Array<CompanyInfo>;
  public isSuperAdmin : boolean;

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private route: ActivatedRoute,
              private companyService: CompanyService,
              private authService: AuthService,
              private header: HeaderService) {

    this.currentUser = this.authService.getLoginUser();
  }

  public ngOnDestroy(): void {
  }

  public ngOnInit(): void {

    // 権限判定
    if(this.currentUser.roleDivision == EnumRole.SuperAdmin.toString()){
      this.isSuperAdmin = true;
      this.companyService.getCompanyList().subscribe((res: Array<CompanyInfo>) => {
        this.companyList = res;
      });

    } else {
      this.isSuperAdmin = false;
      this.companyService.getCompany(this.currentUser.displayCompanyNo).subscribe((res: CompanyInfo) => {
        this.companyList = new Array<CompanyInfo>();
        this.companyList.push(res);
      });
    }
  }

  public delete(companyNo: string): void {

    let companyInfo = new CompanyInfo();
    companyInfo = this.companyList.find(element => element.companyNo == companyNo);
    companyInfo.updator = this.currentUser.userName;

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '施設名:'+ companyInfo.companyName + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.COMPANY_LIST + '001').then((result) => {

      if(result){
        this.companyService.deleteCompany(companyInfo).pipe().subscribe(result => {
          if (result == DBUpdateResult.VersionError) {
            // バージョンError
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.COMPANY_LIST + '001')
          }
          if (result == DBUpdateResult.Error) {
            // Error
            Common.modalMessageError(Message.TITLE_ERROR, '会社マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANY_LIST + '001');
          }

          this.companyService.getCompanyList().subscribe((res: Array<CompanyInfo>) => {
            this.companyList = res;
          });

        });
      }

    });
  }
}
