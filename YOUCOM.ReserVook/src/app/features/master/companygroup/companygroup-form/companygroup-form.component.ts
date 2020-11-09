import { isNullOrUndefined } from 'util';
import { DBUpdateResult, FunctionId, Message, MessagePrefix } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { CompanyGroupService } from '../services/companygroup.service';
import { CompanyGroupInfo } from '../model/companygroup.model';

@Component({
  selector: 'app-companygroup-form',
  templateUrl: './companygroup-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './companygroup-form.component.scss']
})
export class CompanyGroupFormComponent implements OnInit {
  /** 会社グループID */
  private companyGroupId: string;

  /** ログインユーザー情報 */
  private currentUser: User;

  /** True:更新 False:新規作成 */
  public isUpdate: boolean = false;

//#region --------------- Input Form ---------------
  public readonly CodeFormatPattern = '([0-9A-Z])*$';

  public readonly maxLengthGrpupCompanyName = 100;
  public readonly maxLengthGrpupCompanyId = 10;

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  /** 100文字以下で入力してください。 */
  public readonly msgMaxLengthGrpupCompanyName = this.maxLengthGrpupCompanyName.toString() + Message.MAX_LENGTH;
  /** 10文字以下で入力してください。 */
  public readonly msgMaxLengthGrpupCompanyId = this.maxLengthGrpupCompanyId.toString() + Message.MAX_LENGTH;

  /** 入力フォーム */
  public inputForm = new FormGroup({
    companyGroupId: new FormControl("",[Validators.required, Validators.pattern(this.CodeFormatPattern),Validators.maxLength(this.maxLengthGrpupCompanyId)]),
    companyGroupName : new FormControl("",[Validators.required, Validators.maxLength(this.maxLengthGrpupCompanyName)]),
    status: new FormControl(""),
    version: new FormControl(""),
    creator: new FormControl(""),
    updator: new FormControl(""),
    cdt: new FormControl(""),
    udt: new FormControl(""),
  });
//#endregion

  constructor(private route: ActivatedRoute
              , private router: Router
              , private companyGroupService: CompanyGroupService
              , private authService: AuthService) {

    this.companyGroupId = this.route.snapshot.paramMap.get("id");
    this.currentUser = this.authService.getLoginUser();

  }

  ngOnInit(): void {

    // 更新時、登録データ取得
    if (!Common.IsNullOrEmpty(this.companyGroupId)) {
      this.isUpdate = true;
      this.getMasterItem();
    }

  }

  /** 保存 */
  public onSubmit() {

    // 画面内容をセット
    let info = new CompanyGroupInfo();
    info.companyGroupId = this.inputForm.controls["companyGroupId"].value;
    info.companyGroupName = this.inputForm.controls["companyGroupName"].value;

    if (this.isUpdate) { this.update(info); }
    else { this.add(info); }

  }

  /** 中止 */
  public cancel() {
    this.router.navigate(["../../list/"], { relativeTo: this.route });
  }

//#region ---- Data Access --------------------------------------------------
  /** マスタデータ取得 */
  private getMasterItem() {

    // 登録情報取得
    let cond = new CompanyGroupInfo();
    cond.companyGroupId = this.companyGroupId;
    this.companyGroupService.getCompanyGroupByPK(cond).pipe().subscribe(result => {
      this.inputForm.patchValue(result);
    });

  }

  /** 更新 */
  private update(info: CompanyGroupInfo){

    info.status = this.inputForm.controls["status"].value;
    info.version = this.inputForm.controls["version"].value;
    info.cdt = this.inputForm.controls["cdt"].value;
    info.creator = this.inputForm.controls["creator"].value;
    info.updator = this.currentUser.userName;

    this.companyGroupService.updateCompanyGroup(info).pipe().subscribe(result => {
      switch (result) {
        case DBUpdateResult.Success:
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;

        case DBUpdateResult.VersionError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.COMPANYGROUP_FORM + '001');
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, "会社グループマスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANYGROUP_FORM + '001');
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;
      }
    });

  }

  /** 追加 */
  private add(info: CompanyGroupInfo){

    info.creator = this.currentUser.userName;
    info.updator = this.currentUser.userName;
    info.version = 0;

    this.companyGroupService.addCompanyGroup(info).pipe().subscribe(result => {
      switch (result) {
        case DBUpdateResult.Success:
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;

        case DBUpdateResult.OverlapError:
          Common.modalMessageError(Message.TITLE_ERROR, "使用中の同じ会社グループIDが既に存在しているため新規登録できません。", MessagePrefix.ERROR + FunctionId.COMPANYGROUP_FORM + '002');
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, "会社グループマスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANYGROUP_FORM + '003');
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;
      }
    });
  }
//#endregion

}
