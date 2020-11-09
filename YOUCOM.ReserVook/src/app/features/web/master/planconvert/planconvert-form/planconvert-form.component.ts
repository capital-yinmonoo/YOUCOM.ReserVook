import { CodenameService } from './../../../../master/codename/services/codename.service';
import { DBUpdateResult,  FunctionId,  Message, MessagePrefix } from '../../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlanConvertService } from '../services/planconvert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/auth.model';
import { PlanConvertInfo } from '../model/planconvert.model';
import { SystemConst, ItemDivision } from '../../../../../core/system.const';
import { ScNameInfo } from '../../scname/model/scname.model';
import { HttpParams } from '@angular/common/http';
import { Common } from 'src/app/core/common';
import { ItemInfo } from '../../../../item/model/item'
import { itemService } from '../../../../item/services/item.service';
import { CodeNameInfo } from 'src/app/features/master/codename/model/codename.model';
import { ItemInfoEx } from 'src/app/features/master/setitem/model/setitem.model';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-planconvert-form',
  templateUrl: './planconvert-form.component.html',
  styleUrls: ['../../../../../shared/shared.style.scss', './planconvert-form.component.scss']
})
export class PlanConvertFormComponent implements OnInit, OnDestroy {

  public readonly codeFormatPattern = '([0-9a-zA-Z])*$|\x20';
  public readonly itemCodeFormatPattern = '^[^#]*$';
  public readonly maxLength40 = 40;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 40文字以下で入力してください。 */
  public readonly msgMaxLength40 = this.maxLength40.toString() + Message.MAX_LENGTH;;
  //** を選択してください。 */
  public readonly msgChooseArticle = Message.CHOOSE_ARTICLE;
  //** 英数字を半角で入力してください。 */
  public readonly msgPatternAlphabetNumber = Message.PATTERN_ALPHABET_NUMBER;

  Current_user: User;
  scCd: string;
  scPackagePlanCd: string;
  scMealCond: string;
  scSpecMealCond: string;
  updateFlg: boolean;
  scCodes: ScNameInfo[];
  scMealConds: ScNameInfo[];
  scSpecMealConds: ScNameInfo[];

  /** マスタ 商品区分リスト */
  public M_ItemDivision: CodeNameInfo[] = [];
  /** 商品区分毎商品マスタリスト */
  public M_ItemList: ItemInfoEx[] = [];

  planConvertForm :FormGroup;

  // 未指定(Web連携用) 表示のみ選択不可
  public unspecified = SystemConst.UNSPECIFIED;

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              private planConvertService: PlanConvertService,
              private itemService: itemService,
              private codeNameService: CodenameService,
              private header: HeaderService) {

    // 取得したURLパラメータを渡す
    this.scCd = this.route.snapshot.paramMap.get('scCd');
    this.scPackagePlanCd = this.route.snapshot.paramMap.get('scPackagePlanCd');
    this.scMealCond = this.route.snapshot.paramMap.get('scMealCond');
    this.scSpecMealCond = this.route.snapshot.paramMap.get('scSpecMealCond');
    this.Current_user = this.authService.getLoginUser();

    this.planConvertForm = new FormGroup({
      companyNo: new FormControl(''),
      scCd: new FormControl(this.scCd,[Validators.required]),
      scPackagePlanCd: new FormControl('',[Validators.required, Validators.pattern(this.codeFormatPattern), Validators.maxLength(this.maxLength40)]),
      scMealCond: new FormControl('',[Validators.required]),
      scSpecMealCond: new FormControl('',[Validators.required]),
      itemCode: new FormControl('',[Validators.required, Validators.pattern(this.itemCodeFormatPattern)]),
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

    var condition = new PlanConvertInfo();

    if (!Common.IsNullOrEmpty(this.scCd)) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.companyNo = this.Current_user.displayCompanyNo;
      condition.scCd = this.scCd;
      condition.scPackagePlanCd = this.scPackagePlanCd;
      condition.scMealCond = this.scMealCond;
      condition.scSpecMealCond = this.scSpecMealCond;

      this.planConvertService.GetPlanConvertById(condition).pipe().subscribe(planConvertinfo =>
        this.planConvertForm.patchValue(planConvertinfo));
    }else{
      this.updateFlg = false;
    }

    var scCodeParams = new HttpParams();
    scCodeParams = scCodeParams.append('companyNo', this.Current_user.displayCompanyNo);
    var scMealCondCond = new ScNameInfo;
    scMealCondCond.companyNo = this.Current_user.displayCompanyNo;
    scMealCondCond.scCd = this.scCd;
    scMealCondCond.scCategoryCd = SystemConst.SC_NAME_CATEGOLY_MEAL_COND;
    var scSpecMealCondCond = new ScNameInfo;
    scSpecMealCondCond.companyNo = this.Current_user.displayCompanyNo;
    scSpecMealCondCond.scCd = this.scCd;
    scSpecMealCondCond.scCategoryCd = SystemConst.SC_NAME_CATEGOLY_SPEC_MEAL_COND;
    var itemcond = new ItemInfo;
    itemcond.companyNo = this.Current_user.displayCompanyNo;

    // 表示用
    // SCコード
    this.planConvertService.GetScCdList(scCodeParams).subscribe((res : ScNameInfo[]) => {
      this.scCodes = res;
    });

    // 食事条件
    this.planConvertService.GetScNameList(scMealCondCond).subscribe((res : ScNameInfo[]) => {
      this.scMealConds = res;
    });

    // 食事有無情報
    this.planConvertService.GetScNameList(scSpecMealCondCond).subscribe((res : ScNameInfo[]) => {
      this.scSpecMealConds = res;
    });

    // Get Item Division
    let condItemDivision = new CodeNameInfo;
    condItemDivision.companyNo = this.Current_user.displayCompanyNo;
    condItemDivision.divisionCode = SystemConst.DIVISION_ITEM;

    this.codeNameService.GetCodeNameList(condItemDivision).subscribe((resCode: CodeNameInfo[]) => {

      // Only StayItem or SetItem
      this.M_ItemDivision = resCode.filter(f => f.code == ItemDivision.Stay.toString() || f.code == ItemDivision.SetItem.toString());

      // Get Items Grouping ItemDivision
      let cond = new ItemInfo();
      cond.companyNo = this.Current_user.displayCompanyNo;
      this.itemService.getItemList(cond).subscribe((resItem: ItemInfo[]) => {

        this.M_ItemDivision.forEach((div) => {

          const wkList: ItemInfoEx = {
            itemDivision: div.code,
            itemDivisionName: div.codeName,
            itemList: resItem.filter(f => f.itemDivision == div.code)
          };

          this.M_ItemList.push(wkList);
        });

      });
    });
  }

  onSubmit() {
    if (!Common.IsNullOrEmpty(this.scPackagePlanCd)) {
      // 情報更新
      var updateData: PlanConvertInfo = this.planConvertForm.value;
      updateData.companyNo = this.Current_user.displayCompanyNo;
      updateData.updateClerk = this.Current_user.userName;

      // 商品マスタの情報を取得
      let item: ItemInfo = null;
      for(let i = 0; i < this.M_ItemList.length; i++ ){
        item = this.M_ItemList[i].itemList.find((item) => item.itemCode == updateData.itemCode);
        if (!Common.IsNullOrEmpty(item)) break;
      }
      updateData.itemName = item.printName;

      this.planConvertService.UpdatePlanConvert(updateData).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.PLANCONVERT_FORM + '001');
            break;
          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, 'ポイント変換マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.PLANCONVERT_FORM + '001');
            break;
        }
        this.router.navigate(['../../../../../list/'], { relativeTo: this.route });
      });

    } else {
      // 情報追加
      var addData = this.planConvertForm.value;
      addData.companyNo = this.Current_user.displayCompanyNo;
      addData.updateCnt = 0; //nullだとエラーになるためここで0をセット
      addData.programId = ''; // 空値を入れる
      addData.createClerk = this.Current_user.userName;
      addData.createMachineNo = ''; // 空値を入れる
      addData.updateClerk = this.Current_user.userName;
      addData.updateMachineNo = ''; // 空値を入れる

      this.planConvertService.InsertPlanConvert(addData).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../../../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_WEAR_ERROR, '使用中の同じ設定が既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.PLANCONVERT_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../../../../list/'], { relativeTo: this.route });
  }

  // サイトコード切替
  public selectScCode() {
    var scMealCondCond = new ScNameInfo;
    scMealCondCond.companyNo = this.Current_user.displayCompanyNo;
    scMealCondCond.scCd = this.planConvertForm.controls.scCd.value;
    scMealCondCond.scCategoryCd = SystemConst.SC_NAME_CATEGOLY_MEAL_COND;
    var scSpecMealCondCond = new ScNameInfo;
    scSpecMealCondCond.companyNo = this.Current_user.displayCompanyNo;
    scSpecMealCondCond.scCd = this.planConvertForm.controls.scCd.value;
    scSpecMealCondCond.scCategoryCd = SystemConst.SC_NAME_CATEGOLY_SPEC_MEAL_COND;

    // 食事条件
    this.planConvertService.GetScNameList(scMealCondCond).subscribe((res : ScNameInfo[]) => {
      this.scMealConds = res;
    });

    // 食事有無情報
    this.planConvertService.GetScNameList(scSpecMealCondCond).subscribe((res : ScNameInfo[]) => {
      this.scSpecMealConds = res;
    });
  }
}
