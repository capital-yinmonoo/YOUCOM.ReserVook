import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerService } from '../../customer/services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { CustomerInfo } from '../../customer/model/customerinfo.model';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';
import { UseResultsComponent } from '../../../dialog/useresults/useresults.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit, OnDestroy {

  public readonly phoneFormatPattern = '^[0-9-+ ]*$';
  public readonly zipFormatPattern = '(\\d{3})[-]?(\\d{4})';
  public readonly emailFormatPattern = '^([a-zA-Z0-9_\\-\\.\\@])*$';
  public readonly kanaFormatPattern = '^[0-9０-９a-zA-Zァ-ンヴー 　]*$';

  public readonly maxLength8 = 8;
  public readonly maxLength10 = 10;
  public readonly maxLength20 = 20;
  public readonly maxLength60 = 60;
  public readonly maxLength100 = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  /** 形式(999-9999)で入力してください。 */
  public readonly msgPatternZip = Message.PATTERN_ZIP
  /** 半角数字とハイフン(-)で入力してください。 */
  public readonly msgPatternPhone = Message.PATTERN_PHONE;
  /** 半角英数で入力してください。 */
  public readonly msgPatternEmail = Message.PATTERN_EMAIL;

  //** 8文字以下で入力してください。 */
  public readonly msgMaxLength8 = this.maxLength8.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLength10 = this.maxLength10.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLength20 = this.maxLength20.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLength60 = this.maxLength60.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLength100 = this.maxLength100.toString() + Message.MAX_LENGTH;

  customerNo :string;
  Current_user :User;
  updateFlg: boolean;

  customerForm = new FormGroup({
    companyNo: new FormControl(''),
    customerNo: new FormControl(''),
    customerName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLength100)]),
    customerKana: new FormControl('',[Validators.required, Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLength100)]),
    zipCode: new FormControl('',[Validators.pattern(this.zipFormatPattern), Validators.maxLength(this.maxLength8)]),
    address: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    phoneNo: new FormControl('',[Validators.required, Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLength20)]),
    mobilePhoneNo: new FormControl('',[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLength20)]),
    email: new FormControl('',[Validators.pattern(this.emailFormatPattern), Validators.maxLength(this.maxLength60)]),
    companyName: new FormControl('',[ Validators.maxLength(this.maxLength100)]),
    remarks1: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    remarks2: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    remarks3: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    remarks4: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    remarks5: new FormControl('',[Validators.maxLength(this.maxLength100)]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private customerService: CustomerService, private header: HeaderService, public dialog: MatDialog) {
    // 取得したURLパラメータを渡す
    this.customerNo = this.route.snapshot.paramMap.get('customerNo');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    this.updateFlg = false;

    if (this.customerNo) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      var cond = new CustomerInfo();
      cond.companyNo = this.Current_user.displayCompanyNo;
      cond.customerNo = this.customerNo;
      this.customerService.GetCustomerById(cond).pipe().subscribe(customerinfo => this.customerForm.patchValue(customerinfo));
    }
  }

  onSubmit() {
    var customer = this.customerForm.value;
    customer.updator = this.Current_user.userName;

    if (this.customerNo) {
      // 顧客情報の更新
      this.customerNo = this.customerNo;

      this.customerService.UpdateCustomer(customer).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.CUSTOMER_FORM + '001')
            break;

          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, '顧客マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.CUSTOMER_FORM + '001');
            break;
          }
          this.router.navigate(['../../list/'], { relativeTo: this.route });
      });

    } else {
      // 顧客情報の追加
      customer.creator = this.Current_user.userName;
      customer.companyNo = this.Current_user.displayCompanyNo;
      customer.version = 0; //nullだとエラーになるためここで0をセット

      this.customerService.InsertCustomer(customer).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../list/'], { relativeTo: this.route });
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }


  /** 利用実績画面を起動 */
  public OpenUseResults(){
    var customer = this.customerForm.value;

    let customerNo = customer.customerNo;
    let customerName = customer.customerName;

    let dialogRef = this.dialog.open(UseResultsComponent
      , { width: '70vw', height: 'auto'
          , data: {customerNo: customerNo, customerName: customerName}
      });
  }

}
