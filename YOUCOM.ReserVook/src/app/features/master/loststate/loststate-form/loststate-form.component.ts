import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostStateService } from '../../loststate/services/loststate.service';
import { LostStateCommon } from '../../loststate/loststate.common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { LostStateInfo } from '../../loststate/model/loststate.model';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-loststate-form',
  templateUrl: './loststate-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss','./loststate-form.component.scss']
})
export class LostStateFormComponent implements OnInit, OnDestroy {

  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLength20 = 20;
  public readonly maxLength2 = 2;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 1以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 2文字以下で入力してください。 */
  public readonly msgMaxLength2 = this.maxLength2.toString() + Message.MAX_LENGTH;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLength20 = this.maxLength20.toString() + Message.MAX_LENGTH;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET_UPPER;

  Current_user :User;
  itemStateCode: string;
  colors = LostStateCommon.Colors;
  default = LostStateCommon.Default;
  updateFlg :boolean;

  lostStateForm = new FormGroup({
    companyNo: new FormControl(''),
    itemStateCode: new FormControl('',[Validators.required, Validators.pattern(this.CodeFormatPattern), Validators.maxLength(this.maxLength2)]),
    itemStateName: new FormControl('',[Validators.required,Validators.maxLength(this.maxLength20)]),
    color: new FormControl('', [Validators.required]),
    defaultFlagSearch: new FormControl('', [Validators.required]),
    defaultFlagEntry: new FormControl('', [Validators.required]),
    orderNo: new FormControl('',[Validators.required,Validators.min(this.min1),Validators.max(this.max9999)]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private lostStateService: LostStateService, private header: HeaderService) {
  // 取得したURLパラメータを渡す
  this.itemStateCode = this.route.snapshot.paramMap.get('itemStateCode');
  this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    var condition = new LostStateInfo();

    if (!Common.IsNullOrEmpty(this.itemStateCode)) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.itemStateCode = this.itemStateCode;

      this.lostStateService.GetLostStateById(condition).pipe().subscribe(lostStateinfo =>
        this.lostStateForm.patchValue(lostStateinfo));

    }else{
      this.updateFlg = false;
    }
  }
  onSubmit() {
    if (!Common.IsNullOrEmpty(this.itemStateCode)) {
      // 情報更新
      var updateData = this.lostStateForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.lostStateService.UpdateLostState(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.LOSTSTATE_FORM + '001');
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, '忘れ物状態設定マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTSTATE_FORM + '001');
            break;
        }
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.lostStateForm.value;
      addData.creator = this.Current_user.userName;
      addData.updator = this.Current_user.userName;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.version = 0; //nullだとエラーになるためここで0をセット

      this.lostStateService.InsertLostState(addData).pipe().subscribe(result => {
        switch(result) {
          case 0:
          this.router.navigate(['../../list/'], { relativeTo: this.route });
          break;
          case 1:
            Common.modalMessageError(Message.TITLE_WEAR_ERROR, Message.SAME_ERROR + '状態コード' + Message.UPDATE_ALREADY_ENTRY_ERROR, MessagePrefix.ERROR + FunctionId.LOSTSTATE_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }
}
