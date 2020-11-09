import { HeaderService } from 'src/app/core/layout/header/header.service';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { CompanyGroupService } from './../../companygroup/services/companygroup.service';
import { EnumRole } from './../../../../core/auth/auth.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CompanyInfo } from '../../../company/model/company.model';
import { CompanyService } from '../../../company/services/company.service';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { CompanyGroupInfo } from '../../companygroup/model/companygroup.model';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './company-form.component.scss']
})

export class CompanyFormComponent implements OnInit, OnDestroy {
  //[x: string]: any;

  private companyNo: string;
  private currentUser: User;
  private navUrl: string = "../../list";

  /**システム管理者フラグ
   * @remarks 会社毎の管理者は所属する会社の一部項目のみ編集可能
   */
  public SystemAdminFlg: boolean = false;

  /**更新フラグ */
  public updateFlg: boolean = true;

  public masterTitle: string = "システムマスタ";

  @ViewChild('fileInput', {static: false})
  public fileInput;
  public file: File = null;
  public imageSrc: string | ArrayBuffer;

  // 清掃/忘れ物管理使用フラグ
  public lostFlgs : CodeNameInfo[];

  // trustyouConnectDiv
  public trustyouConnectDivs : CodeNameInfo[];

  /** 会社グループマスタ データ */
  public M_CompanyGroup: Array<CompanyGroupInfo>;

//#region 画面フォーム

  // Validation Pattern
  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly zipFormatPattern = '(\\d{3})-(\\d{4})';
  public readonly phoneFormatPattern = '^[0-9-]*$';

  // Validation maxLength
  public readonly maxLengthCompanyNo = 10;
  public readonly maxLengthText = 100;
  public readonly maxLengthPhone = 20;
  public readonly maxLengthBillingAddress = 60;
  public readonly maxLengthLastReserveNo = 8;
  public readonly maxLengthLastCustomerNo = 10;
  public readonly maxLengthLastBillNo = 10;
  public readonly maxLengthSavePeriod = 2;

  // Validation maxValue
  public readonly maxServiceRate = 100;


  // Validation Message
  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 半角英数で入力してください。 */
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 形式(999-9999)で入力してください。 */
  public readonly msgPatternZip = Message.PATTERN_ZIP;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLengthCompanyNo = this.maxLengthCompanyNo.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLengthText = this.maxLengthText.toString() + Message.MAX_LENGTH;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPhone = this.maxLengthPhone.toString() + Message.MAX_LENGTH;
  //** 60文字以下で入力してください。 */
  public readonly msgMaxLengthBillingAddress = this.maxLengthBillingAddress.toString() + Message.MAX_LENGTH;
  //** 100以下の値で入力してください。 */
  public readonly msgMaxServiceRate = this.maxServiceRate.toString() + Message.MAX_DIGITS;
  //** 8文字以下で入力してください。 */
  public readonly msgMaxLengthLastReserveNo = this.maxLengthLastReserveNo.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLengthLastCustomerNo = this.maxLengthLastCustomerNo.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLengthLastBillNo = this.maxLengthLastBillNo.toString() + Message.MAX_LENGTH;
  //** 2文字以下で入力してください。 */
  public readonly msgMaxLengtSavePeriod = this.maxLengthSavePeriod.toString() + Message.MAX_LENGTH;

  // FormControls
  companyForm = new FormGroup({
    companyNo: new FormControl('',[Validators.required, Validators.pattern(this.positiveNumberFormatPattern), Validators.maxLength(this.maxLengthCompanyNo)]),
    companyName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthText)]),
    zipCode: new FormControl('',[Validators.pattern(this.zipFormatPattern)]),
    address: new FormControl('',[Validators.maxLength(this.maxLengthText)]),
    phoneNo: new FormControl('',[Validators.pattern(this.phoneFormatPattern), Validators.maxLength(this.maxLengthPhone)]),
    billingAddress: new FormControl('',[Validators.maxLength(this.maxLengthBillingAddress)]),
    serviceRate: new FormControl('',[Validators.required,Validators.pattern(this.positiveNumberFormatPattern), Validators.max(this.maxServiceRate)]),
    lastReserveNo: new FormControl('',[Validators.required,Validators.pattern(this.positiveNumberFormatPattern), Validators.maxLength(this.maxLengthLastReserveNo)]),
    lastCustomerNo: new FormControl('',[Validators.required,Validators.pattern(this.positiveNumberFormatPattern), Validators.maxLength(this.maxLengthLastCustomerNo)]),
    lastBillNo: new FormControl('',[Validators.required,Validators.pattern(this.positiveNumberFormatPattern), Validators.maxLength(this.maxLengthLastBillNo)]),
    lostFlg: new FormControl('',[Validators.required,]),
    savePeriod: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthSavePeriod)]),
    trustyouConnectDiv: new FormControl('',[Validators.required,]),
    companyGroupId: new FormControl(''),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });
//#endregion

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companyService: CompanyService,
              private authService: AuthService,
              private companyGroupService: CompanyGroupService,
              private header: HeaderService) {

    this.companyNo = this.route.snapshot.paramMap.get('id');
    this.currentUser = this.authService.getLoginUser();
  }

  public ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  public ngOnInit() {

    this.header.lockCompanySeleter();

    // ユーザ権限チェック
    if(this.currentUser.roleDivision == EnumRole.SuperAdmin.toString()){
      this.SystemAdminFlg = true;
      // this.navUrl = "../";
      this.masterTitle = "会社マスタ";
    }

    // 新規,更新チェック
    if(this.companyNo == undefined || this.companyNo == null || this.companyNo.length == 0) { this.updateFlg = false; }

    // 管理者が所属する会社以外を編集できないようにする
    // システム管理者はどの会社も編集可能とする
    if (!this.SystemAdminFlg && this.currentUser.companyNo != this.companyNo) {
      Common.modalMessageError(Message.TITLE_ERROR,"ログイン" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.COMPANY_FORM + '001').then(() =>{
        this.authService.Logout().subscribe();
        this.authService.RemoveToken();
        this.router.navigate(["/login"]);
      });
      return;

    } else {
      // 会社マスタ 取得
      if (this.updateFlg && this.companyNo) {
        this.companyService.getCompany(this.companyNo).pipe().subscribe(company => {

          this.companyForm.patchValue(company);

          this.companyService.getCompanyImage(this.companyNo).subscribe(val => {
            this.createImageFromBlob(val);

          });

          if (isNullOrUndefined(company.companyGroupId)) {
            this.companyForm.controls["companyGroupId"].setValue("");
          }

        });
      }

      // 新規登録時
      if(!this.updateFlg){
        // カウンタ系に初期値として1をセット
        this.companyForm.controls["lastReserveNo"].setValue("00000001");
        this.companyForm.controls["lastCustomerNo"].setValue("0000000001");
        this.companyForm.controls["lastBillNo"].setValue("1");
      }

      this.getRelatedMaster();
    }
  }

  /** 関連するマスタデータを取得 */
  private getRelatedMaster() {

    //HACK:ベタ打ち?? mst_code_nameにあるのでは?
    // 清掃・忘れ物管理 使用リスト取得
    this.lostFlgs = [];
    let info = new CodeNameInfo();
    info.code = "0";
    info.codeName = "禁止";
    this.lostFlgs.push(info);
    let info2 = new CodeNameInfo();
    info2.code = "1";
    info2.codeName = "許可";
    this.lostFlgs.push(info2);

    // Trustyou連携区分 使用リスト取得
    this.trustyouConnectDivs = [];
    info = new CodeNameInfo();
    info.code = "0";
    info.codeName = "禁止";
    this.trustyouConnectDivs.push(info);
    info = new CodeNameInfo();
    info2.code = "1";
    info2.codeName = "許可";
    this.trustyouConnectDivs.push(info2);

    // 会社グループID 取得
    this.companyGroupService.getCompanyGroupList().pipe().subscribe(list => {

      this.M_CompanyGroup = list;

      // 未選択用の行を追加
      let emptyInfo = new CompanyGroupInfo();
      emptyInfo.companyGroupId = "";
      emptyInfo.companyGroupName = "未選択";

      this.M_CompanyGroup.push(emptyInfo);

    });

  }

  public onSubmit() {

    let companyInfo = new CompanyInfo();
    companyInfo = this.companyForm.value;
    companyInfo.updator = this.currentUser.userName;
    companyInfo.lastReserveNo.padStart(8, "0");
    companyInfo.lastCustomerNo.padStart(10, "0");

    if (this.companyNo) {
      // Update
      this.companyService.updateCompany(companyInfo).pipe(
        ).subscribe(result => {
          if (result == DBUpdateResult.Success) {
              this.sendImage(companyInfo.companyNo);
              this.router.navigate([this.navUrl], { relativeTo: this.route });
          }
          if(result == DBUpdateResult.VersionError){
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.COMPANY_FORM + '001').then(() => {
              this.router.navigate([this.navUrl], { relativeTo: this.route });
            });
          }
          if(result == DBUpdateResult.Error){
            Common.modalMessageError(Message.TITLE_ERROR, '会社マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANY_FORM + '002').then(() => {
              this.router.navigate([this.navUrl], { relativeTo: this.route });
            });
          }
      });

    } else {
      // Add
      companyInfo.creator = this.currentUser.userName;
      companyInfo.version = 0; //nullだと400エラーになるのでここでセット

      this.companyService.addCompany(companyInfo).pipe(
        ).subscribe(result => {
          if (result) {
            this.sendImage(companyInfo.companyNo);
            this.router.navigate([this.navUrl], { relativeTo: this.route });
          }
          else {
            Common.modalMessageError(Message.TITLE_ERROR, '会社マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANY_FORM + '003').then(() => {
              this.router.navigate([this.navUrl], { relativeTo: this.route });
            });
          }
      });
    }
  }

  public cancel() {
    this.router.navigate([this.navUrl], { relativeTo: this.route });
  }

  //#region ---- Image Functions ----
  /**ファイル選択ボタンクリックイベント */
  public onClickFileSelectButton() {
    this.fileInput.nativeElement.click();
  }

  /**選択ファイル変更イベント */
  public onChangeFileInput(event: any) {

    this.file = <File>event.target.files[0];

    // Show preview
    const mimeType = this.file.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (e) => {
      this.imageSrc = reader.result;
    }

  }

  /**APIから取得したBlobより画像Urlに変換 */
  private createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.imageSrc = reader.result;
      },
      false
    );
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  /**画像をAPIに送信 */
  private sendImage(companyNo: string){

    if (this.file == undefined || this.file == null) { return; }

    // logo image set
    let formData = new FormData();
    formData.append("file", this.file);
    formData.append("company", companyNo);

    this.companyService.updateImage(formData).pipe(
      ).subscribe(result => {
        if(result == DBUpdateResult.Error){
          Common.modalMessageError(Message.TITLE_ERROR, '会社マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.COMPANY_FORM + '004').then(() => {
            this.router.navigate([this.navUrl], { relativeTo: this.route });
          });
        }
    });

  }
  //#endregion

}
