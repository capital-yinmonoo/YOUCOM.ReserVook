import { Staff } from './../../features/staffs/model/staff.model';
import { CompanyInfo } from 'src/app/features/company/model/company.model';

/** ユーザー認証情報 */
export class User implements Staff {
  companyGroupId: string;
  displayCompanyNo: string;
  userEmail: string;
  password: string;
  userName: string;
  roleDivision: string;
  loginResult: string;
  jwtToken: string;

  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;
  lostFlg: string;

  roleName:string;
  companyName:string;
  userEmailOrigin:string;
  companyInfo:CompanyInfo;

  /**会社番号 */
  companyNo: string;
}

/** ユーザー権限 */
export enum EnumRole {
	SuperAdmin = 0,
	Admin = 1,
	User = 2,
}

/** 忘れ物フラグ */
export enum EnumLostFlg {
  UnUsed = 0,
  Used = 1,
}

/** TrustYou連携区分 */
export enum EnumTrustYou {
  UnUsed = 0,
  Used = 1,
}
