/**名前一覧 */
export class NameSearchInfo {
    roomNo: string;
    nameKanji: string;
    nameKana: string;
    phone: string;
    arrivalDate: string;
    departureDate: string;
    stayDays: number;
    rooms: number;
    persons: number;
    status: string;
    reserveNo: string;
}

/**検索条件 */
export class NameSearchCondition{
  /**会社コード */
  companyNo: string;
  /**名前 */
  name: string;
  /**電話番号 */
  phone: string;
  /**利用日(開始) */
  useDateFrom: string;
  /**利用日(終了) */
  useDateTo: string;
  /**キーワード */
  keyword: string;
  /** 予約 利用者情報のみ */
  reserveOnly: boolean;

}
