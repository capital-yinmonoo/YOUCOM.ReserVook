import { Common } from '../../../../core/common';
import { ItemInfo } from '../../../item/model/item';
import { MasterInfo } from '../../model/master.model';
import { AbstractControl } from '@angular/forms';
import { FunctionId, Message, MessagePrefix, SystemConst } from 'src/app/core/system.const';
import moment from 'moment';

export namespace SalesDetailsCommon {

  export enum ItemMode{
    Stay = 1
    , Other
  }

  /** マスタ類保持用 */
  var masterInfo :MasterInfo;

  /** マスタ類 */
  export function setMaster(master: MasterInfo){
    masterInfo = master;
  }

  /** 商品選択(宿泊/その他 共通)
   * @param  {} obj
   * @param  {ItemInfo[]} list 商品マスタリスト
   */
  export function selectItem(obj, list: ItemInfo[], useDate: string){

    var itemCode = obj.controls['item'].value;

    var itemList = masterInfo.M_SetItemList.concat(masterInfo.M_StayItemList).concat(masterInfo.M_OtherItemList);

    var item = itemList.find((item) => item.itemCode === itemCode);
    if ( Common.IsNullOrEmpty(item) ) return;

    // 税率取得
    var taxRate = getTaxRate(useDate,　item.taxDivision, item.taxrateDivision);

    // 料理区分が翌日計上であれば利用日を翌日に変更
    var mealDivision_nextDay = masterInfo.M_MealDivision.filter(x => x.codeValue == SystemConst.MEAL_DIVISION_NEXTDAY).map(y => y.code);

    if (mealDivision_nextDay.indexOf(item.mealDivision) >= 0){
      var nextDay = moment(obj.controls['useDate'].value).add(1, 'days').format(SystemConst.DATE_FORMAT_YYYYMMDD);
      obj.patchValue({ useDate: nextDay});
    }

    // 値をセット
    obj.patchValue({
      itemDivision: item.itemDivision
      , printName: item.printName
      , unitPrice: item.unitPrice
      , mealDivision: item.mealDivision
      , taxServiceDivision: (item.taxDivision + item.serviceDivision)
      , taxDivision:item.taxDivision
      , serviceDivision:item.serviceDivision
      , taxRateDivision:item.taxrateDivision
      , taxRate:taxRate
    });
  }

  /** 税率取得
   * @param  {string} useDate 利用日
   * @param  {string} taxDivision 税区分
   * @param  {string} taxrateDivision 税率区分(標準/軽減)
   * @returns number 税率
   */
  function getTaxRate(useDate : string, taxDivision: string, taxrateDivision: string) : number {

    // 非課税
    if (taxDivision == SystemConst.NON_TAX_DIVISION){
      return 0;
    }

    // 非課税でない
    var taxInfo = masterInfo.M_TaxRateList.find(x => x.beginDate <= useDate
                                                          && x.endDate >= useDate
                                                          && x.taxrateDivision == taxrateDivision);

    if(taxInfo == null){
      var msg = "利用日、税率区分に該当する税率マスタが設定されていません。<br>";
      msg += "設定を確認してください。";
      Common.modalMessageWarning(Message.TITLE_WARNING ,msg, MessagePrefix.WARNING + FunctionId.SALESDETAILS_COMMON + '001');
     }

    return taxInfo.taxRate;
  }

  /** 商品 金額計算
   * @param  {} obj
   */
  export function calcAmountItem(obj){

    if (masterInfo == null || masterInfo.M_ServiceRate == null) return;

    // 入力値取得
    var itemNumber : number;
    itemNumber = Common.ToNumber(obj.controls['itemNumberM'].value)
    + Common.ToNumber(obj.controls['itemNumberF'].value)
    + Common.ToNumber(obj.controls['itemNumberC'].value);

    var unitPrice = Common.ToNumber(obj.controls['unitPrice'].value);
    var taxRate = Common.ToNumber(obj.controls['taxRate'].value);
    var taxServiceDivision = obj.controls['taxServiceDivision'].value;

    var amount = unitPrice * itemNumber;

    var taxInfo = Common.CalcTaxServicePrice(taxServiceDivision, amount, taxRate, masterInfo.M_ServiceRate);

    obj.patchValue({
      amountPrice: amount.toLocaleString(),
      insideTaxPrice: taxInfo.insideTaxPrice,
      insideServicePrice: taxInfo.insideServicePrice,
      outsideServicePrice: taxInfo.outsideServicePrice,
      outsideServiceTaxPrice: taxInfo.outsideServiceTaxPrice
    });
  }

  export class CustomValidator {

    /** 金額が0でないとき商品は必須
     * @param  {AbstractControl} ac コントロール
     */
    static itemRequired (ac: AbstractControl) {
      const item = ac.get('item').value;
      const amountPrice = ac.get('amountPrice').value;

      if (Common.IsNullOrEmpty(item) && Common.ToNumber(amountPrice) != 0) {
        ac.get('item').setErrors({ Required: true });
      }else{
        ac.get('item').setErrors(null);
      }

    };

    /** 商品が選択されているときビル番号は必須(セット商品明細は除外)
     * @param  {AbstractControl} ac コントロール
     */
    static itemBillNoRequired (ac: AbstractControl) {
      const item = ac.get('item').value;
      const billNo = ac.get('billSeparateSeq').value;
      const setItemDivision = ac.get('setItemDivision').value;

      // billSeparateSeq にエラーをセットすると
      // エラーを消した際に他のValidatorがクリアされるので別項目にセットする
      if (!Common.IsNullOrEmpty(item) && Common.IsNullOrEmpty(billNo) && setItemDivision == SystemConst.SET_ITEM_DIVISION_ITEM ) {
        ac.get('billSeparateSeqError').setErrors({ Required: true });
      }else{
        ac.get('billSeparateSeqError').setErrors(null);
      }
    };
  }
}
