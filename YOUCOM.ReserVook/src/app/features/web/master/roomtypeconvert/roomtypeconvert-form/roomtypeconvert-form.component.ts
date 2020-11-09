import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomTypeConvertService } from '../../roomtypeconvert/services/roomtypeconvert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { RoomTypeConvertInfo } from '../../roomtypeconvert/model/roomtypeconvert.model';
import { SystemConst } from '../../../../../core/system.const';
import { CodeNameInfo } from '../../../../master/codename/model/codename.model';
import { ScNameInfo } from '../../../../web/master/scname/model/scname.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-roomtypeconvert-form',
  templateUrl: './roomtypeconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss', './roomtypeconvert-form.component.scss']
})
export class RoomTypeConvertFormComponent implements OnInit, OnDestroy {

  public readonly maxLength30 = 30;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角英数で入力してください。 */
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET;
  //** を選択してください。 */
  public readonly msgChooseArticle = Message.CHOOSE_ARTICLE;

  //** 30文字以下で入力してください。 */
  public readonly msgMaxLength30 = this.maxLength30.toString() + Message.MAX_LENGTH;;

  Current_user :User;
  scCd :string;
  scRmtypeCd :string;
  updateFlg :boolean;
  codes :ScNameInfo[];
  roomtypes :CodeNameInfo[];

  roomTypeConvertForm : FormGroup;

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private roomTypeConvertService: RoomTypeConvertService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.scRmtypeCd = this.route.snapshot.paramMap.get('scRmtypeCd');
    this.Current_user = this.authService.getLoginUser();

    this.roomTypeConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd,[Validators.required]),
      scRmtypeCd: new FormControl('',[Validators.required, Validators.pattern('([0-9a-zA-Z])*$'),Validators.maxLength(30)]),
      rmtypeCd: new FormControl('',[Validators.required, Validators.pattern('^[^#]*$')]),
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
    var condition = new RoomTypeConvertInfo();

    if (this.scCd, this.scRmtypeCd) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.scCd = this.scCd;
      condition.scRmtypeCd = this.scRmtypeCd;

      this.roomTypeConvertService.GetRoomTypeConvertById(condition).pipe().subscribe(siteConvertinfo =>
        this.roomTypeConvertForm.patchValue(siteConvertinfo));
    }else{
      this.updateFlg = false;
    }

    // SCコード
    this.roomTypeConvertService.GetScCdList(hParams).subscribe((res : ScNameInfo[]) => {
      this.codes = res;
    });

    // 部屋タイプ
    this.roomTypeConvertService.GetRoomTypeList(hParams).subscribe((res : CodeNameInfo[]) => {
      this.roomtypes = res;
    });

  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.scCd) && !Common.IsNullOrEmpty(this.scRmtypeCd)) {
      // 情報更新
      var updateData = this.roomTypeConvertForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      this.roomTypeConvertService.UpdateRoomTypeConvert(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMTYPECONVERT_FORM + '001')
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, '部屋タイプ変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMTYPECONVERT_FORM + '001');
            break;
        }
        this.router.navigate(['../../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.roomTypeConvertForm.value;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.updateCnt = 0; //nullだとエラーになるためここで0をセット
      addData.programId = ''; // 空値を入れる
      addData.createClerk = this.Current_user.userName;
      addData.createMachineNo = ''; // 空値を入れる
      addData.updateClerk = this.Current_user.userName;
      addData.updateMachineNo = ''; // 空値を入れる

      this.roomTypeConvertService.InsertRoomTypeConvert(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_ERROR, '使用中の同じサイト部屋タイプコードが既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.ROOMTYPECONVERT_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../list/'], { relativeTo: this.route });
  }
}
