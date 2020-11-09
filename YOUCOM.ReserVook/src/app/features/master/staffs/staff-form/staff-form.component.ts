import { HeaderService } from 'src/app/core/layout/header/header.service';
import { isNullOrUndefined } from 'util';
import { CompanyService } from './../../../company/services/company.service';
import { AuthService } from './../../../../core/auth/auth.service';
import { User, EnumRole } from './../../../../core/auth/auth.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StaffService } from '../../../staffs/services/staff.service';
import { CompanyInfo } from '../../../company/model/company.model';
import { Staff } from 'src/app/features/staffs/model/staff.model';
import { HttpParams } from '@angular/common/http';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { Common } from 'src/app/core/common';
import { DBUpdateResult, FunctionId, Message, MessagePrefix, SystemConst } from 'src/app/core/system.const';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss','./staff-form.component.scss'],
})
export class StaffFormComponent implements OnInit, OnDestroy {

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 英字、数字、記号(_-.@)を半角で入力してください。 */
  public readonly msgPatternEmail = Message.PATTERN_EMAIL;
  /** 有効なメールアドレスを入力してください。 */
  public readonly msgValidityEmail = Message.VALIDITY_EMAIL;
  /** 文字以下で入力してください。 */
  public readonly msgMaxLength = Message.MAX_LENGTH;
  /** 文字以上で入力してください。 */
  public readonly msgMinLength = Message.MIN_LENGTH;
  /** 英字、数字、記号を半角で入力してください。 */
  public readonly patterAlphabetMark = Message.PATTERN_ALPHABET_MARK;

  public staffForm = new FormGroup({
    companyNo: new FormControl('',[Validators.required]),
    userEmail: new FormControl('',[Validators.required, Validators.maxLength(60), Validators.pattern('^([a-zA-Z0-9_\\-\\.\\@])*$'), CustomValidators.email]),
    password: new FormControl('',[Validators.required, Validators.maxLength(20), Validators.minLength(8),Validators.pattern('^[a-zA-Z0-9!-/:-@¥[-`{-~]*$')]),
    userName: new FormControl('',[Validators.required, Validators.maxLength(40)]),
    roleDivision : new FormControl('',[Validators.required]),
    lostFlg : new FormControl('',[Validators.required]),
    status : new FormControl(''),
    version : new FormControl(''),
    creator : new FormControl(''),
    updator : new FormControl(''),
    cdt : new FormControl(''),
    udt : new FormControl(''),
    userEmailOrigin : new FormControl(''),
  });

  // URL Prams
  private Current_user: User;
  private companyNo: string;
  private userEmail: string;

  // Master Data List
  public M_Companys: CompanyInfo[];
  public M_RoleDivs: CodeNameInfo[];
  public M_CleanLostUseDivs : CodeNameInfo[];

  public isSuperAdmin: boolean;
  public isUsedCleanLostCompany: boolean;

  constructor(private route: ActivatedRoute
              , private router: Router
              , private staffService: StaffService
              , private authService: AuthService
              , private companyService: CompanyService
              , private header: HeaderService) {

    this.companyNo = this.route.snapshot.paramMap.get('companyNo');
    this.userEmail = this.route.snapshot.paramMap.get('userEmail');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit(): void {

    this.header.lockCompanySeleter();

    // 権限判定
    if(this.Current_user.roleDivision == EnumRole.SuperAdmin.toString()){
      this.isSuperAdmin = true;

    } else {
      this.isSuperAdmin = false;

      // ログインユーザーと違うユーザーは編集不可
      if (this.companyNo != this.Current_user.companyNo || this.userEmail != this.Current_user.userEmail) {
        this.cancel();
      }

      if (this.authService.getDispCompanyNo() != this.Current_user.companyNo) {
        this.authService.removeDispCompanyNo();
        this.authService.setDispCompanyNo(this.Current_user.companyNo);
        location.reload();
      }

    }

    // 会社名リスト取得
    this.companyService.getCompanyList().subscribe((res: CompanyInfo[]) => {
      this.M_Companys = res;

      // 顧客がアカウント設定時、他の会社は取得しない
      if (!this.isSuperAdmin) {this.M_Companys = this.M_Companys.filter(f => f.companyNo == this.Current_user.companyNo); }

      this.judgeInputableCleanLostFlag();

    });

    // 更新時、既存データを取得
    if (!Common.IsNullOrEmpty(this.companyNo) && !Common.IsNullOrEmpty(this.userEmail)) {

      let condition = new Staff();
      condition.companyNo = this.companyNo;
      condition.userEmail = this.userEmail;

      this.staffService.GetStaff(condition).pipe().subscribe(user => {
        user.userEmailOrigin = user.userEmail;
        this.staffForm.patchValue(user);
      });

      this.GetMaster(condition.companyNo);

    }

  }

  /** 保存 */
  public onSubmit() {
    if (!Common.IsNullOrEmpty(this.companyNo) && !Common.IsNullOrEmpty(this.userEmail)) {
      // 更新
      var updateData: Staff = this.staffForm.value;
      updateData.updator = this.Current_user.userName;

      this.staffService.UpdateStaff(updateData).pipe().subscribe(result => {
        switch(result){

          // 正常
          case DBUpdateResult.Success:
            if(this.Current_user.roleDivision == EnumRole.SuperAdmin.toString()){
              // 権限が「システム管理者」の場合ユーザー管理の一覧へ遷移
              this.router.navigate(['/company/staffs/list'], { relativeTo: this.route });
            }else{
              Common.modalMessageNotice(Message.TITLE_WARNING, Message.RELOGIN_NOTICE, MessagePrefix.NOTICE + FunctionId.STAFFS_FORM + '001').then(() => {
                // 権限が「システム管理者」以外の場合一度ログアウトし、ログイン画面へ遷移
                this.authService.Logout().subscribe(() => {
                  this.router.navigate(['/login']);
                });
              });
            }
            break;

          // バージョンエラー
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.STAFFS_FORM + '001').then(() => {
              if(this.Current_user.roleDivision == EnumRole.SuperAdmin.toString()){
                // 権限が「システム管理者」の場合ユーザー管理の一覧へ遷移
                this.router.navigate(['/company/staffs/list'], { relativeTo: this.route });
              }else{
                // 権限が「システム管理者」以外の場合一度ログアウトし、ログイン画面へ遷移
                this.authService.Logout().subscribe(() => {
                  this.router.navigate(['/login']);
                });
              }
            });
            break;

          // 重複エラー
          case DBUpdateResult.OverlapError:
            Common.modalMessageError(Message.TITLE_WEAR_ERROR, Message.SAME_ERROR + 'メールアドレス' + Message.UPDATE_ALREADY_ENTRY_ERROR, MessagePrefix.ERROR + FunctionId.STAFFS_FORM + '001');
            break;

          // エラー
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, 'ユーザー管理' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.STAFFS_FORM + '002');
            break;
        }
        if(this.Current_user.roleDivision == EnumRole.SuperAdmin.toString()){
          // 権限が「システム管理者」の場合ユーザー管理の一覧へ遷移
          this.router.navigate(['/company/staffs/list'], { relativeTo: this.route });
        }else{
          // 権限が「システム管理者」以外の場合アサイン状況の一覧へ遷移
          this.router.navigate(['../../../../rooms'], { relativeTo: this.route });
        }
      });

    } else {
      // 追加
      var addData: Staff = this.staffForm.value;
      addData.userEmailOrigin = addData.userEmail;
      addData.version = 0; //nullだとエラーになるためここで0をセット
      addData.creator = this.Current_user.userName;
      addData.updator = this.Current_user.userName;

      this.staffService.AddStaff(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['/company/staffs/list'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_WEAR_ERROR, Message.SAME_ERROR + 'メールアドレス' + Message.ADD_ALREADY_ENTRY_ERROR, MessagePrefix.ERROR + FunctionId.STAFFS_FORM + '003');
        }
      });
    }
  }

  // 中止
  public cancel(): void {
    if (this.Current_user.roleDivision == EnumRole.SuperAdmin.toString()) {
      this.router.navigate(['/company/staffs/list'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../../../rooms'], { relativeTo: this.route });
    }
  }

  /** 会社名の選択 */
  public selectCompany(): void {

    this.GetMaster(this.staffForm.value.companyNo);
    this.judgeInputableCleanLostFlag();
  }

  /** 関連マスタ取得 */
  private GetMaster(companyNo: string) {

    let hParams = new HttpParams();
    hParams = hParams.append('companyNo', companyNo);

    // 権限リスト取得
    this.staffService.GetRoleList(hParams).subscribe((res: CodeNameInfo[]) => {
      this.M_RoleDivs = res;
    });

    // 清掃・忘れ物管理 使用リスト取得
    this.staffService.GetLostFlgList(hParams).subscribe((res: CodeNameInfo[]) => {
      this.M_CleanLostUseDivs = res;
    });

  }

  /** 清掃・忘れ物管理の入力可否を判定 */
  private judgeInputableCleanLostFlag(){
    // 会社で禁止されている場合、清掃・忘れ物管理は変更不可
    if (isNullOrUndefined(this.staffForm.value.companyNo)) {
      this.isUsedCleanLostCompany = true;
    }
    else {
      const lostFlg = this.M_Companys.find(f => f.companyNo == this.staffForm.value.companyNo).lostFlg;
      if(lostFlg == SystemConst.STATUS_USED){
        this.isUsedCleanLostCompany = true;

      } else {
        this.staffForm.patchValue({lostFlg: "0"});
        this.isUsedCleanLostCompany = false;
      }
    }
  }

}
