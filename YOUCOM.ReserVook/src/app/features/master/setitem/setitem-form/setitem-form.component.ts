import { isNullOrUndefined } from 'util';
import { TaxRateInfo } from './../../taxrate/model/taxrateinfo.model';
import { ReserveService } from './../../../reserve/services/reserve.service';
import { TaxServiceDivision, SetItemInfo, taxrateDivision } from './../../../item/model/item';
import { SystemConst, ItemDivision, MessagePrefix, FunctionId } from 'src/app/core/system.const';
import { CodenameService } from './../../codename/services/codename.service';
import { DBUpdateResult, Message } from './../../../../core/system.const';
import { Base } from './../../../../shared/model/baseinfo.model';
import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { itemService} from '../../../item/services/item.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { ItemInfo } from '../../../item/model/item'
import { Common } from 'src/app/core/common';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { SetItemService } from '../services/setitem.service';
import { MatTableDataSource } from '@angular/material/table';
import { ItemInfoEx, SetItem } from '../model/setitem.model';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-setitem-form',
  templateUrl: './setitem-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './setitem-form.component.scss']
})
export class SetItemFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  /** セット商品コード */
  private setItemCode: string;

  /** ログインユーザー情報 */
  private currentUser: User;

  /** True:更新 False:追加 */
  public isUpdate: boolean = false;

//#region --------------- Parent Input Form ---------------
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

  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  /** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  /** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  /** 0以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  /** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  /** 99999999以下の値で入力してください。 */
  public readonly msgMax99999999 = this.max99999999.toString() + Message.MAX_DIGITS;
  /** -99999999以上の値で入力してください。 */
  public readonly msgMin99999999 = this.min99999999.toString() + Message.MIN_DIGITS;
  /** 30文字以下で入力してください。 */
  public readonly msgMaxLengthItemName = this.maxLengthItemKana.toString() + Message.MAX_LENGTH;
  /** 20文字以下で入力してください。 */
  public readonly msgMaxLengthPrintName = this.maxLengthPrintName.toString() + Message.MAX_LENGTH;
  /** 10文字以下で入力してください。 */
  public readonly msgMaxLengthItemCode = this.maxLengthItemCode.toString() + Message.MAX_LENGTH;

  //** n行目 */
  public readonly msgLine = "行目";
  //** {項目名}は */
  public readonly msgIs = "は";
  //** 単価 */
  public readonly lblUnitPrice = "単価";

  /** セット商品(親)入力フォーム */
  public parentForm = new FormGroup({
    itemCode: new FormControl("",[Validators.required, Validators.pattern(this.CodeFormatPattern),Validators.maxLength(this.maxLengthItemCode)]),
    itemDivision: new FormControl(ItemDivision.SetItem.toString()),
    mealDivision: new FormControl("0"),
    itemName : new FormControl("",[Validators.required, Validators.maxLength(30)]),
    itemKana: new FormControl("",Validators.compose([Validators.required, Validators.pattern(this.kanaFormatPattern), Validators.maxLength(this.maxLengthItemKana)])),
    printName: new FormControl("",[Validators.required, Validators.maxLength(this.maxLengthPrintName)]),
    unitPrice: new FormControl("",[Validators.required, Validators.pattern(this.numberFormatPattern),Validators.min(this.min99999999),Validators.max(this.max99999999)]),
    taxServiceDivision: new FormControl("",[Validators.required]),
    taxrateDivision: new FormControl("",[Validators.required]),
    displayOrder: new FormControl("",[Validators.required, Validators.pattern(this.positiveNumberFormatPattern),Validators.min(this.min1),Validators.max(this.max9999)]),
    companyNo: new FormControl(""),
    status: new FormControl(""),
    version: new FormControl(""),
    creator: new FormControl(""),
    updator: new FormControl(""),
    cdt: new FormControl(""),
    udt: new FormControl(""),
  });
//#endregion

  // Master List
  public M_ItemList: Array<ItemInfoEx> = [];
  public M_ItemDivision: Array<CodeNameInfo> = [];
  public M_MealDivision: Array<CodeNameInfo> = [];
  public M_TaxServiceDivision: Array<TaxServiceDivision> = [];
  public M_TaxDivision: Array<TaxServiceDivision> = [];
  public M_ServiceDivision: Array<TaxServiceDivision> = [];
  public M_TaxRateDivision: Array<TaxRateInfo> = [];
  public taxrateDivision = taxrateDivision;

  // Childs Inputs
  public readonly childItemInfoHeader: string[] = [
    "addItemInfo", "item", "unitPrice", "itemDivision", "mealDivision", "taxServiceDivision", "taxrateDivision", "seq"
  ];
  private seq = 1;
  public itemSource = new MatTableDataSource<any>();
  public childForm = this.createItemData();
  public itemList: Array<FormGroup>;

  /** セット商品(子)の合計単価額 */
  public totalAmount: number = 0;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb : FormBuilder,
              private itemService: itemService,
              private setItemService: SetItemService,
              private codeNameService: CodenameService,
              private reserveService: ReserveService,
              private authService: AuthService,
              private cd: ChangeDetectorRef,
              private header: HeaderService) {

    this.setItemCode = this.route.snapshot.paramMap.get("id");
    this.currentUser = this.authService.getLoginUser();

  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit(): void {

    this.itemSource = new MatTableDataSource([this.childForm]);
    this.itemList = this.itemSource.data;

    // マスタ類取得
    this.getRelatedMaster();

    // 更新時
    if (this.setItemCode) {
      this.header.lockCompanySeleter();
      this.getMasterItem();
    }

  }

  ngAfterViewChecked(): void{

    // 合計表示
    if (!isNullOrUndefined(this.itemList) && this.itemList.length > 0 ){
        this.calcTotal();
    }
    this.cd.detectChanges(); /* ExpressionChangedAfterItHasBeenCheckedError防止用 変更を明示する */

  }

  /** 保存 */
  public onSubmit() {

    if (!this.checkAll()) { return; }

    this.save();

  }

  /** 保存 */
  private save() {
    let setItem = new SetItem();
    setItem.itemCode = this.parentForm.controls["itemCode"].value;
    setItem.itemDivision = this.parentForm.controls["itemDivision"].value;
    setItem.mealDivision = this.parentForm.controls["mealDivision"].value;
    setItem.itemName = this.parentForm.controls["itemName"].value;
    setItem.itemKana = this.parentForm.controls["itemKana"].value;
    setItem.printName = this.parentForm.controls["printName"].value;
    setItem.unitPrice = Common.ToNumber(this.parentForm.controls["unitPrice"].value);
    setItem.displayOrder = Common.ToNumber(this.parentForm.controls["displayOrder"].value);

    setItem.taxDivision = this.parentForm.controls["taxServiceDivision"].value.substring(0, 1);
    setItem.serviceDivision = this.parentForm.controls["taxServiceDivision"].value.substring(1, 2);
    setItem.taxrateDivision = this.parentForm.controls["taxrateDivision"].value;

    setItem.companyNo = this.currentUser.displayCompanyNo;

    let wkChildItems = new Array<SetItemInfo>();
    for (let i = 0; i < this.itemList.length; i++) { /* foreach使うと値が取れない.. */

      // 商品マスタの元情報
      let orgItemInfo = new ItemInfo();
      for(let j = 0; j < this.M_ItemList.length; j++ ){
        orgItemInfo = this.M_ItemList[j].itemList.find((item) => item.itemCode == this.itemList[i].controls["item"].value);
        if (!Common.IsNullOrEmpty(orgItemInfo)) break;
      }

      // 元の商品が非課税ならセット親に関わらず、サ無しとする
      let srvDiv = setItem.serviceDivision;
      if (orgItemInfo.taxDivision == SystemConst.NON_TAX_DIVISION) { srvDiv = SystemConst.NON_SERVICE_DIVISION; }

      let setItemInfo = new SetItemInfo();
      setItemInfo.setItemCode = setItem.itemCode;
      setItemInfo.seq = Common.ToNumber(this.itemList[i].controls["seq"].value);
      setItemInfo.itemCode = this.itemList[i].controls["item"].value;
      setItemInfo.unitPrice = Common.ToNumber(this.itemList[i].controls["unitPrice"].value);
      setItemInfo.taxrateDivision = setItem.taxrateDivision;
      setItemInfo.serviceDivision =　srvDiv;
      setItemInfo.companyNo = this.currentUser.displayCompanyNo;
      setItemInfo.creator = this.currentUser.userName;
      setItemInfo.updator = this.currentUser.userName;
      setItemInfo.version = 0;

      wkChildItems.push(setItemInfo);
    }
    setItem.childItems = wkChildItems;

    if (this.isUpdate) { this.update(setItem); }
    else { this.add(setItem); }
  }

  /** 中止 */
  public cancel() {
    this.router.navigate(["../../list/"], { relativeTo: this.route });
  }

//#region ---- Form Group --------------------------------------------------
  /** FormGroup 初期値セット */
  private createItemData(){
    const result = this.setChildForm("", "", "", "", "", "", "", "", this.seq.toString());
    this.seq++;
    return result;
  }

  /** FormGroup セット商品(子)情報セット */
  private setChildForm(item: string,
                       unitPrice: string,
                       itemDivision: string,
                       taxDivision: string,
                       serviceDivision: string,
                       taxServiceDivision: string,
                       taxrateDivision: string,
                       mealDivision: string,
                       seq: string): FormGroup{

    return this.fb.group({
      item: new FormControl(item),
      unitPrice: new FormControl(unitPrice, [Validators.pattern(this.numberFormatPattern),Validators.min(this.min99999999),Validators.max(this.max99999999)]),
      itemDivision: new FormControl( {value: itemDivision, disabled: true} ),
      taxDivision: new FormControl( {value: taxDivision, disabled: true} ),
      serviceDivision: new FormControl(serviceDivision),
      taxServiceDivision: new FormControl({value: taxServiceDivision, disabled: true}),
      taxrateDivision: new FormControl({value: taxrateDivision, disabled: true}),
      mealDivision: new FormControl( {value: mealDivision, disabled: true} ),
      seq: new FormControl(seq)
    });

  }

  /** セット商品(子) データセット */
  private setChildsItemInfo(items: Array<SetItemInfo>){

    // Initialize
    this.itemSource.data = [];
    this.itemList = [];

    // セット
    items.forEach(data => {
      const newForm = this.setChildForm(data.itemCode
                                        , data.unitPrice.toString()
                                        , data.baseItemInfo.itemDivision
                                        , data.baseItemInfo.taxDivision
                                        , data.baseItemInfo.serviceDivision
                                        , data.baseItemInfo.taxDivision + data.baseItemInfo.serviceDivision
                                        , data.taxrateDivision
                                        , data.baseItemInfo.mealDivision
                                        , this.seq.toString());
      this.itemList.push(newForm);
      this.itemSource.data = this.itemList;
      this.seq++;
    });
  }
//#endregion ----- FormGroup セット --------------------------------------------------

//#region ---- Rows Control --------------------------------------------------
  /** 行追加 */
  public addItemInfo() {
    this.itemList = this.itemSource.data;
    const newForm = this.createItemData();
    this.itemList.push(newForm);
    this.itemSource.data = this.itemList;
  }

  /** 行削除 */
  public removeItemInfo(obj: any) {

    const seq = obj.controls["seq"].value;

    this.itemList = this.itemSource.data;
    let wkInfo: any = [];
    for (let i = 0, len: number = this.itemList.length; i < len; i++) {
      if (this.itemList[i].controls["seq"].value != seq) {
        wkInfo.push(this.itemList[i]);
      }
    }

    this.itemList = wkInfo;
    this.itemSource.data = this.itemList;

    if(this.itemSource.data.length == 0){
      this.addItemInfo()
    }
  }

  /** 商品選択 */
  public selectItem(obj){

    const itemCode: string = obj.controls["item"].value;
    let item: ItemInfo;

    // 商品マスタの情報を取得
    for(let i = 0; i < this.M_ItemList.length; i++ ){
      item = this.M_ItemList[i].itemList.find((item) => item.itemCode == itemCode);
      if (!Common.IsNullOrEmpty(item)) break;
    }

    if ( Common.IsNullOrEmpty(item) ) return;

    // 値をセット
    obj.patchValue({
      itemDivision: item.itemDivision
      , unitPrice: item.unitPrice
      , taxDivision: item.taxDivision
      , serviceDivision: item.serviceDivision
      , taxServiceDivision: item.taxDivision + item.serviceDivision
      , mealDivision: item.mealDivision
      , taxrateDivision: item.taxrateDivision
    });
  }
//#endregion  ---- 行追加/削除 等 制御 --------------------------------------------------

//#region ---- Data Access --------------------------------------------------
  /** マスタデータ取得 */
  private getMasterItem() {
    this.isUpdate = true;

    // 条件セット
    let cond = new ItemInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.itemCode = this.setItemCode;

    // 登録情報取得
    this.setItemService.getSetItemByPK(cond).pipe().subscribe(result => {
      this.parentForm.patchValue(result);
      this.parentForm.controls["taxServiceDivision"].setValue(result.taxDivision + result.serviceDivision);
      this.setChildsItemInfo(result.childItems);
    });
  }

  /** マスタ類取得 */
  private getRelatedMaster() {

    // Item Division
    let condItemDivision = new CodeNameInfo;
    condItemDivision.companyNo = this.currentUser.displayCompanyNo;
    condItemDivision.divisionCode = SystemConst.DIVISION_ITEM;

    this.codeNameService.GetCodeNameList(condItemDivision).subscribe((res: CodeNameInfo[]) => {

      this.M_ItemDivision = res;

      // without set item division
      for (let i = 0; i < this.M_ItemDivision.length; i++) {
        if (this.M_ItemDivision[i].code == ItemDivision.SetItem.toString()) {
          this.M_ItemDivision.splice(i, 1);
        }
      }

      this.getRelatedMasterItem();

    });

    // Meal Division
    condItemDivision.divisionCode = SystemConst.DIVISION_MEAL;
    this.codeNameService.GetCodeNameList(condItemDivision).subscribe((res: CodeNameInfo[]) => {
      this.M_MealDivision = res;
    });

    let cond = new Base();
    cond.companyNo = this.currentUser.displayCompanyNo;

    // TaxService Division
    this.itemService.getTaxServiceListView(cond).subscribe((res: TaxServiceDivision[]) => {
      this.M_TaxServiceDivision = res;

      this.M_TaxServiceDivision.forEach((item) => {
        const wks = item.displayName.split("サービス");
        this.M_TaxDivision.push({taxServiceDivision: item.taxServiceDivision.substring(0, 1), displayName: wks[0]});
        this.M_ServiceDivision.push({taxServiceDivision: item.taxServiceDivision.substring(1, 2), displayName: "サービス" + wks[1]});
      });

    });

    // TaxRate Division
    this.reserveService.getTaxRate(cond).subscribe((res: TaxRateInfo[]) => {
      this.M_TaxRateDivision = res;
    });

  }

  /** 商品マスタから商品区分ごとに取得 */
  private getRelatedMasterItem() {

    let cond = new ItemInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;

    this.itemService.getItemListView(cond).subscribe((res: ItemInfo[]) => {

      this.M_ItemDivision.forEach((div) => {

        const wkList: ItemInfoEx = {
          itemDivision: div.code,
          itemDivisionName: div.codeName,
          itemList: res.filter(f => f.itemDivision == div.code)
        };

        this.M_ItemList.push(wkList);
      });

    });

  }

  /** 更新 */
  private update(info: SetItem){

    info.status = this.parentForm.controls["status"].value;
    info.version = this.parentForm.controls["version"].value;
    info.cdt = this.parentForm.controls["cdt"].value;
    info.creator = this.parentForm.controls["creator"].value;
    info.updator = this.currentUser.userName;

    this.setItemService.updateSetItem(info).pipe().subscribe(result => {
      switch (result) {
        case DBUpdateResult.Success:
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;

        case DBUpdateResult.VersionError:
          Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.SETITEM_FORM + '001');
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, "セット商品マスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '001');
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;
      }
    });

  }

  /** 追加 */
  private add(info: SetItem){

    info.creator = this.currentUser.userName;
    info.updator = this.currentUser.userName;
    info.version = 0;

    this.setItemService.addSetItem(info).pipe().subscribe(result => {
      switch (result) {
        case DBUpdateResult.Success:
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;

        case DBUpdateResult.OverlapError:
          Common.modalMessageError(Message.TITLE_ERROR, "使用中の同じ商品コードが既に存在しているため新規登録できません。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '002');
          break;

        default:
          Common.modalMessageError(Message.TITLE_ERROR, "セット商品マスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '003');
          this.router.navigate(["../../list/"], { relativeTo: this.route });
          break;
      }
    });
  }
//#endregion

//#region ---- Calc --------------------------------------------------

  /** 合計金額計算 */
  private calcTotal(){

    // クリア
    this.totalAmount = 0;

    // 商品の合計を計算
    for(let i = 0; i < this.itemList.length; i++ ) {
      this.totalAmount += Common.ToNumber(this.itemList[i].controls["unitPrice"].value);
    }

  }

//#endregion

//#region ---- Check --------------------------------------------------

  /** チェックまとめ */
  private checkAll(): boolean{

    if (!this.checkRows()) { return false; }
    if (!this.checkDivision()) { return false; }
    if (!this.checkTaxSrvDivision()) { return false; }
    if (!this.checkPrice()) { return false; }

    return true;
  }

  /** セット商品(子)行チェック */
  private checkRows(): boolean{

    // 子が1つもない場合、登録不可
    for(let i = 0; i < this.itemList.length; i++) { /* foreach使うと値が取れない.. */
      if (!isNullOrUndefined(this.itemList[i].controls["item"].value) && this.itemList[i].controls["item"].value.length > 0) { return true; }
    }

    Common.modalMessageError(Message.TITLE_ERROR, "セット商品内訳に1つ以上の商品を登録してください。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '004');
    return false;
  }

  /** 商品区分チェック */
  private checkDivision(): boolean {

    let itemDivision: Array<string> = [];
    let mealDivision: Array<string> = [];

    for(let i = 0; i < this.itemList.length; i++) { /* foreach使うと値が取れない.. */
      itemDivision.push(this.itemList[i].controls["itemDivision"].value)
      mealDivision.push(this.itemList[i].controls["mealDivision"].value)
    }

    // 宿泊商品は1つのみ
    if (itemDivision.filter(x => x == ItemDivision.Stay.toString()).length > 1) {
      Common.modalMessageError(Message.TITLE_ERROR, "セット商品内訳には商品分類が宿泊の商品を<br>2つ以上含めることはできません。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '005');
      return false;
    }

    // 料理商品は朝、昼、夕それぞれで1つのみ
    const mealDiv = this.M_MealDivision.filter(x => x.code != "0" && x.codeValue == SystemConst.MEAL_DIVISION_TODAY);
    for (let i = 0; i < mealDiv.length; i++) {
      if (mealDivision.filter(y => y == mealDiv[i].code).length > 1) {
        const mealDivName = mealDiv[i].codeName.split("(")[0]; /* 朝食or昼食or夕食 */
        Common.modalMessageError(Message.TITLE_ERROR, "セット商品内訳には料理区分が" + mealDivName + "の商品を<br>2つ以上含めることはできません。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '006');
        return false;
      }
    }

    // OK!
    return true;

  }

  /** 税サ区分チェック */
  private checkTaxSrvDivision(): boolean {

    let childItems: Array<ItemInfo> = [];

    for(let i = 0; i < this.itemList.length; i++) { /* foreach使うと値が取れない.. */
      let item = new ItemInfo();
      item.taxDivision = this.itemList[i].controls["taxDivision"].value;
      item.serviceDivision = this.itemList[i].controls["serviceDivision"].value;
      item.taxrateDivision = this.itemList[i].controls["taxrateDivision"].value;
      childItems.push(item);
    }

    // 外サ、内サ混在はNG
    const srvDivs = childItems.map(x => x.serviceDivision);
    const wkSrvDiv = this.parentForm.controls["taxServiceDivision"].value.substring(1, 2);
    if (Common.IsNullOrEmpty(wkSrvDiv)) {
      if (srvDivs.includes(SystemConst.INSIDE_SERVICE_DIVISION) && srvDivs.includes(SystemConst.OUTSIDE_SERVICE_DIVISION)) {
        Common.modalMessageError(Message.TITLE_ERROR, "セット商品内訳にはサービス料込とサービス料別の<br>商品を混在させることはできません。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '007');
        return false;
      }
    }
    else {
      if (srvDivs.includes(this.M_ServiceDivision.find(f => f.taxServiceDivision != wkSrvDiv && f.taxServiceDivision != SystemConst.NON_SERVICE_DIVISION).taxServiceDivision)) {
        const diffSrvDivName = this.M_ServiceDivision.find(f => f.taxServiceDivision != wkSrvDiv && f.taxServiceDivision != SystemConst.NON_SERVICE_DIVISION).displayName;
        Common.modalMessageError(Message.TITLE_ERROR, `セット商品内訳には${diffSrvDivName}の<br>商品を混在させることはできません。`, MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '008');
        return false;
      }
    }

    // 税率混在(0%を除き)はNG
    const taxrateDivs = childItems.filter(f => f.taxDivision != SystemConst.NON_TAX_DIVISION).map(x => x.taxrateDivision);
    const wkTRateDiv = this.parentForm.controls["taxrateDivision"].value;
    if (Common.IsNullOrEmpty(wkTRateDiv)) {
      if (taxrateDivs.includes(SystemConst.NORMAL_TAXRATE_DIVISION) && taxrateDivs.includes(SystemConst.REDUCED_TAXRATE_DIVISION)) {
        Common.modalMessageError(Message.TITLE_ERROR, "セット商品内訳には税込かつ標準税率と軽減税率の<br>商品を混在させることはできません。", MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '009');
        return false;
      }
    }
    else {
      if (taxrateDivs.includes(this.taxrateDivision.find(f => f.key != wkTRateDiv).key)) {
        const diffTaxrateDivName = this.taxrateDivision.find(f => f.key != wkTRateDiv).value;
        Common.modalMessageError(Message.TITLE_ERROR, `セット商品内訳には税込かつ${diffTaxrateDivName}の<br>商品を混在させることはできません。`, MessagePrefix.ERROR + FunctionId.SETITEM_FORM + '010');
        return false;
      }
    }

    // OK!
    return true;

  }

  /** 金額チェック */
  private checkPrice(): boolean {

    const parentUnitPrice = Common.ToNumber(this.parentForm.controls["unitPrice"].value);

    // 宿泊商品は1つのみ
    if (parentUnitPrice != this.totalAmount) {

      const msg = `セット商品金額とセット商品内訳の合計金額に<br>`
                + `差があります。<br>`
                + `このまま保存してもよろしいですか？<br>`
                + `差額分は1行目の明細で自動調整します。`;

      Common.modalMessageConfirm(Message.TITLE_CONFIRM, msg, null, MessagePrefix.CONFIRM + FunctionId.SETITEM_FORM + '001').then((result) => {
        if (result) {
          let firstRowUnitPrice = Common.ToNumber(this.itemList[0].controls["unitPrice"].value);
          firstRowUnitPrice += parentUnitPrice - this.totalAmount;
          this.itemList[0].controls["unitPrice"].setValue(firstRowUnitPrice);
          this.save();

        } else {
          return false;
        }
      });
    } else {
      // OK!
      return true;
    }
  }

//#endregion

}
