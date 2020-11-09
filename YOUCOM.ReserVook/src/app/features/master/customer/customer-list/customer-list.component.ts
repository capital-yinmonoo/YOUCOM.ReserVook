import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { CustomerInfo } from '../model/customerinfo.model';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  private currentUser : User;

  public customers: CustomerInfo[];

  constructor(private route: ActivatedRoute,private customerService: CustomerService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // 顧客情報読込み
    var customer = new CustomerInfo();
    customer.companyNo = this.currentUser.displayCompanyNo;

    this.customerService.GetCustomerList(customer).subscribe((res: CustomerInfo[]) => {
      this.customers = res;
    });
  }

  // 顧客情報の削除
  delete(customerNo: string): void {

    var customer = new CustomerInfo();
    customer = this.customers.find(element => element.customerNo == customerNo);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '顧客:'+ customer.customerName + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.CUSTOMER_LIST+ '001').then((res) => {
      if(res){
        this.deleteCustomerInfo(customer);
      }
    });
  }

  deleteCustomerInfo(customer: CustomerInfo){

    customer.updator = this.currentUser.userName;

    this.customerService.DeleteCustomerInfoById(customer).pipe().subscribe(result => {
      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.CUSTOMER_LIST+ '001')
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError(Message.TITLE_ERROR, '顧客マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.CUSTOMER_LIST+ '001');
      }
      customer.companyNo = this.currentUser.displayCompanyNo;
      this.customerService.GetCustomerList(customer).subscribe((res: CustomerInfo[]) => {
        this.customers = res;
      });
    });
  }
}
