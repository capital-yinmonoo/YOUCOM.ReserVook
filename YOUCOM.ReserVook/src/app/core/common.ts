import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { SystemConst, PrintPage } from './system.const';
import { SalesDetailsTaxInfo } from '../features/reserve/model/reserve.model';

export namespace Common {

  /** モーダルダイアログ エラー(×) (OK)
   * @param  {string} msgTitle タイトル
   * @param  {string} msg メッセージ
   * @param  {string} funcId 機能ID
   */
  export async function modalMessageError(msgTitle:string, msg: string, funcId: string) {

    let msgId : string = ''
    if(funcId != ''){
      msgId = '【' + funcId + '】' + '<br>'
    }

    return Swal.fire({
      title:msgTitle
     , html: msgId + msg
     , icon: 'error' // icon: ×
    }).then((result) => {
      return result.value;
    });
  }

  /** モーダルダイアログ 警告(!) (OK)
   * @param  {string} msgTitle タイトル
   * @param  {string} msg メッセージ
   * @param  {string} funcId 機能ID
   */
  export async function modalMessageWarning(msgTitle:string, msg: string, funcId: string) {

    let msgId : string = ''
    if(funcId != ''){
      msgId = '【' + funcId + '】' + '<br>'
    }

    return Swal.fire({
       title:msgTitle
      , html:msgId + msg
      , icon: 'warning' // icon: !
    }).then((result) => {
      return result.value;
    });
  }

  /** モーダルダイアログ 通知(i) (OK)
   * @param  {string} msgTitle タイトル
   * @param  {string} msg メッセージ
   * @param  {string} funcId 機能ID
   */
  export async function modalMessageNotice(msgTitle:string, msg: string, funcId: string) {

    let msgId : string = ''
    if(funcId != ''){
      msgId = '【' + funcId + '】' + '<br>'
    }

    return Swal.fire({
       title:msgTitle
      , html:msgId + msg
      , icon: 'info' // icon: i
    }).then((result) => {
      return result.value;
    });
  }

  /** モーダルダイアログ 成功(✓) (OK)
   * @param  {string} msgTitle タイトル
   * @param  {string} msg メッセージ
   * @param  {string} funcId 機能ID
   */
  export async function modalMessageSuccess(msgTitle:string, msg: string,  funcId: string) {

    let msgId : string = ''
    if(funcId != ''){
      msgId = '【' + funcId + '】' + '<br>'
    }

    return Swal.fire({
       title:msgTitle
      , html:msgId + msg
      , icon: 'success' // icon: ✓
    }).then((result) => {
      return result.value;
    });
  }

  /** モーダルダイアログ 確認(?) (OK/Cancel)
   * @param  {string} msgTitle タイトル
   * @param  {string} msg メッセージ
   * @param  {string} target ダイアログから起動時に対象を指定
   * @param  {string} funcId 機能ID
   * @returns true: OK, false: Cancel
   */
  export async function modalMessageConfirm(msgTitle:string, msg: string, target : HTMLElement = null, funcId: string) {

    let msgId : string = ''
    if(funcId != ''){
      msgId = '【' + funcId + '】' + '<br>'
    }

     return Swal.fire({
       title:msgTitle
      , html:msgId + msg
      , icon: 'question'
      , showCancelButton: true
      , confirmButtonText: 'OK'
      , cancelButtonText: 'Cancel'
      , target : (target == null) ? 'body' : target
    }).then((result) => {
      if(result.value){
        return true;  // OK
      }else{
        return false; // Cancel
      }
    });
  }

  /** 値がnullか空ならtrue, それ以外はfalse
   * @param  {any} value
   */
  export function IsNullOrEmpty(value:any){
    var result = (value == null || value === "");
    return result;
  }

  /** 数値型に変換。Nanだったら0を補完
   * @param  {any} value
   */
  export function ToNumber(value:any){

    var wkVal : string = value;
    if(!IsNullOrEmpty(wkVal)){
      wkVal = wkVal.toString().replace(/,/, '');
    } else {
      return 0;
    }
    var val = parseInt(wkVal.trim());
    return isNaN(val) ? 0 : val;
  }

  export function IsNumber(value:any){
    return Number.isFinite(value)
  }

  /** 消費税 分解
   * @param  {string} div    税区分
   * @param  {number} taxRate 税率
   * @param  {number} amount 金額
   * @returns {number} 税額
   */
  export function CalcConsumptionTax(div : string, taxRate: number, amount: number) : number{

    // HACK: 端数切捨て(固定)

    var price = 0;
    switch (div){
      case '0': // 無
        price = 0;
        break;
      case '1': // 込
        price = Math.trunc(amount * taxRate / (100 + taxRate) );
        break;
      case '2': // 別
        price = Math.trunc( amount * taxRate / 100 );
        break;
    }
    return price;
  }

  /** 税サ分解
   * @param  {string} taxServiceDivision 税サ区分
   * @param  {number} amount 金額
   * @param  {number} TaxRate 税率
   * @param  {number} ServiceRate サービス料率
   * @returns SalesDetailsTaxInfo
   */
  export function CalcTaxServicePrice(taxServiceDivision: string, amount : number, TaxRate : number, ServiceRate : number) : SalesDetailsTaxInfo{

    // HACK: 端数切捨て(固定)

    var taxDivision;      // 税区分
    var serviceDivision;  // サービス区分

    // 税サ分解
    if(!Common.IsNullOrEmpty(taxServiceDivision) && taxServiceDivision.length === 2 ){
      taxDivision = taxServiceDivision.substr(0,1);
      serviceDivision = taxServiceDivision.substr(1,1);
    }

    var info = new SalesDetailsTaxInfo();

    switch(taxDivision){

      // ----- 内税 ------------------------------------------------------------------------------------------------------
      case SystemConst.INSIDE_TAX_DIVISION:

        if(serviceDivision == SystemConst.INSIDE_SERVICE_DIVISION){

          info.outsideServicePrice = 0;
          info.outsideServiceTaxPrice = 0;

          var insideServicePriceInTax = Math.trunc(amount * ServiceRate / (100 + ServiceRate));      // 税込内サ
          var insideServiceTaxPrice = Math.trunc(insideServicePriceInTax * TaxRate / (100 + TaxRate));  // 内サの内税
          info.insideServicePrice = insideServicePriceInTax - insideServiceTaxPrice;                    // 税別内サ

          var amountInTax = amount - insideServicePriceInTax;
          info.insideTaxPrice = Math.trunc(amountInTax * TaxRate / (100 + TaxRate));
          info.insideTaxPrice += insideServiceTaxPrice;

          return info;
        }

        info.insideServicePrice = 0;
        info.insideTaxPrice = Math.trunc(amount * TaxRate / (100 + TaxRate)); // 内税
        // let netAmount = amount - info.insideTaxPrice;

        // 外サービス料 + 外サービス料消費税
        if(serviceDivision == SystemConst.OUTSIDE_SERVICE_DIVISION){

          var outsideServicePriceInTax = Math.trunc(amount * ServiceRate / 100);                          // 税込外サ
          info.outsideServiceTaxPrice = Math.trunc(outsideServicePriceInTax * TaxRate / (100 + TaxRate)); // 外サの内税
          info.outsideServicePrice = outsideServicePriceInTax - info.outsideServiceTaxPrice;              // 税別外サ
          info.insideTaxPrice += info.outsideServiceTaxPrice;

        } else {
          info.outsideServicePrice = 0;
          info.outsideServiceTaxPrice = 0;
        }
        break;


      // ----- 非課税 ------------------------------------------------------------------------------------------------------
      case SystemConst.NON_TAX_DIVISION:
        info.insideTaxPrice = 0
        info.outsideServiceTaxPrice = 0;

        switch(serviceDivision){
          case SystemConst.INSIDE_SERVICE_DIVISION:
            // ①単価×サービス料率÷(100＋サービス料率)
            info.insideServicePrice = Math.trunc(amount * ServiceRate / (100 + TaxRate));
            info.outsideServiceTaxPrice = 0;
            break;

          case SystemConst.OUTSIDE_SERVICE_DIVISION:
            info.insideServicePrice = 0;
            info.outsideServicePrice = Math.trunc(amount * (ServiceRate / 100));
            break;

          case SystemConst.INSIDE_SERVICE_DIVISION:
            info.insideServicePrice = 0;
            info.outsideServicePrice = 0;
            break;
        }
        break;
    }

    return info;
  }

  /** 日付変換(yyyyMMdd→yyyy/MM/dd)
   * @param  {string} inputDate 日付
   * @returns {string} 日付(yyyy/MM/dd)
   */
  export function ToFormatDate(inputDate: string): string {
    if ((Common.IsNullOrEmpty(inputDate) == true)) {
      return "";
    }

    let work: string = inputDate.trim();
    switch (work.length) {
        case 8:
            //  yyyymmdd
            work = work.substring(0, 4) + "/" + work.substring(4, 6) + "/" + work.substring(6, 8);
            break;
        case 10:
            //  yyyy/mm/dd
            break;
        default:
            return "";
    }

    return work;
  }

  /** 日付変換(Date → yyyyMMdd)
   * @param  {Date} inputDate 日付
   * @returns {string} 日付(yyyyMMdd)
   */
  export function ToFormatStringDate(inputDate: Date): string {
    if ((Common.IsNullOrEmpty(inputDate) == true)) {
      return "";
    }

    const datePipe = new DatePipe('en-US');
    return  datePipe.transform(inputDate, 'yyyyMMdd');

  }

  /** 時刻変換(HHmm→HH:MM)
   * @param  {string} inputDate 時刻
   * @returns {string} 時刻(HH:mm)
   */
  export function ToFormatTime(inputTime: string): string {
    if ((Common.IsNullOrEmpty(inputTime) == true)) {
      return "";
    }

    let work: string = inputTime.trim();
    switch (work.length) {
        case 4:
          //  HHmm
          work = work.substring(0, 2) + ":" + work.substring(2, 4);
          break;
        case 6:
          //  HHmmss
          work = work.substring(0, 2) + ":" + work.substring(2, 4) + ":" + work.substring(4, 6);
          break;
        case 5:
        case 8:
            //  HH:mm
            //  HH:mm:ss
            break;
        default:
          return "";
    }

    return work;
  }

  /**
   * 指定した日付フォーマットでシステム日付を取得する
   * @param format 日付フォーマット(初期値はYYYYMMDD)
   * @return システム日付
  */
  export function getSystemDate(format :string = 'YYYYMMDD') :string{

    let date = new Date();
    let ret = format;

    ret = ret.replace("YYYY", date.getFullYear().toString());
    ret = ret.replace("MM", (date.getMonth() + 1).toString().padStart(2, "0"));
    ret = ret.replace("DD", date.getDate().toString().padStart(2, "0"));

    return ret;

  }

  /**日付の差分日数を取得する
   * @param date1 日付(yyyyMMdd or yyyy/MM/dd)
   * @param date2 日付(yyyyMMdd or yyyy/MM/dd)
   * @returns 差分日数
   */
  export function getDateDiff(date1: string, date2: string): number{

    const strDate1 = ToFormatDate(date1);
    const strDate2 = ToFormatDate(date2);

    const day1 = new Date(strDate1);
    const day2 = new Date(strDate2);

    const diff = Math.abs(day1.getTime() - day2.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));

  }

  /**時間の差分時間を取得する
   * @param date1 日付(HHmm or HH:MM)
   * @param date2 日付(HHmm or HH:MM)
   * @returns 差分時間
   */
  export function getTimeDiff(time1: string, time2: string): number{

    const strTime1 = ToFormatTime(time1);
    const strTime2 = ToFormatTime(time2);

    const dateTime1 = new Date(2020, 0, 1, Common.ToNumber(strTime1.substring(0, 2)), Common.ToNumber(strTime1.substring(3, 5)));
    const dateTime2 = new Date(2020, 0, 1, Common.ToNumber(strTime2.substring(0, 2)), Common.ToNumber(strTime2.substring(3, 5)));

    const diff = Math.abs(dateTime1.getTime() - dateTime2.getTime());
    return Math.ceil(diff / (1000 * 60));
  }


  /**
   * 指定文字列を左から指定バイト数で切り出す
   * @param text 対象文字列
   * @param len 指定バイト数(全角2,半角1バイトとする)
   */
  export function leftB(text: string, len: number) {

    const text_array = text.split('');
    let count = 0;
    let str = '';
    for (let i = 0; i < text_array.length; i++) {
      var n = escape(text_array[i]);
      if (n.length < 4) count++;
      else count += 2;
      if (count > len) {
        return str;
      }
      str += text.charAt(i);
    }
    return text;
  };

  /**
   * 指定文字列をバイト数でカウント
   * @param text 対象文字列
   */
  export function getLenB(text){
    let result = 0;
    for(let i = 0; i < text.length;i++){
      let chr = text.charCodeAt(i);
      if((chr >= 0x00 && chr < 0x81) ||
         (chr === 0xf8f0) ||
         (chr >= 0xff61 && chr < 0xffa0) ||
         (chr >= 0xf8f1 && chr < 0xf8f4)){
        //半角文字の場合は1を加算
        result += 1;
      }else{
        //それ以外の文字の場合は2を加算
        result += 2;
      }
    }
    //結果を返す
    return result;
  };


  /** 配列のDeepCopy
   * @param  {Array<any>} base
   * @returns Array clone
   */
  export function DeepCopy(base){
    return JSON.parse(JSON.stringify(base));
  }

  /** 印刷用紙設定 */
  export function setPrintPage(document: Document, printPage: PrintPage): boolean {

    // CSSで@page設定が効かない(src/index.htmlのCSSのみが適用される)対策
    // 印刷Prev前に<Head>をDOM操作してPage設定する
    let headElement = document.head;
    let style = headElement.getElementsByTagName("style");

    // 他のPage設定が残っている場合、一旦クリア
    for (let i = 0; i < style.length; i++) {
      if (style[i].textContent.startsWith('@page')) {
        style[i].remove();
      }
    }

    let html: string;
    switch(printPage) {
      case PrintPage.A4_LANDSCAPE:
        html = '<style type="text/css">@page { size: A4 landscape; margin: 0mm !important; }</style>';
        break;

      case PrintPage.A4_PORTRAIT:
        html = '<style type="text/css">@page { size: A4 portrait; margin: 0mm !important; }</style>';
        break;

      default:
        console.log('用紙パラメータが不正です。');
        return false;
    }

    // 用紙設定を追加
    headElement.insertAdjacentHTML("afterbegin", html);

    return true;
  }

}
