import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PointConvertService } from '../../pointconvert/services/pointconvert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { PointConvertInfo } from '../../pointconvert/model/pointconvert.model';
import { SystemConst } from '../../../../../core/system.const';
import { ScNameInfo } from '../../../../web/master/scname/model/scname.model';
import { SiteConvertInfo } from '../../../../web/master/siteconvert/model/siteconvert.model';
import { DenominationInfo } from '../../../../master/denomination/model/denominationinfo.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-pointconvert-form',
  templateUrl: './pointconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss', './pointconvert-form.component.scss']
})
export class PointConvertFormComponent implements OnInit, OnDestroy {

  public readonly maxLength50 = 50;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 30文字以下で入力してください。 */
  public readonly msgMaxLength50 = this.maxLength50.toString() + Message.MAX_LENGTH;;
  //** を選択してください。 */
  public readonly msgChooseArticle = Message.CHOOSE_ARTICLE;

  Current_user: User;
  scCd: string;
  scSiteCd: string;
  scPntsDiscntNm: string;
  updateFlg: boolean;
  codes: ScNameInfo[];
  sitecodes: SiteConvertInfo[];
  denominations: DenominationInfo[];

  pointConvertForm : FormGroup;

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private pointConvertService: PointConvertService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.scSiteCd = this.route.snapshot.paramMap.get('scSiteCd');
    this.scPntsDiscntNm = this.route.snapshot.paramMap.get('scPntsDiscntNm');
    this.Current_user = this.authService.getLoginUser();

    this.pointConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd,[Validators.required]),
      scSiteCd: new FormControl('',[Validators.required]),
      scPntsDiscntNm: new FormControl(''),
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

      pntsDiscntName: new FormControl('',[Validators.required, Validators.maxLength(50)]),
    });
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    var condition = new PointConvertInfo();

    if (!Common.IsNullOrEmpty(this.scCd) && !Common.IsNullOrEmpty(this.scSiteCd)) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.scCd = this.scCd;
      condition.scSiteCd = this.scSiteCd;
      condition.scPntsDiscntNm = this.scPntsDiscntNm;

      this.pointConvertService.GetPointConvertById(condition).pipe().subscribe(pointConvertinfo =>
        this.pointConvertForm.patchValue(pointConvertinfo));
    }else{
      this.updateFlg = false;
    }

    var scParams = new HttpParams();
    scParams = scParams.append('companyNo', this.Current_user.displayCompanyNo).append('scCd',this.scCd);
    var masParams = new HttpParams();
    masParams = masParams.append('companyNo', this.Current_user.displayCompanyNo);

    // 表示用
    // SCコード
    this.pointConvertService.GetScCdList(masParams).subscribe((res : ScNameInfo[]) => {
      this.codes = res;
    });

    // SCサイトコード
    this.pointConvertService.GetSiteCodeList(scParams).subscribe((res : SiteConvertInfo[]) => {
      this.sitecodes = res;
    });

    // 金種
    this.pointConvertService.GetDenominationList(masParams).subscribe((res : DenominationInfo[]) => {
      this.denominations = res;
    });
  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.scCd) && !Common.IsNullOrEmpty(this.scSiteCd)) {
      // 情報更新
      var updateData = this.pointConvertForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.pointConvertService.UpdatePointConvert(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.POINTCONVERT_FORM + '001');
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, 'ポイント変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.POINTCONVERT_FORM + '001');
            break;
        }
        this.router.navigate(['../../../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.pointConvertForm.value;
      addData.scPntsDiscntNm = addData.pntsDiscntName;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.updateCnt = 0; //nullだとエラーになるためここで0をセット
      addData.programId = ''; // 空値を入れる
      addData.createClerk = this.Current_user.userName;
      addData.createMachineNo = ''; // 空値を入れる
      addData.updateClerk = this.Current_user.userName;
      addData.updateMachineNo = ''; // 空値を入れる

      this.pointConvertService.InsertPointConvert(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_WEAR_ERROR, '使用中の同じサイト名、同じポイント割引・補助金名が既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.POINTCONVERT_FORM + '002');
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
    scParams = scParams.append('companyNo', this.Current_user.displayCompanyNo).append('scCd',this.pointConvertForm.controls.scCd.value);

    // SCサイトコード
    this.pointConvertService.GetSiteCodeList(scParams).subscribe((res : SiteConvertInfo[]) => {
      this.sitecodes = res;
    });
  }
}
