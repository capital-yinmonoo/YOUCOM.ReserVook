/**売上情報 */
export class SalesReportInfo{
  /**会社番号 */
  companyNo: string;
  /**利用日 */
  useDate: string;
  /**商品区分 */
  itemDivisionName: string;
  /**商品コード */
  itemCode: string;
  /**印字用名称 */
  printName: string;
  /**マスタ基本単価 */
  unitPrice: number;
  /**数量 */
  itemNumber: number;
  /**ネット金額 */
  netAmount: number;
  /**金額 */
  amountPrice: number;
  /**内消費税 */
  insideTaxPrice: number;
  /**内サービス料 */
  insideServicePrice: number;
  /**外サービス料 */
  outsideServicePrice: number;
  /**入金フラグ */
  depositFlag: boolean;
}

/**売上情報 検索条件 */
export class SalesReportCondition{
  /**会社番号 */
  companyNo: string;
  /**利用日 */
  useDate: string;
  /**月報 */
  monthlyFlag: boolean;
}
