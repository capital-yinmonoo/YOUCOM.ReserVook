import { FunctionId, MessagePrefix, SystemConst } from 'src/app/core/system.const';
import { CodenameService } from './../../codename/services/codename.service';
import { DBUpdateResult, Message, ItemDivision } from './../../../../core/system.const';
import { Base } from './../../../../shared/model/baseinfo.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { itemService} from '../../../item/services/item.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { ItemInfo, taxrateDivision } from '../../../item/model/item'
import { Common } from 'src/app/core/common';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './item-form.component.scss']
})
export class itemFormComponent implements OnInit, OnDestroy {

//#region ----- Form Group ----------
  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly min99999999 = -99999999;
  public readonly max99999999 = 99999999;
  public readonly max9999 = 9999;
  public readonly maxLengthItemKana = 30;
  public readonly maxLengthPrintName = 20;
  public readonly maxLengthItemCode = 10;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  //** 0以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 99999999以下の値で入力してください。 */
  public readonly msgMax99999999 = this.max99999999.toString() + Message.MAX_DIGITS;
  //** -99999999以上の値で入力してください。 */
  public readonly msgMin99999999 = this.min99999999.toString() + Message.MIN_DIGITS;
  //** 30文字以下で入力してください。 */
  public readonly msgMaxLengthItemName = this.maxLengthItemKana.toString() + Message.MAX_LENGTH;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPrintName = this.maxLengthPrintName.toString() + Message.MAX_LENGTH;
  //** 10文字以下で入力してください。 */
  public readonly msgMaxLengthItemCode = this.maxLengthItemCode.toString() + Message.MAX_LENGTH;

  public itemForm = new FormGroup({
    itemCode: new FormControl('',[Validators.required, Validators.pattern(this.CodeFormatPattern),Validators.maxLength(this.maxLengthItemCode)]),
    itemDivision: new FormControl('',[Validators.required]),
    mealDivision: new FormControl(''),
    itemName : new FormControl('',[Validators.required, Validators.maxLength(30)]),
    itemKana: new FormControl('',Validators.compose([Validators.required, Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLengthItemKana)])),
    printName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthPrintName)]),
    unitPrice: new FormControl('',[Validators.required, Validators.pattern(this.numberFormatPattern),Validators.min(this.min99999999),Validators.max(this.max99999999)]),
    taxServiceDivision: new FormControl('',[Validators.required]),
    taxrateDivision: new FormControl('',[Validators.required]),
    displayOrder: new FormControl('',[Validators.required, Validators.pattern(this.positiveNumberFormatPattern),Validators.min(this.min1),Validators.max(this.max9999)]),
    companyNo: new FormControl(''),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

//#endregion

  public readonly ITEM_DIVISION_MEAL = ItemDivision.Meal.toString();

  private id: string;
  private Current_user: User;
  public updateFlg: boolean;
  public itemDivisions: CodeNameInfo[];
  public mealDivisions: CodeNameInfo[];
  public taxServiceDivision: any[];
  public taxrateDivision: any[] = taxrateDivision;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private itemService: itemService,
              private codeNameService: CodenameService,
              private authService: AuthService,
              private header: HeaderService) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit(): void {

    this.updateFlg = false;

    if (this.id) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();
      this.getMaster();
    }

    this.getRelatedMaster();
  }

  public onSubmit() {

    // Set DB Update Value
    let item: ItemInfo = this.itemForm.value;

    //税サ区分は分解してからpostする
    const wktaxServiceDivision = this.itemForm.controls['taxServiceDivision'].value;
    item.taxDivision = wktaxServiceDivision.substr(0,1);
    item.serviceDivision = wktaxServiceDivision.substr(1,1);

    // 料理区分:食事以外はmealDivisionをなしにする
    if (item.itemDivision != this.ITEM_DIVISION_MEAL) { item.mealDivision = "0" }

    item.updator = this.Current_user.userName;

    if (this.updateFlg) {
      this.update(item);

    } else {
      this.add(item);
    }

  }

  public cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }

//#region ----- Data Access ----------

  /** マスタ類取得 */
  private getRelatedMaster() {
    let cond = new CodeNameInfo;
    cond.companyNo = this.Current_user.displayCompanyNo;
    cond.divisionCode = SystemConst.DIVISION_ITEM;

    this.codeNameService.GetCodeNameList(cond).subscribe((res: CodeNameInfo[]) => {
      this.itemDivisions = res;
      for (let i = 0; i < this.itemDivisions.length; i++) {
        if (this.itemDivisions[i].code == ItemDivision.SetItem.toString()) {
          this.itemDivisions.splice(i, 1);
        }
      }
    });

    cond.divisionCode = SystemConst.DIVISION_MEAL;
    this.codeNameService.GetCodeNameList(cond).subscribe((res: CodeNameInfo[]) => {
      this.mealDivisions = res;
    });

    var base = new Base();
    base.companyNo = this.Current_user.displayCompanyNo;

    this.itemService.getTaxServiceListView(base).subscribe((res: any[]) => {
      this.taxServiceDivision = res;
    });
  }

  /** 商品マスタ取得 */
  private getMaster() {
    let item = new ItemInfo();
    item.companyNo = this.Current_user.displayCompanyNo;
    item.itemCode = this.id;

    this.itemService.getItemByPK(item).pipe().subscribe(r_item => {
      this.itemForm.patchValue(r_item);
    });
  }

  /** 追加 */
  private add(item: ItemInfo) {
    item.creator = this.Current_user.userName;
    item.companyNo = this.Current_user.displayCompanyNo;
    item.version = 0; //nullだとエラーになるためここで0をセット

    this.itemService.addItem(item).pipe().subscribe(result => {
      if (result) {
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      }
      else {
        Common.modalMessageError(Message.TITLE_ERROR, '使用中の同じ商品コードが既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.ITEM_FORM + '001');
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      }
    });
  }

  /** 更新 */
  private update(item: ItemInfo) {
    this.itemService.updateItem(item).pipe().subscribe(result => {
      if (result == DBUpdateResult.Success) {
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      }
      if (result == DBUpdateResult.VersionError) {
        Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ITEM_FORM + '001');
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      }
      if (result == DBUpdateResult.UsedError) {
        Common.modalMessageError(Message.TITLE_ERROR, "セット商品マスタで使用されている為<br>税区分の変更はできません。", MessagePrefix.ERROR + FunctionId.ITEM_FORM + '002');
      }
      if (result == DBUpdateResult.Error) {
        Common.modalMessageError(Message.TITLE_ERROR, '商品マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_FORM + '003');
        this.router.navigate(['../../list/'], { relativeTo: this.route });
      }
    });
  }
//#endregion

}
