/**明細書*/
export class BillInfo{
  BillHeader: BillHeader;
  BillDetails: Array<BillDetails> = [];
  BillFooter: BillFooter;
  Receipt: Receipt;
  TaxList: Array<TaxList> = [];
}

/**明細書 ヘッダ*/
export class BillHeader {
  /**タイトル*/
  TitleMain: string;
  /**サブタイトル*/
  TitleSub: string;
  /**発行日*/
  IssueDate: string;
  /**ページ数*/
  Pages: string;
  /**ロゴデータ*/
  LogoData: string;
  /**お名前*/
  Name: string;
  /**部屋番号*/
  RoomNo: string;
  /**到着日*/
  ArrivedDate: string;
  /**出発日*/
  DepartureDate: string;
  /**泊数*/
  Nights: string;
  /**人数*/
  Persons: string;
  /**会計書番号*/
  BillNo: string;
}

/**明細書 明細*/
export class BillDetails {
  /**日付*/
  UseDate: string;
  /**摘要*/
  ItemName: string;
  /**単価*/
  UnitPrice: string;
  /**数量*/
  Qty: string;
  /**金額*/
  Charges: string;
  /**お支払*/
  Paid: string;
  /**税率*/
  TaxRate: string;
}

/**明細書 フッタ*/
export class BillFooter {
  /**合計金額*/
  TotalCharges: string;
  /**合計支払額*/
  TotalPaid: string;
  /**請求金額*/
  BalanceDue: string;

  /** 領収金額 */
  ReceiptAmount: string;


  /**コメント1*/
  Comment1: string;
  /**コメント2*/
  Comment2: string;
  /**コメント3*/
  Comment3: string;

  /**振込先*/
  Account: string;

}

/**領収書*/
export class Receipt {
  /**タイトル*/
  TitleMain: string;
  /**サブタイトル*/
  TitleSub: string;
  /**発行日*/
  IssueDate: string;
  /**お名前*/
  Name: string;
  /**合計金額*/
  TotalAmount: string;
  /**但し書き*/
  Proviso: string;
  /**会計書番号*/
  BillNo: string;
}

/**消費税別内訳*/
export class TaxList {
  /**税率*/
  TaxRate: string;
  /**税込み価格*/
  IncludeTaxAmount: string;
  /**内消費税額*/
  ConsumptionTax: string;
}

/**ビル出力条件*/
export class BillCondition{
    /**予約番号*/
    ReserveNo: string;
    /**名前*/
    Name: string;
    /**部屋番号*/
    RoomNo: string;
    /**但し書き*/
    Proviso: string;
    /**ビル分割No*/
    SepBillNo: string;
    /**印刷フラグ(ビル分割No毎の印刷するかどうか) */
    PrintOutFlg: boolean;
}

/**ビルタイトル*/
export class BillTitle{
  /**ビルタイトル */
  BillTitle: string;
  /**ビルサブタイトル */
  BillSubTitle: string;
  /**領収書タイトル */
  ReceiptTitle: string;
  /**領収書サブタイトル */
  ReceiptSubTitle: string;
}
