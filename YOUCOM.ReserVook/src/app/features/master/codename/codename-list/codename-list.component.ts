import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { SystemConst } from '../../../../core/system.const';
import { CodeNameInfo } from '../model/codename.model';
import { CodenameService } from '../services/codename.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Common } from 'src/app/core/common';
import { HttpParams } from '@angular/common/http';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';


@Component({
  selector: 'app-codename-list',
  templateUrl: './codename-list.component.html',
  styleUrls: ['./codename-list.component.scss']
})

export class CodenameListComponent implements OnInit {

  private currentUser : User;
  public divisionCode :string;
  public codeNames: CodeNameInfo[]; // 一覧表示用データ
  public codenameName:string;       // 画面名

  public useValueFlag : boolean;              // 値使用フラグ
  private roomtypeDivisions: CodeNameInfo[];  // 部屋タイプ用 部屋タイプ区分リスト

  constructor(private route: ActivatedRoute,private codeNameService: CodenameService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.divisionCode = param.get("divisionCode");
      this.ngOnInit();
    });
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // マスタ情報読込み
    var condition = new CodeNameInfo();
    condition.companyNo = this.currentUser.displayCompanyNo;
    condition.divisionCode = this.divisionCode;

    this.useValueFlag = false;

    switch(condition.divisionCode){
      case SystemConst.DIVISION_ROOMTYPE:
        this.codenameName = "部屋タイプマスタ";

        // 部屋タイプ区分
        var cond = new HttpParams()
        cond = cond.append('companyNo', this.currentUser.displayCompanyNo);
        this.codeNameService.getRoomTypeDivisionList(cond).subscribe((res : CodeNameInfo[]) => {
          this.roomtypeDivisions = res;
        });
        this.useValueFlag = true;
        break;
      case SystemConst.DIVISION_FLOOR:
        this.codenameName = "フロアマスタ";
        break;
      case SystemConst.DIVISION_PLACE:
        this.codenameName = "忘れ物管理 - 場所分類設定マスタ";
        break;
      case SystemConst.DIVISION_STRAGE:
        this.codenameName = "忘れ物管理 - 保管分類設定マスタ";
        break;
    }

    this.codeNameService.GetCodeNameList(condition).subscribe((res: CodeNameInfo[]) => {
      this.codeNames = res;
    });
  }

  // 削除
  delete(divisionCode: string, code: string): void {

    var codeName = new CodeNameInfo();
    codeName = this.codeNames.find(element => element.divisionCode == divisionCode && element.code == code);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, "コード:" + codeName.code + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.CODENAME_LIST + '001').then((result) => {
      if(result){
        //削除チェック

        this.codeNameService.DeleteCodeNameCheck(codeName).pipe().subscribe(check => {
          switch(check){
            case 0:
              // 削除処理
              codeName.updator = this.currentUser.userName;

              this.codeNameService.DeleteCodeNameById(codeName).pipe().subscribe(result => {
                if (result == DBUpdateResult.VersionError) {
                  // バージョンError
                  Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.CODENAME_LIST + '001')
                  return;
                }
                if (result == DBUpdateResult.Error) {
                  // Error
                  Common.modalMessageError(Message.TITLE_ERROR, this.codenameName + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.CODENAME_LIST + '001');
                  return;
                }
                codeName.companyNo = this.currentUser.displayCompanyNo;
                this.codeNameService.GetCodeNameList(codeName).subscribe((res: CodeNameInfo[]) => {
                  this.codeNames = res;
                });
              })
              break;

            case 1:
              // 部屋タイプ,フロアが使用中
              Common.modalMessageError(Message.TITLE_ERROR, '部屋マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.CODENAME_LIST + '002');
              return;

            case 2:
              // 忘れ物場所分類,忘れ物保管分類が使用中
              Common.modalMessageError(Message.TITLE_ERROR, '忘れ物一覧' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.CODENAME_LIST + '003');
              return;

            case 3:
              // 部屋タイプ変換が使用中
              Common.modalMessageError(Message.TITLE_ERROR, '部屋タイプ変換マスタ' + Message.DELETE_USED_ERROR,MessagePrefix.ERROR + FunctionId.CODENAME_LIST + '004');
              return;
          }
        });
      }else{
        // Cancel
        return;
      }
    });
  }

  /** 値 項目名表示
   * @param  {} value
   */
  public DispCodeValueTitle() : string {

    let result = '';

    switch(this.divisionCode){
      case SystemConst.DIVISION_ROOMTYPE:
        result = '部屋タイプ区分';
        break;

      default:
        break;
    }

    return result;
  }

  /** 値 名称変換
   * @param  {} value
   */
  public ConvValueName(value) : string {

    let result = '';
    if(isNullOrUndefined(value)) return result;

    switch(this.divisionCode){
      case SystemConst.DIVISION_ROOMTYPE:
        result = this.roomtypeDivisions.find(x => x.code == value).codeName;
        break;

      default:
        break;
    }

    return result;
  }
}
