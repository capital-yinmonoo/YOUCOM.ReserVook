import { Base } from 'src/app/shared/model/baseinfo.model';

/**会社マスタ*/
export class CompanyInfo implements Base {
    //Base
    companyNo: string;
    status: string;
    version: number;
    creator: string;
    updator: string;
    cdt: string;
    udt: string;
    lostFlg: string;
    maxCapacity: number;

    /**会社名*/
    companyName: string;
    /**郵便番号*/
    zipCode: string;
    /**住所*/
    address: string;
    /**電話番号*/
    phoneNo: string;
    /**請求先*/
    billingAddress: string;
    /**サービス料率*/
    serviceRate: number;
    /**最終予約番号*/
    lastReserveNo: string;
    /**最終顧客番号*/
    lastCustomerNo: string;
    /**最終ビル番号*/
    lastBillNo: string;
    /**TrustYou連携区分*/
    trustyouConnectDiv: string;

    /**清掃・忘れ物使用 名称*/
    lostFlgName: string;
    /**TrustYou連携区分 名称*/
    trustyouConnectDivName: string;

    /** 会社グループID */
    companyGroupId: string;
    /** 会社グループ名 */
    companyGroupName: string;
}
