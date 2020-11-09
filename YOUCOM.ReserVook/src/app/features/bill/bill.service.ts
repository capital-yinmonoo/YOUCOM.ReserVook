import { Base } from 'src/app/shared/model/baseinfo.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/network/http.service';
import { Reserve, DepositInfo } from '../reserve/model/reserve.model';
import { BillCondition, BillTitle } from './model/billPrintInfo.model';
import { DenominationInfo } from '../master/denomination/model/denominationinfo.model';

@Injectable({
  providedIn: 'root'
})

export class BillService extends HttpService {

  /** コンポーネント携値値 */
  private billcond : Array<BillCondition>;
  /** コンポーネントリフレッシュフラグ */
  private printOutFlg : Boolean = false;

  constructor(public http: HttpClient) {
    super(http);
  }

//#region API Connection Service

  /**予約に存在するビル分割Noのリストを取得 */
  public getSeparateBillNoList(cond:Reserve): Observable<Array<string>> {
    return this.http.post<Array<string>>(`${this.baseUrl}/bill/getSeparateBillNoList`, cond);
  }

  /**明細のビルNoをチェック,登録がなければ新規採番を行う */
  public checkBillNo(cond:Reserve): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/bill/checkBillNo`, cond);
  }

  /**ビルフッタコメントを取得 */
  public getBillFooterComment(): Array<string>{

    // 3行分あり。現状はPG固定
    let comment = new Array<string>();
    comment.push("軽減税率及び非課税品目には、摘要末尾に税率が表示されます。");
    comment.push("　");
    comment.push("　");

    return comment;
  }

  /**ビル・領収書のタイトルを取得 */
  public getBillTitle(): BillTitle{

    // 現状はPG固定
    let billTitle = new BillTitle();
    billTitle.BillTitle = "御請求明細書";
    billTitle.BillSubTitle = "STATEMENT";
    billTitle.ReceiptTitle = "領収書";
    billTitle.ReceiptSubTitle = "RECEIPT";
    return billTitle;

  }

//#endregion

//#region Component Service

    /** 連携値設定 */
    public setBillCondition(cond: Array<BillCondition>) : void {
      this.billcond = cond;
    }

    /** 連携値取得 */
    public getBillCondition() : Array<BillCondition> {
      return this.billcond;
    }

    /** 印刷フラグ設定 */
    public setPrintOutFlg(printOutFlg: Boolean) {
      this.printOutFlg = printOutFlg;
    }

    /** 印刷フラグ取得 */
    public getPrintOutFlg() {
        return this.printOutFlg;
    }

    /** 連携値クリア */
    public clearBillCondition() : void {
      this.billcond = [];
    }

//#endregion

}
