import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SiteConvertService } from '../../siteconvert/services/siteconvert.service';
import { SiteConvertCommon } from '../../siteconvert/siteconvert.common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { SiteConvertInfo } from '../../siteconvert/model/siteconvert.model';
import { SystemConst } from '../../../../../core/system.const';
import { AgentInfo } from '../../../../master/agent/model/agentinfo.model';
import { ScNameInfo } from '../../../../web/master/scname/model/scname.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-siteconvert-form',
  templateUrl: './siteconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss', './siteconvert-form.component.scss']
})
export class SiteConvertFormComponent implements OnInit, OnDestroy {

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLength30 = 30;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;
  //** 半角英数で入力してください。 */
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET;
  //** を選択してください。 */
  public readonly msgChooseArticle = Message.CHOOSE_ARTICLE;

  //** 0以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 30文字以下で入力してください。 */
  public readonly msgMaxLength30 = this.maxLength30.toString() + Message.MAX_LENGTH;

  Current_user :User;
  scSiteCd :string;
  scCd :string;
  posision: string;

  siteConvertForm :FormGroup;

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  peopleDivision = SiteConvertCommon.PeopleDivision;
  posisionsRadio = SiteConvertCommon.PosisionsRadio;
  updateFlg :boolean;
  codes :ScNameInfo[];
  agents: AgentInfo[];

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private siteConvertService: SiteConvertService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.scSiteCd = this.route.snapshot.paramMap.get('scSiteCd');
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.Current_user = this.authService.getLoginUser();

    this.siteConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd ,[Validators.required]),
      scSiteCd: new FormControl('',[Validators.required, Validators.pattern('([0-9a-zA-Z])*$'),Validators.maxLength(this.maxLength30)]),
      scSiteNm: new FormControl('',[Validators.required, Validators.maxLength(this.maxLength30)]),
      travelAgncCd: new FormControl('',[Validators.required, Validators.pattern('^[^#]*$')]),
      scPositionMan: new FormControl('',[Validators.required]),
      scPositionWoman: new FormControl('',[Validators.required]),
      scPositionChildA: new FormControl('',[Validators.required]),
      scPositionChildB: new FormControl('',[Validators.required]),
      scPositionChildC: new FormControl('',[Validators.required]),
      scPositionChildD: new FormControl('',[Validators.required]),
      scPositionChildE: new FormControl('',[Validators.required]),
      scPositionChildF: new FormControl('',[Validators.required]),
      scPositionChildOther: new FormControl('',[Validators.required]),
      scPersonCalcSeg: new FormControl('',[Validators.required]),
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

    var hParams = new HttpParams();
    hParams = hParams.append('companyNo', this.Current_user.displayCompanyNo);
    var condition = new SiteConvertInfo();

    if (this.scSiteCd) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.scCd = this.scCd;
      condition.scSiteCd = this.scSiteCd;

      this.siteConvertService.GetSiteConvertById(condition).pipe().subscribe(siteConvertinfo =>
        this.siteConvertForm.patchValue(siteConvertinfo));
    }else{
      this.updateFlg = false;
    }

    // SCコード
    this.siteConvertService.GetScCdList(hParams).subscribe((res : ScNameInfo[]) => {
      this.codes = res;
    });

    // エージェント
    this.siteConvertService.GetAgentList(hParams).subscribe((res : AgentInfo[]) => {
      this.agents = res;
    });
  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.scCd) && !Common.IsNullOrEmpty(this.scSiteCd)) {
      // 情報更新
      var updateData = this.siteConvertForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.siteConvertService.UpdateSiteConvert(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.SITECONVERT_FORM + '001')
            break;
          default:
            Common.modalMessageError(Message.TITLE_ERROR, 'サイト変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SITECONVERT_FORM + '001');
            break;
        }
        this.router.navigate(['../../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.siteConvertForm.value;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.updateCnt = 0; //nullだとエラーになるためここで0をセット
      addData.programId = ''; // 空値を入れる
      addData.createClerk = this.Current_user.userName;
      addData.createMachineNo = ''; // 空値を入れる
      addData.updateClerk = this.Current_user.userName;
      addData.updateMachineNo = ''; // 空値を入れる

      this.siteConvertService.InsertSiteConvert(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_ERROR, '使用中の同じサイトコードが既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.SITECONVERT_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../list/'], { relativeTo: this.route });
  }
}
