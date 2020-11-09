import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from '../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SiteControllerService } from '../../sitecontroller/services/sitecontroller.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { SiteControllerInfo } from '../../sitecontroller/model/sitecontroller.model';
import { SystemConst } from '../../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-sitecontroller-form',
  templateUrl: './sitecontroller-form.component.html',
  styleUrls: ['./sitecontroller-form.component.scss']
})
export class SiteControllerFormComponent implements OnInit, OnDestroy {

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';

  public readonly maxLength50 = 50;
  public readonly maxLength100 = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabe = Message.PATTERN_ALPHABET;

  //** 50文字以下で入力してください。 */
  public readonly msgMaxLength50 = this.maxLength50.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLength100 = this.maxLength100.toString() + Message.MAX_LENGTH;

  Current_user :User;

  siteControllerForm = new FormGroup({
  companyNo: new FormControl(''),
  scCd: new FormControl(''),
  scUseFlg: new FormControl('',[Validators.required]),
  scSystemId: new FormControl('',[Validators.required,Validators.pattern('([0-9a-zA-Z])*$'),Validators.maxLength(this.maxLength50)]),
  scUsrId: new FormControl('',[Validators.required,Validators.pattern('([0-9a-zA-Z])*$'), Validators.maxLength(this.maxLength50)]),
  scUsrPassword: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z0-9!-/:-@¥[-`{-~]*$'), Validators.maxLength(this.maxLength50)]),
  scNewRcvFlg: new FormControl('',[Validators.required]),
  scCancellationRcvFlg: new FormControl('',[Validators.required]),
  scReservationRcvUrl: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z0-9!-/:-@¥[-`{-~]*$'), Validators.maxLength(this.maxLength100)]),
  scReservationRcvCompUrl: new FormControl('',[Validators.pattern('^[a-zA-Z0-9!-/:-@¥[-`{-~]*$'), Validators.maxLength(this.maxLength100)]),
  updateCnt: new FormControl(''),
  });

  useFlg = [{key: '0',value: '利用しない'},{key: '1',value: '利用する'}];
  rcvFlg = [{key: '0',value: '取り込まない'},{key: '1',value:'取り込む'}];
  siteName : string = "";
  usesFlg :boolean;
  argScCd : string;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private siteControllerService: SiteControllerService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.argScCd = this.route.snapshot.paramMap.get('scCd');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    this.header.lockCompanySeleter();

    // 画面表示
    var condition = new SiteControllerInfo();
    condition.companyNo = this.Current_user.displayCompanyNo;
    condition.scCd = this.argScCd;

    this.siteControllerService.GetSiteControllerById(condition).pipe().subscribe(siteControllerInfo => {
      this.siteName = siteControllerInfo.cdName;
      this.siteControllerForm.patchValue(siteControllerInfo);
      this.selectUseFlg();
    });
  }

  // 利用フラグ切り替え
  public selectUseFlg() {
    if (this.siteControllerForm.controls.scUseFlg.value == '0') {
      this.usesFlg = false;
    }else{
      this.usesFlg = true;
    }
  }

  onSubmit() {
    // 情報更新
    var siteControllerInfo = this.siteControllerForm.value;
    siteControllerInfo.updateClerk = this.Current_user.userName;

    this.siteControllerService.UpdateSiteController(siteControllerInfo).pipe().subscribe(result => {

      switch(result){
        case DBUpdateResult.Success:
          break;

        case DBUpdateResult.VersionError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.SITECONTROLLER_FORM + '001')
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, 'WEB基本マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SITECONTROLLER_FORM + '001');
          break;
      }

      this.router.navigate(['../../list/'], { relativeTo: this.route });
    });
  }


  useCheck(){
    if(this.usesFlg){
      return this.siteControllerForm.invalid
    }else{
      return false;
    }
  }

  cancel(){
    this.router.navigate([''], { relativeTo: this.route });
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }

}
