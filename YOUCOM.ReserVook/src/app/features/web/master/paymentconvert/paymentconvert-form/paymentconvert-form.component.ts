import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentConvertService } from '../../paymentconvert/services/paymentconvert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { PaymentConvertInfo } from '../../paymentconvert/model/paymentconvert.model';
import { SystemConst } from '../../../../../core/system.const';
import { ScNameInfo } from '../../../../web/master/scname/model/scname.model';
import { SiteConvertInfo } from '../../../../web/master/siteconvert/model/siteconvert.model';
import { CodeNameInfo } from '../../../../master/codename/model/codename.model';
import { DenominationInfo } from '../../../../master/denomination/model/denominationinfo.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-paymentconvert-form',
  templateUrl: './paymentconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss', './paymentconvert-form.component.scss']
})
export class PaymentConvertFormComponent implements OnInit, OnDestroy {

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** を選択してください。 */
  public readonly msgChooseArticle = Message.CHOOSE_ARTICLE;

  Current_user: User;
  scCd: string;
  scSiteCd: string;
  scPaymentOpts: string;
  updateFlg: boolean;
  codes: ScNameInfo[];
  sitecodes: SiteConvertInfo[];
  payments: CodeNameInfo[];
  denominations: DenominationInfo[];

  paymentConvertForm : FormGroup;

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private paymentConvertService: PaymentConvertService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.scSiteCd = this.route.snapshot.paramMap.get('scSiteCd');
    this.scPaymentOpts = this.route.snapshot.paramMap.get('scPaymentOpts');
    this.Current_user = this.authService.getLoginUser();

    this.paymentConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd,[Validators.required]),
      scSiteCd: new FormControl('',[Validators.required]),
      scPaymentOpts: new FormControl('',[Validators.required]),
      denominationCode: new FormControl('',[Validators.required, Validators.pattern('^[^#]*$')]),
      updateCnt: new FormControl(''),
      programId: new FormControl(''),
      createClerk: new FormControl(''),
      createMachineNo: new FormControl(''),
      createMachine: new FormControl(''),
      createDatetime: new FormControl(''),
      updateClerk: new FormControl(''),
      updateMachineNo: new FormControl(''),
      updateMachine: new FormControl(''),
      updateDatetime: new FormControl(''),
    });

  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    var condition = new PaymentConvertInfo();

    if (this.scCd, this.scSiteCd) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.scCd = this.scCd;
      condition.scSiteCd = this.scSiteCd;
      condition.scPaymentOpts = this.scPaymentOpts;

      this.paymentConvertService.GetPaymentConvertById(condition).pipe().subscribe(paymentConvertinfo =>
        this.paymentConvertForm.patchValue(paymentConvertinfo));
    }else{
      this.updateFlg = false;
    }

    var scParams = new HttpParams();
    scParams = scParams.append('companyNo', this.Current_user.displayCompanyNo).append('scCd',this.scCd);
    var masParams = new HttpParams();
    masParams = masParams.append('companyNo', this.Current_user.displayCompanyNo);

    // 表示用
    // SCコード
    this.paymentConvertService.GetScCdList(masParams).subscribe((res : ScNameInfo[]) => {
      this.codes = res;
    });

    // SCサイトコード
    this.paymentConvertService.GetSiteCodeList(scParams).subscribe((res : SiteConvertInfo[]) => {
      this.sitecodes = res;
    });

    // 決済方法
    this.paymentConvertService.GetSettlementList(masParams).subscribe((res : CodeNameInfo[]) => {
      this.payments = res;
    });

    // 金種
    this.paymentConvertService.GetDenominationList(masParams).subscribe((res : DenominationInfo[]) => {
      this.denominations = res;
    });
  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.scCd) && !Common.IsNullOrEmpty(this.scSiteCd) && !Common.IsNullOrEmpty(this.scPaymentOpts)) {
      // 情報更新
      var updateData = this.paymentConvertForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.paymentConvertService.UpdatePaymentConvert(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.PAYMENTCONVERT_FORM + '001');
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, '支払方法変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.PAYMENTCONVERT_FORM + '001');
            break;
        }
        this.router.navigate(['../../../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.paymentConvertForm.value;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.updateCnt = 0; //nullだとエラーになるためここで0をセット
      addData.programId = ''; // 空値を入れる
      addData.createClerk = this.Current_user.userName;
      addData.createMachineNo = ''; // 空値を入れる
      addData.updateClerk = this.Current_user.userName;
      addData.updateMachineNo = ''; // 空値を入れる

      this.paymentConvertService.InsertPaymentConvert(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_WEAR_ERROR, '使用中の同じサイト名、同じ決済方法が既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.PAYMENTCONVERT_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../../list/'], { relativeTo: this.route });
  }

  // サイトコード切替
  public selectScCode() {

    var scParams = new HttpParams();
    scParams = scParams.append('companyNo', this.Current_user.displayCompanyNo).append('scCd',this.paymentConvertForm.controls.scCd.value);

    // SCサイトコード
    this.paymentConvertService.GetSiteCodeList(scParams).subscribe((res : SiteConvertInfo[]) => {
      this.sitecodes = res;
    });
  }
}
