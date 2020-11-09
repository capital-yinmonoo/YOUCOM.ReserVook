import { Common } from '../../../core/common';
import { SystemConst, Message, MessagePrefix, FunctionId } from '../../../core/system.const';
import { AbstractControl } from '@angular/forms';
import moment from 'moment';

export namespace ReserveCommon {

  // マスタ類保持用
  var reserveAdjustmentFlag : string;
  var adjustmentedBillNoList: Array<number>;

  export const SeqPrefix = 'N';  // New 新しい明細のseqの先頭につける。

  /** マスタ類 */
  export function setMasterList(adjustFlag: string, billNoList: Array<number>){
    reserveAdjustmentFlag = adjustFlag;
    adjustmentedBillNoList = billNoList;
  }

  export function destroyMasterList(){
    reserveAdjustmentFlag = "";
    adjustmentedBillNoList = new Array<number>();
  }

  /** 未精算かどうかチェック
   * @param  {any} billSeparateSeq ビル分割番号
   * @param  {boolean} messageFlag true: メッセージを出力
   * @returns boolean true: 未精算、 false: 精算
   * @remarks changeイベント側からはnumber/精算チェック側からはstringで受けるためany型
   */
  export function CheckNotAdjustmented(billSeparateSeq : any, messageFlag : boolean, checkAll : boolean = false): boolean{

    var seq = Common.ToNumber(billSeparateSeq);
    if (seq > 0 && adjustmentedBillNoList != null) {
      var result = adjustmentedBillNoList.indexOf(seq);
      if (result >= 0){
        if(messageFlag){
          Common.modalMessageWarning(Message.TITLE_WARNING, `ビル分割番号:${billSeparateSeq}は既に精算済みです。`, MessagePrefix.WARNING + FunctionId.RESERVE_COMMON + '001');
        }
        return false;
      }
    };

    return true;
  }

  /** 未精算のビル分割番号の最小値を返す
   * @returns string 未精算のビル分割番号の最小値
   */
  export function SetMinBillSeq(minBillSeq : number, maxBillSeq : number): string {

    let result = 1;

    if (adjustmentedBillNoList != null){
      for(let seq = minBillSeq; seq <= maxBillSeq; seq++){
        if (adjustmentedBillNoList.indexOf(seq) >= 0) continue;
        result = seq;
        break;  // exit for
      }
    }

    return result.toString();
  }

  export class CustomValidator {

    /** 到着日 ≦ 出発日
     * @param  {AbstractControl} ac コントロール
     */
    static dateFromTo (ac: AbstractControl) {
      const arrivalDate = ac.get('arrivalDate').value;
      const departureDate = ac.get('departureDate').value;

      if (!Common.IsNullOrEmpty(arrivalDate) && !Common.IsNullOrEmpty(departureDate)) {
        var diff = moment(departureDate).diff(moment(arrivalDate), 'days')
        if (diff < 0){
          ac.get('departureDate').setErrors({ FromToError: true });
        }
      }
    };

    /** 金額が入力されているとき金種は必須
     * @param  {AbstractControl} ac コントロール
     */
    static assignCount (ac: AbstractControl) {
      const roomCount =  Common.ToNumber(ac.get('roomCount').value);
      const assignCount = Common.ToNumber(ac.get('assignCount').value);

      if (roomCount < assignCount) {
        ac.get('assignCount').setErrors({ Min: true });
      }else{
        ac.get('assignCount').setErrors( null );
      }
    };

    /** 金額が入力されているとき金種は必須
     * @param  {AbstractControl} ac コントロール
     */
    static denominationCodeRequired (ac: AbstractControl) {
      const price = Common.ToNumber(ac.get('price').value);
      const denominationCode = ac.get('denominationCode').value;

      if (price != 0 && Common.IsNullOrEmpty(denominationCode)) {
        ac.get('denominationCode').setErrors({ Required: true });
      }else{
        ac.get('denominationCode').setErrors( null );
      }
    };

    /** 金額が入力されているとき入金日は必須
     * @param  {AbstractControl} ac コントロール
     */
    static depositDateRequired (ac: AbstractControl) {
      const price = Common.ToNumber(ac.get('price').value);
      const depositDate = ac.get('depositDate').value;

      if (price != 0 && Common.IsNullOrEmpty(depositDate)) {
        ac.get('depositDate').setErrors({ Required: true });
      } else{
        ac.get('depositDate').setErrors( null );
      }
    };

    /** 金種が選択されているときビル番号は必須
     * @param  {AbstractControl} ac コントロール
     */
    static depositBillNoRequired (ac: AbstractControl) {
      const denominationCode = ac.get('denominationCode').value;
      const billNo = ac.get('billSeparateSeq').value;

      if (!Common.IsNullOrEmpty(denominationCode) && Common.IsNullOrEmpty(billNo)) {
        ac.get('billSeparateSeqError').setErrors({ Required: true });
      } else {
        ac.get('billSeparateSeqError').setErrors( null );
      }
    };

    /** 精算済ビル番号は選択不可
     * @param  {AbstractControl} ac コントロール
     */
    static billNoAdjustmented (ac: AbstractControl) {
      const rsvAdjustmentFlag = ac.get('adjustmentFlag').value;
      const billNo = ac.get('billSeparateSeq').value;

      if (rsvAdjustmentFlag != SystemConst.ADJUSTMENTED && !Common.IsNullOrEmpty(billNo)) {
        var adjustmented = !ReserveCommon.CheckNotAdjustmented(billNo, false);
        if(adjustmented){
          ac.get('billSeparateSeqError').setErrors({ Adjustmented: true });
        } else {
          ac.get('billSeparateSeqError').setErrors( null );
        }
      }
    };
  }


}
