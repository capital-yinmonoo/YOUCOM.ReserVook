export namespace SystemConst {

  /** キャンセル済 */
  export const CANCEL_STATE = "2";

  /** 未精算 */
  export const NOT_ADJUSTMENTED = "0";

  /** 精算済 */
  export const ADJUSTMENTED = "1";

  /** 部屋状態 清掃済 */
  export const ROOMSTATUS_CLEANED = "Cleaned";

  /** 部屋状態 アサイン済 */
  export const ROOMSTATUS_ASSIGN = "Assign";

  /** 部屋状態 滞在中 */
  export const ROOMSTATUS_STAY = "Stay";

  /** 部屋状態 滞在中 */
  export const ROOMSTATUS_STAYCLEANING = "StayCleaning";

  /** 部屋状態 滞在中 */
  export const ROOMSTATUS_STAYCLEANED = "StayCleaned";

  /** 部屋状態 チェックアウト済 */
  export const ROOMSTATUS_CO = "CO";

  /** 部屋状態 清掃開始 */
  export const ROOMSTATUS_CLEANING = "Cleaning";

  /** 中抜け状態 中抜け */
  export const HOLLOWSTATUS_HOLLOW = "1";

  /** 中抜け状態 デフォルト */
  export const HOLLOWSTATUS_DEFAULT = "";

  /** 商品区分 */
  export const DIVISION_ITEM = '0004';

  /** 料理区分 */
  export const DIVISION_MEAL = "0005";

  /** 部屋タイプ */
  export const DIVISION_ROOMTYPE = "0006";

  /** フロア */
  export const DIVISION_FLOOR = "0007";

  /** 場所分類 */
  export const DIVISION_PLACE = "0011";

  /** 保管分類 */
  export const DIVISION_STRAGE = "0012";


  export const DATE_FORMAT_YYYYMMDD = "YYYYMMDD";

  export const DATE_FORMAT_YYYY_MM_DD = "YYYY/MM/DD";

  export const DATE_FORMAT_MMDD_ddd = "MM/DD (ddd)";


  /** 非課税 */
  export const NON_TAX_DIVISION = "0";
  /** 税込 */
  export const INSIDE_TAX_DIVISION = "1";

  /** サ無し */
  export const NON_SERVICE_DIVISION = "0";
  /** サ込 */
  export const INSIDE_SERVICE_DIVISION = "1";
  /** サ別 */
  export const OUTSIDE_SERVICE_DIVISION = "2";

  /** 標準税率 */
  export const NORMAL_TAXRATE_DIVISION = "1";
  /** 軽減税率 */
  export const REDUCED_TAXRATE_DIVISION = "2";

  /** TLリンカーン */
  export const SC_CD_TLL = "TLL";

  /** SC名称マスタ　食事条件 */
  export const SC_NAME_CATEGOLY_MEAL_COND = "01";

  /** SC名称マスタ　食事有無情 */
  export const SC_NAME_CATEGOLY_SPEC_MEAL_COND = "02";

  /** 未指定(Web連携用) 表示のみ選択不可 */
  export const UNSPECIFIED : any = {key: '#', value:'未指定'}

  /** 使用中 */
  export const STATUS_USED = "1";

  /** 未使用 */
  export const STATUS_UNUSED = "9";

  /** 単独商品, セット商品(親) */
  export const SET_ITEM_DIVISION_ITEM = "0";
  /** セット商品(子) */
  export const SET_ITEM_DIVISION_SETITEM = "1";

  /** 料理区分(当日計上) */
  export const MEAL_DIVISION_TODAY = "0";
  /** 料理区分(翌日計上) */
  export const MEAL_DIVISION_NEXTDAY = "1";

  /** 実部屋 */
  export const ROOMTYPE_DIVISION_REAL = "1";
  /** 架空部屋 */
  export const ROOMTYPE_DIVISION_FICTIONAL = "2";

  /** 氏名ファイル(予約情報)の利用日 */
  export const USE_DATE_EMPTY = "-";

  /** 氏名ファイル(予約情報)のルートSEQ */
  export const RESERVE_ROUTE_SEQ = 0;

  /** 氏名ファイル(予約情報)のSEQ */
  export const DEFAULT_NAME_SEQ = 1;

  /** 領収金額に含める */
  export const RECEIPT_DIV_INCLUDE = "0";

  /** 領収金額に含めない */
  export const RECEIPT_DIV_EXCLUDE = "1";
}

export class MessagePrefix {
  /** ERR(エラー) */
  public static readonly ERROR : string = 'ERR';
  /** WAR(警告) */
  public static readonly WARNING : string = 'WAR';
  /** INF(情報) */
  public static readonly NOTICE : string = 'INF';
  /** SCS(成功) */
  public static readonly SUCCESS : string = 'SCS';
  /** CFM(確認) */
  public static readonly CONFIRM : string = 'CFM';
}

/** 機能ID */
export class FunctionId {
  /** 認証系 */
  public static readonly AUTH : string = '011';
  /** ログイン */
  public static readonly LOGIN : string = '021';
  /** 明細書発行 */
  public static readonly BILL : string = '031';
  /** 明細書発行 */
  public static readonly PRINT : string = '041';
  /** 連泊状況 */
  public static readonly BOOKINGS : string = '051';
  /** クリーニングレポート - 一覧 */
  public static readonly CLEANINGS_LIST : string = '061';
  /** クリーニングレポート - 印刷 */
  public static readonly CLEANINGS_PRINT : string = '062';
  /** 入金点検 */
  public static readonly CONFIRMINCOME : string = '071';
  /** データエクスポート */
  public static readonly DATAEXPORT : string = '081';
  /** データインポート */
  public static readonly DATAIMPORT : string = '091';
  /** 利用者検索 */
  public static readonly DIALOG_GUESTSEARCH : string = '101';
  /** 予約変更履歴 */
  public static readonly DIALOG_RESERVELOG : string = '111';
  /** 予約検索 */
  public static readonly DIALOG_RESERVESEARCH : string = '121';
  /** TrustYouログ */
  public static readonly DIALOG_TRSTYOULOG : string = '131';
  /** 利用実績 */
  public static readonly DIALOG_USERESULTS : string = '141';
  /** 料理日報 - 一覧 */
  public static readonly DISHREPORT_LIST : string = '151';
  /** 料理日報 - 印刷 */
  public static readonly DISHREPORT_PRINT : string = '152';
  /** 会場状況 */
  public static readonly FACILITY : string = '161';
  /** 台帳 */
  public static readonly LEDGER : string = '171';
  /** 忘れ物 - 忘れ物一覧 - 編集 */
  public static readonly LOSTITEMLIST_FORM : string = '181';
  /** 忘れ物 - 忘れ物一覧 - 一覧 */
  public static readonly LOSTITEMLIST_LIST : string = '182';
  /** 忘れ物 - 一括削除 */
  public static readonly LUMPDELETE : string = '191';
  /** 忘れ物 - 詳細検索 */
  public static readonly DETAILEDSEARCH : string = '201';
  /** マスタ - エージェントマスタ - 編集 */
  public static readonly AGENT_FORM : string = '211';
  /** マスタ - エージェントマスタ - 一覧 */
  public static readonly AGENT_LIST : string = '212';
  /** マスタ - コード名称マスタ - 編集 */
  public static readonly CODENAME_FORM : string = '221';
  /** マスタ - コード名称マスタ - 一覧 */
  public static readonly CODENAME_LIST : string = '222';
  /** マスタ - システムマスタ - 編集 */
  public static readonly COMPANY_FORM : string = '231';
  /** マスタ - システムマスタ - 一覧 */
  public static readonly COMPANY_LIST : string = '232';
  /** マスタ - 会社グループマスタ - 編集 */
  public static readonly COMPANYGROUP_FORM : string = '241';
  /** マスタ - 会社グループマスタ - 一覧 */
  public static readonly COMPANYGROUP_LIST : string = '242';
  /** マスタ - 顧客マスタ - 編集 */
  public static readonly CUSTOMER_FORM : string = '251';
  /** マスタ - 顧客マスタ - 一覧 */
  public static readonly CUSTOMER_LIST : string = '252';
  /** マスタ - 金種マスタ - 編集 */
  public static readonly DENOMINATION_FORM : string = '261';
  /** マスタ - 金種マスタ - 一覧 */
  public static readonly DENOMINATION_LIST : string = '262';
  /** マスタ - 会場マスタ - 編集 */
  public static readonly FACILITY_FORM : string = '271';
  /** マスタ - 会場マスタ - 一覧 */
  public static readonly FACILITY_LIST : string = '272';
  /** マスタ - 商品マスタ - 編集 */
  public static readonly ITEM_FORM : string = '281';
  /** マスタ - 商品マスタ - 一覧 */
  public static readonly ITEM_LIST : string = '282';
  /** マスタ - 忘れ物状態マスタ - 編集 */
  public static readonly LOSTSTATE_FORM : string = '291';
  /** マスタ - 忘れ物状態マスタ - 一覧 */
  public static readonly LOSTSTATE_LIST : string = '292';
  /** マスタ - 部屋マスタ - 部屋表示設定 */
  public static readonly ROOMS_DISPLAY_LOCATION : string = '301';
  /** マスタ - 部屋マスタ - 編集 */
  public static readonly ROOMS_FORM : string = '302';
  /** マスタ - 部屋マスタ - 一覧 */
  public static readonly ROOMS_LIST : string = '303';
  /** マスタ - セット商品マスタ - 編集 */
  public static readonly SETITEM_FORM : string = '311';
  /** マスタ - セット商品マスタ - 一覧 */
  public static readonly SETITEM_LIST : string = '312';
  /** マスタ - ユーザーマスタ - 編集 */
  public static readonly STAFFS_FORM : string = '321';
  /** マスタ - ユーザーマスタ - 一覧 */
  public static readonly STAFFS_LIST : string = '322';
  /** 氏名検索 */
  public static readonly NAMESEARCH : string = '331';
  /** 未アサイン一覧 */
  public static readonly NONASSIGN : string = '341';

  /** 予約登録 */
  public static readonly RESERVE : string = '351';
  /** 予約登録 */
  public static readonly RESERVE_COMMON : string = '352';
  /** 商品情報 */
  public static readonly SALESDETAILS : string = '361';
  /** 商品情報 */
  public static readonly SALESDETAILS_COMMON : string = '362';
  /** アサイン状況 */
  public static readonly ROOMS_ASSIGN : string = '371';
  /** 部屋割詳細 */
  public static readonly ROOMS_DETAILS : string = '372';
  /** 売上日報 */
  public static readonly SALESREPORT_DAILY : string = '381';
  /** 売上月報 */
  public static readonly SALESREPORT_MONTHLY : string = '382';
  /** TrustYou連携 */
  public static readonly TRUSTYOU : string = '391';
  /** WEB連携 - 支払方法変換マスタ - 編集 */
  public static readonly PAYMENTCONVERT_FORM : string = '401';
  /** WEB連携 - 支払方法変換マスタ - 一覧 */
  public static readonly PAYMENTCONVERT_LIST : string = '402';
  /** WEB連携 - プラン変換マスタ - 編集 */
  public static readonly PLANCONVERT_FORM : string = '411';
  /** WEB連携 - プラン変換マスタ - 一覧 */
  public static readonly PLANCONVERT_LIST : string = '412';
  /** WEB連携 - ポイント変換マスタ - 編集 */
  public static readonly POINTCONVERT_FORM : string = '421';
  /** WEB連携 - ポイント変換マスタ - 一覧 */
  public static readonly POINTCONVERT_LIST : string = '422';
  /** WEB連携 - 備考変換マスタ - 編集 */
  public static readonly REMARKSCONVERT_FORM : string = '431';
  /** WEB連携 - 備考変換マスタ - 一覧 */
  public static readonly REMARKSCONVERT_LIST : string = '432';
  /** WEB連携 - 部屋タイプ変換マスタ - 編集 */
  public static readonly ROOMTYPECONVERT_FORM : string = '441';
  /** WEB連携 - 部屋タイプ変換マスタ - 一覧 */
  public static readonly ROOMTYPECONVERT_LIST : string = '442';
  /** WEB連携 - 基本マスタ - 編集 */
  public static readonly SITECONTROLLER_FORM : string = '451';
  /** WEB連携 - 基本マスタ - 一覧 */
  public static readonly SITECONTROLLER_LIST : string = '452';
  /** WEB連携 - サイト変換マスタ - 編集 */
  public static readonly SITECONVERT_FORM : string = '461';
  /** WEB連携 - サイト変換マスタ - 一覧 */
  public static readonly SITECONVERT_LIST : string = '462';
  /** WEB予約一覧 - 編集 */
  public static readonly WEBRESERVES_FORM : string = '471';
  /** WEB予約一覧 - 一覧 */
  public static readonly WEBRESERVES_LIST : string = '472';

}

/** メッセージ */
export class Message {

  //#region ----Validation Message----
    /** 必須項目です。 */
    public static readonly REQUIRED = "必須項目です。";
    /** 日付形式(yyyy/MM/dd)で入力してください。 */
    public static readonly PATTERN_DATE = "日付形式(yyyy/MM/dd)で入力してください。";
    /** 半角数字で入力してください。 */
    public static readonly PATTERN_NUMBER = "半角数字で入力してください。";
    /** 半角数字とハイフン(-)で入力してください。 */
    public static readonly PATTERN_PHONE = "半角数字とハイフン(-)で入力してください。";
    /** 英数字を半角で入力してください。 */
    public static readonly PATTERN_ALPHABET_NUMBER = "英数字を半角で入力してください。";
    /** 英字、数字、記号を半角で入力してください。 */
    public static readonly PATTERN_ALPHABET_MARK = "英字、数字、記号を半角で入力してください。";
    /** 英字、数字、記号(_-.@)を半角で入力してください。 */
    public static readonly PATTERN_EMAIL = "英字、数字、記号(_-.@)を半角で入力してください。";
    /** 半角英数で入力してください。 */
    public static readonly PATTERN_ALPHABET = "半角英数で入力してください。";
    /** 半角英大文字数値で入力してください。 */
    public static readonly PATTERN_ALPHABET_UPPER = "半角大文字英数で入力してください。";
    /** 英数カナで入力してください。 */
    public static readonly PATTERN_KANA = "英数カナで入力してください。";
    /** 郵便番号形式で入力してください。 */
    public static readonly PATTERN_ZIP = "郵便番号形式で入力してください。";
    /** 以上の値で入力してください。 */
    public static readonly MIN_DIGITS = "以上の値で入力してください。";
    /** 以下の値で入力してください。 */
    public static readonly MAX_DIGITS = "以下の値で入力してください。";
    /** 文字で入力してください。 */
    public static readonly LENGTH = "文字で入力してください。";
    /** 文字以下で入力してください。 */
    public static readonly MAX_LENGTH = "文字以下で入力してください。";
    /** 文字以上で入力してください。 */
    public static readonly MIN_LENGTH = "文字以上で入力してください。";
    /** 有効なメールアドレスを入力してください。 */
    public static readonly VALIDITY_EMAIL = "有効なメールアドレスを入力してください。";
    /** を選択してください。 */
    public static readonly CHOOSE_ARTICLE = "を選択してください。";

   //#endregion

  //#region ----Error Message----

    /** 排他エラー */
    public static readonly TITLE_VERSION_ERROR : string = "排他エラー";

    /** エラー */
    public static readonly TITLE_ERROR : string = "エラー";

    /** APIエラー */
    public static readonly TITLE_API_ERROR : string = "APIエラー";

    /** 重複エラー */
    public static readonly TITLE_WEAR_ERROR : string = "重複エラー";

    /** {0}の取得に失敗しました。 */
    public static readonly GET_DATA_FAULT : string = "の取得に失敗しました。";
    /** {0}は使用済/使用予定のため削除できません。 */
    public static readonly DELETE_DATA_FAULT_FOR_USED : string = "は使用済/使用予定のため削除できません。";
    /** 他端末で更新されました。再度処理を行ってください。 */
    public static readonly UPDATE_VERSION_ERROR : string = "他端末で更新されました。再度処理を行ってください。";
    /** {0}の更新に失敗しました。再度処理を行ってください。 */
    public static readonly UPDATE_ERROR : string = "の更新に失敗しました。<br>再度処理を行ってください。";

    /** 精算済です。 */
    public static readonly ADJUSTMENTED_ERROR : string = "精算済です。";
    /** 未精算の売上が残っています。 */
    public static readonly NOTADJUSTMENTED_ERROR : string = "未精算の売上が残っています。";

    /**部屋タイプの異なる部屋へのアサインはできません。 */
    public static readonly ASSIGN_DIFFERENT_ROOMTYPE_ERROR : string = "部屋タイプの異なる部屋へのアサインはできません。";
    /**使用した部屋がマスタから削除済の為、チェックアウト取消はできません。 */
    public static readonly CO_CANCEL_ROOMDELETED_ERROR : string = "使用した部屋がマスタから削除済の為、<br>チェックアウト取消はできません。";

    /** 使用中の同じ */
    public static readonly SAME_ERROR : string = "使用中の同じ";
    /** が既に存在しているため新規登録できません。 */
    public static readonly ADD_ALREADY_ENTRY_ERROR : string = "が既に存在しているため新規登録できません。";

    /** が既に存在しているため更新できません。 */
    public static readonly UPDATE_ALREADY_ENTRY_ERROR : string = "が既に存在しているため更新できません。";

    /** で使用中のため新規登録できません。 */
    public static readonly USED_ERROR : string = "で使用中のため新規登録できません。";

    /** で使用中のため削除できません。 */
    public static readonly DELETE_USED_ERROR : string = "で使用中のため削除できません。";

    /** セット商品はここから削除できません。セット商品マスタから削除してください。 */
    public static readonly DELETE_ITEM_SETITEM_ERROR : string = "セット商品はここから削除できません。<br>セット商品マスタから削除してください。";

    /** 登録されていない予約番号です。 */
    public static readonly WRONG_RESERVE_NO_ERROR : string = "登録されていない予約番号です。";
  //#endregion

  //#region ----Confirm Message----
    /** 確認 */
    public static readonly TITLE_CONFIRM : string = "確認";

    /** {0}を削除してもよろしいですか？ */
    public static readonly DELETE_CONFIRM : string = "を削除してもよろしいですか？";

    /** 該当予約の精算取消ができなくなります。削除してもよろしいですか？ */
    public static readonly DELETE_CONFIRM_ADJUSTCANCEL : string = "該当予約の精算取消ができなくなります。<br>削除してもよろしいですか？";

    /** 削除してもよろしいですか？ */
    public static readonly DELETE_CONFIRM_SIMPLE : string = "削除してもよろしいですか？";

  //#endregion

  //#region ----Notice Message----
    /** 通知 */
    public static readonly TITLE_NOTICE : string = "通知";

    /** {0}画面に戻ります。 */
    public static readonly BACK_FORM_NOTICE : string = "画面に戻ります。";

    /** {0}へアサインしました。 */
    public static readonly ASSIGN_SUCCESS_NOTICE : string = "へアサインしました。";
    /** 翌日以降,同部屋タイプに空きがない為,未アサインの日があります。*/
    public static readonly ASSIGN_SUCCESS_NOTICE_WITH_NONASSIGN_DAY : string = "翌日以降、同部屋タイプに空きがない為、未アサインの日があります。";
    /** 翌日以降,同部屋タイプに空きがない為,同部屋タイプの部屋にアサインされました。*/
    public static readonly ASSIGN_SUCCESS_NOTICE_WITH_DIFFERENT_ROOM_DAY : string = "翌日以降、同部屋に空きがない為、同部屋タイプの部屋にアサインされました。";
    /** {0}のアサインを解除しました。 */
    public static readonly ASSIGN_CANCEL_SUCCESS_NOTICE : string = "のアサインを解除しました。";

    /** {0}をチェックインしました。 */
    public static readonly CHECKIN_SUCCESS_NOTICE : string = "の部屋をチェックインしました。";
    /** {0}のチェックインを取消しました。 */
    public static readonly CHECKIN_CANCEL_SUCCESS_NOTICE : string = "の部屋のチェックインを取消しました。";
    /** {0}をチェックアウトしました。 */
    public static readonly CHECKOUT_SUCCESS_NOTICE : string = "の部屋をチェックアウトしました。";
    /** {0}のチェックアウトを取消しました。 */
    public static readonly CHECKOUT_CANCEL_SUCCESS_NOTICE : string = "の部屋のチェックアウトを取消しました。";
    /** {0}を清掃完了にしました。 */
    public static readonly CLEANING_SUCCESS_NOTICE : string = "を清掃完了にしました。";
    /** {0}ルームチェンジしました。 */
    public static readonly ROOMCHANGE_SUCCESS_NOTICE : string = "ルームチェンジしました。";
    /** {0}を中抜けにしました。 */
    public static readonly HOLLOW_SUCCESS_NOTICE : string = "の部屋を中抜けにしました。";
    /** {0}を中抜け取消しました。 */
    public static readonly HOLLOW_CANCEL_SUCCESS_NOTICE : string = "の部屋を中抜け取消しました。";
    /** {0}を中抜けチェックインしました。 */
    public static readonly HOLLOW_CI_SUCCESS_NOTICE : string = "の部屋を中抜けチェックインしました。";
    /** {0}を中抜けチェックイン取消しました。 */
    public static readonly HOLLOW_CIC_SUCCESS_NOTICE : string = "の部屋を中抜けチェックイン取消しました。";
    /** {0}を登録しました。 */
    public static readonly INSERT_SUCCESS_NOTICE : string = "を登録しました。";

    /** {0}を更新しました。 */
    public static readonly UPDATE_SUCCESS_NOTICE : string = "を更新しました。";

    /** {0}を削除しました。 */
    public static readonly DELETE_SUCCESS_NOTICE : string = "を削除しました。";

    /** アカウント情報変更後は再度ログインしてください。 */
    public static readonly RELOGIN_NOTICE : string = "アカウント情報変更後は再度ログインしてください。";

    /** 更新対象のデータはありません。 */
    public static readonly NODATA_TO_UPDATE : string = "更新対象のデータはありません。";

  //#endregion

    /** 成功 */
    public static readonly TITLE_SUCCESS : string = "成功";

    /** 注意 */
    public static readonly TITLE_WARNING : string = "注意";

  }

/**データベース更新結果 戻り値*/
export enum DBUpdateResult{
  /**成功*/
  Success = 0,
  /**排他エラー*/
  VersionError = -1,
  /**使用済みエラー(マスタ系で使用済の為削除不可)*/
  UsedError = -2,
  /**重複エラー*/
  OverlapError = -3,
  /**エラー*/
  Error = -99
}

/** 商品区分 */
export enum ItemDivision {
  Stay = 1
  , Hal
  , Meal
  , Drink
  , NoCategory
  , SetItem
}

/** 印刷ページ設定 */
export enum PrintPage {
  A4_PORTRAIT
  ,A4_LANDSCAPE
}
