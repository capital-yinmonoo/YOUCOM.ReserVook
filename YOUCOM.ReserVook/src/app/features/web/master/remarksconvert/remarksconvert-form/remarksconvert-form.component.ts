import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RemarksConvertService } from '../../remarksconvert/services/remarksconvert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { RemarksConvertInfo } from '../../remarksconvert/model/remarksconvert.model';
import { SystemConst } from '../../../../../core/system.const';
import { ScNameInfo } from '../../../../web/master/scname/model/scname.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { MatDialog } from '@angular/material';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-remarksconvert-form',
  templateUrl: './remarksconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss','./remarksconvert-form.component.scss']
})
export class RemarksConvertFormComponent implements OnInit, OnDestroy {

  public readonly minDigits0 = 0;
  public readonly maxDigits9 = 9;
  public readonly maxDigits9999 = 9999;

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 0以上の値で入力してください。 */
  public readonly msgMinDigits0 = this.minDigits0.toString() + Message.MIN_DIGITS;
  /** 9以下の値で入力してください。 */
  public readonly msgMaxDigits9 = this.maxDigits9.toString() + Message.MAX_DIGITS;
  /** 9999以下の値で入力してください。 */
  public readonly msgMaxDigits9999 = this.maxDigits9999.toString() + Message.MAX_DIGITS;

  Current_user: User;
  scCd: string;
  scXClmn: string;
  codes: ScNameInfo[];

  remarksConvertForm : FormGroup;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private remarksConvertService: RemarksConvertService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.scXClmn = this.route.snapshot.paramMap.get('scXClmn');
    this.Current_user = this.authService.getLoginUser();

    this.remarksConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd,[Validators.required]),
      scXClmn: new FormControl('',[Validators.required]),
      scXClmnKanji: new FormControl('',[Validators.required]),
      scRemarksSetLocation: new FormControl('',[Validators.required,Validators.min(this.minDigits0),Validators.max(this.maxDigits9)]),
      scRemarksPriorityOdr: new FormControl('',[Validators.required,Validators.min(this.minDigits0),Validators.max(this.maxDigits9999)]),
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
    this.header.lockCompanySeleter();

    var condition = new RemarksConvertInfo();
    condition.companyNo = this.Current_user.displayCompanyNo;
    condition.scCd = this.scCd;
    condition.scXClmn = this.scXClmn;

    this.remarksConvertService.GetRemarksConvertById(condition).pipe().subscribe(remarksConvertinfo =>
      this.remarksConvertForm.patchValue(remarksConvertinfo));

    var masParams = new HttpParams();
    masParams = masParams.append('companyNo', this.Current_user.displayCompanyNo);

    // 表示用
    // SCコード
    this.remarksConvertService.GetScCdList(masParams).subscribe((res : ScNameInfo[]) => {
      this.codes = res;
    });
  }

  onSubmit() {
    // 情報更新
    var updateData = this.remarksConvertForm.value;
    updateData.companyNo = this.Current_user.displayCompanyNo;
    updateData.updateClerk = this.Current_user.userName;

    this.remarksConvertService.UpdateRemarksConvert(updateData).pipe().subscribe(result => {
      switch(result){
        case DBUpdateResult.Success:
          break;
        case DBUpdateResult.VersionError:
          Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.REMARKSCONVERT_FORM + '001');
          break;
        case DBUpdateResult.Error:
          Common.modalMessageError(Message.TITLE_ERROR, '備考変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.REMARKSCONVERT_FORM + '001');
          break;
      }
      this.router.navigate(['../../../list/'], { relativeTo: this.route });
    });
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../list/'], { relativeTo: this.route });
  }
}
