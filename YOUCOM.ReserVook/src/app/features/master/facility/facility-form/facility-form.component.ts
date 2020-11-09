import { FacilityService } from 'src/app/features/facility/services/facility.service';
import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component,OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { MstFacilityInfo } from 'src/app/features/facility/model/facility.model';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-facility-form',
  templateUrl: './facility-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './facility-form.component.scss']
})

export class FacilityFormComponent implements OnInit, OnDestroy{

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly codeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLengthFacilityCode = 10;
  public readonly maxLengthFacilityName = 40;
  public readonly maxLengthRemarks = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  //** 0以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 40文字以下で入力してください。 */
  public readonly msgMaxLengthFacilityName = this.maxLengthFacilityName.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLengthFacilityCode = this.maxLengthFacilityCode.toString() + Message.MAX_LENGTH;;

  public facilityCode: string;
  private currentUser: User;
  public updateFlg: boolean;

  public facilityForm = new FormGroup({
    facilityCode: new FormControl('',[Validators.required, Validators.pattern(this.codeFormatPattern), Validators.maxLength(this.maxLengthFacilityCode)]),
    facilityName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthFacilityName)]),
    displayOrder: new FormControl('',[Validators.required, Validators.min(this.min1), Validators.max(this.max9999)]),
    companyNo: new FormControl(''),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private facilityService: FacilityService,
              private header: HeaderService) {

    // 取得したURLパラメータを渡す
    this.facilityCode = this.route.snapshot.paramMap.get('code');
    this.currentUser = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    this.updateFlg = false;

    if (this.facilityCode) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      let facility = new MstFacilityInfo();
      facility.companyNo = this.currentUser.displayCompanyNo;
      facility.facilityCode = this.facilityCode;

      this.facilityService.getFacility(facility).pipe().subscribe(res => this.facilityForm.patchValue(res));

    }
  }

  onSubmit() {

    // 条件セット
    let facility = new MstFacilityInfo();
    facility = this.facilityForm.value;
    facility.updator = this.currentUser.userName;

    if (this.facilityCode) {
      // 会場情報の更新
      facility.facilityCode = this.facilityCode;

      this.facilityService.update(facility).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;

          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.FACILITY_FORM + '001')
            break;

          default:
            Common.modalMessageError(Message.TITLE_ERROR, '会場マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY_FORM + '001');
            break;
        }
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      })

    } else {

      // 会場情報の追加
      facility.creator = this.currentUser.userName;
      facility.companyNo = this.currentUser.displayCompanyNo;
      facility.version = 0; //nullだとエラーになるためここで0をセット

      this.facilityService.add(facility).pipe().subscribe(result => {
        switch (result) {
          case DBUpdateResult.Success:
            this.router.navigate(['../../list/'], { relativeTo: this.route });
            break;

          case DBUpdateResult.OverlapError:
            Common.modalMessageError(Message.TITLE_ERROR, '使用中の同会場コードが既に存在しているため<br>新規登録できません。', MessagePrefix.ERROR + FunctionId.FACILITY_FORM + '002');
            break;

          default:
            Common.modalMessageError(Message.TITLE_ERROR, '会場マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.FACILITY_FORM + '003');
            break;
        }
      });
    }
  }

  /** 中止 */
  public cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }

}
