import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DenominationService } from '../../denomination/services/denomination.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { DenominationInfo, ReceiptDivs } from '../../denomination/model/denominationinfo.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-denomination-form',
  templateUrl: './denomination-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './denomination-form.component.scss']
})
export class DenominationFormComponent implements OnInit, OnDestroy {

  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLengthDenominationName = 60;
  public readonly maxLengthPrintName = 40;
  public readonly maxLengthDenominationCode = 10;

  /** 領収区分(0:領収金額に含める, 1:領収金額に含めない) */
  public readonly receiptDivs : any[] = ReceiptDivs;

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  /** 1以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  /** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  /** 40文字以下で入力してください。 */
  public readonly msgMaxLengthDenominationName = this.maxLengthDenominationName.toString() + Message.MAX_LENGTH;
  /** 60文字以下で入力してください。 */
  public readonly msgMaxLengthPrintName = this.maxLengthPrintName.toString() + Message.MAX_LENGTH;
  /** 10文字以下で入力してください。 */
  public readonly msgMaxLengthDenominationCode = this.maxLengthDenominationCode.toString() + Message.MAX_LENGTH;

  denominationCode :string;
  Current_user :User;
  updateFlg: boolean;

  denominationForm = new FormGroup({
    companyNo: new FormControl(''),
    denominationCode: new FormControl('',[Validators.required, Validators.pattern(this.CodeFormatPattern),Validators.maxLength(this.maxLengthDenominationCode)]),
    denominationName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthDenominationName)]),
    printName: new FormControl('', [Validators.required,Validators.maxLength(this.maxLengthPrintName)]),
    receiptDiv: new FormControl('', [Validators.required]),
    displayOrder: new FormControl('',[Validators.required,Validators.min(this.min1),Validators.max(this.max9999)]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private denominationService: DenominationService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.denominationCode = this.route.snapshot.paramMap.get('denominationCode');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    var condition = new DenominationInfo();

    if (!Common.IsNullOrEmpty(this.denominationCode)) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.denominationCode = this.denominationCode;

      this.denominationService.GetDenominationById(condition).pipe().subscribe(denominationinfo =>
        this.denominationForm.patchValue(denominationinfo));
    }else{
      this.updateFlg = false;
    }

    var masParams = new HttpParams();
    masParams = masParams.append('companyNo', this.Current_user.displayCompanyNo);
  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.denominationCode)) {
      // 情報更新
      var updateData = this.denominationForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.denominationService.UpdateDenomination(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.DENOMINATION_FORM+ '001');
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, '金種マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.DENOMINATION_FORM+ '001');
            break;
        }
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.denominationForm.value;
      addData.creator = this.Current_user.userName;
      addData.updator = this.Current_user.userName;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.version = 0; //nullだとエラーになるためここで0をセット

      this.denominationService.InsertDenomination(addData).pipe().subscribe(result => {
        switch(result) {
          case 0:
          this.router.navigate(['../../list/'], { relativeTo: this.route });
          break;
          case 1:
            Common.modalMessageError(Message.TITLE_WEAR_ERROR, '使用中の同じ金種コードが既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.DENOMINATION_FORM+ '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }
}
