import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component,OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CodenameService } from '../services/codename.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { SystemConst } from '../../../../core/system.const';
import { Common } from 'src/app/core/common';
import { HttpParams } from '@angular/common/http';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-codename-form',
  templateUrl: './codename-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './codename-form.component.scss']
})
export class CodenameFormComponent implements OnInit, OnDestroy {

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly CodeValueFormatPattern = '^[-]?([0-9a-z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLengthCode = 4;
  public readonly maxLengthCodeName = 20;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;
  //** 半角英数で入力してください。*/
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET;

  //** 1以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 4文字以下で入力してください。 */
  public readonly msgMaxLengthCode = this.maxLengthCode.toString() + Message.MAX_LENGTH;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthCodeName = this.maxLengthCodeName.toString() + Message.MAX_LENGTH;

  divisionCode :string;
  code :string;
  Current_user :User;
  codenameName:string;  // 画面タイトル
  updateFlg: boolean;

  codenameForm = new FormGroup({
    companyNo: new FormControl(''),
    divisionCode: new FormControl(''),
    code: new FormControl('',[Validators.required, Validators.pattern(this.numberFormatPattern), Validators.maxLength(this.maxLengthCode)]),
    codeName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthCodeName)]),
    // codeValue: new FormControl('',[Validators.pattern(this.CodeValueFormatPattern), Validators.maxLength(this.maxLengthCode)]),
    codeValue: new FormControl('',[Validators.required]),
    displayOrder: new FormControl('',[Validators.required,Validators.min(this.min1),Validators.max(this.max9999)]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  roomtypeDivisions: CodeNameInfo[];

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private codenameService: CodenameService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.divisionCode = this.route.snapshot.paramMap.get('divisionCode');
    this.code = this.route.snapshot.paramMap.get('code');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    // 画面タイトルセット
    switch(this.divisionCode){
      case SystemConst.DIVISION_ROOMTYPE:
        this.codenameName = "部屋タイプマスタ";
        break;
      case SystemConst.DIVISION_FLOOR:
        this.codenameName = "フロアマスタ";
        break;
      case SystemConst.DIVISION_PLACE:
        this.codenameName = "忘れ物管理 - 場所分類設定マスタ";
        break;
      case SystemConst.DIVISION_STRAGE:
        this.codenameName = "忘れ物管理 - 保管分類設定マスタ";
        break;
    }

    var codeName = new CodeNameInfo();

    codeName.companyNo = this.Current_user.displayCompanyNo;
    codeName.divisionCode = this.divisionCode;

    if (this.code) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      codeName.code = this.code;
      this.codenameService.GetCodeNameById(codeName).pipe().subscribe(codenameinfo =>  this.codenameForm.patchValue(codenameinfo));
    }else{
      if(this.divisionCode != SystemConst.DIVISION_ROOMTYPE){
        codeName.codeValue = ' ';
      }
      this.updateFlg = false;
      this.codenameForm.patchValue(codeName);
    }

    // 部屋タイプ区分
    var cond = new HttpParams()
    cond = cond.append('companyNo', this.Current_user.displayCompanyNo);
    this.codenameService.getRoomTypeDivisionList(cond).subscribe((res : CodeNameInfo[]) => {
      this.roomtypeDivisions = res;
    });
  }

  onSubmit() {
    var codeName = this.codenameForm.value;
    codeName.updator = this.Current_user.userName;

    if (this.code) {
      // マスタ情報の更新

      this.codenameService.UpdateCodeName(codeName).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;

          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.CODENAME_FORM + '001')
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, this.codenameName + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.CODENAME_FORM + '001');
            break;
        }
        this.router.navigate(['../../../list/', this.divisionCode], { relativeTo: this.route });

      });

    } else {

      // マスタ情報の追加
      codeName.divisionCode = this.divisionCode;
      codeName.creator = this.Current_user.userName;
      codeName.companyNo = this.Current_user.displayCompanyNo;
      codeName.version = 0; //nullだとエラーになるためここで0をセット

      this.codenameService.InsertCodeName(codeName).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../list/', this.divisionCode], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_ERROR, Message.SAME_ERROR + 'コード' + Message.UPDATE_ALREADY_ENTRY_ERROR,MessagePrefix.WARNING + FunctionId.CODENAME_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../list/', this.divisionCode], { relativeTo: this.route });
  }

    /** 部屋タイプマスタかどうか表示する
   * @returns boolean true: 部屋タイプマスタ, false: その他のマスタ
   */
  public checkRoomType() : boolean{
    if(this.codenameName == "部屋タイプマスタ")
     return true;
    else
      return false;
  }

}
