import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LumpDeleteService } from '../services/lumpdelete.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { FunctionId, Message, MessagePrefix, SystemConst } from 'src/app/core/system.const';
import { LostItemListInfo } from '../../lostitemlist/model/lostitemlist.model';
import { HttpParams } from '@angular/common/http';
import { LostStateInfo } from '../../master/loststate/model/loststate.model';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { LumpDeleteCommon } from '../lumpdelete.common';
import Swal from 'sweetalert2';
import { SharedService } from '../../../core/shared.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD(ddd)',
  },
  display: {
    dateInput: 'YYYY/MM/DD(ddd)',
    monthYearLabel: 'YYYY年MM月',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-lumpdelete-form',
  templateUrl: './lumpdelete-form.component.html',
  styleUrls: ['./lumpdelete-form.component.scss'],
  providers: [
  {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class LumpDeleteFormComponent implements OnInit {

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 更新日(前) */
  public readonly UdtBefore = "更新日(前)";
  //** は */
  public readonly msgIs = "は";
  //** 更新日(後) */
  public readonly UdtAfter = "更新日(後)";
  //** 以前を指定してください。 */
  public readonly msgFromToError = "以前を指定してください。";

  private currentUser : User;

  // ngModel
  public itemState: string;
  public udtBefore: string;
  public udtAfter: string;

  lostItemLists:LostItemListInfo[];
  states:LostStateInfo[];

  lostItemListForm = this.setInitFormInfo();

  private setInitFormInfo(){
    var lostItemListForm : FormGroup;
    lostItemListForm = this.setLostItemListForm('', '', '', '', '');
    return lostItemListForm;
  }

  /** FormGroup setLostItemListForm */
  private setLostItemListForm(companyNo:string,managementNo: string ,itemState: string ,
                          udtBefore: string , udtAfter: string ){
    return this.fb.group({
        companyNo: new FormControl(companyNo)
      , managementNo: new FormControl(managementNo)
      , itemState: new FormControl(itemState)
      , udtBefore: new FormControl(udtBefore)
      , udtAfter: new FormControl(udtAfter, [Validators.required])
    },{
      validator:
      [
        LumpDeleteCommon.CustomValidator.dateFromTo
      ]
    });
  }

  public searchResultList : LostItemListInfo[] = Array();

  constructor(private authService:AuthService
              , private lumpDeleteService : LumpDeleteService
              , public dialogRef: MatDialogRef<LumpDeleteFormComponent>
              , private router: Router
              , private fb: FormBuilder
              , @Inject(MAT_DIALOG_DATA) public data: LostItemListInfo
              , private SharedService: SharedService) {
      this.currentUser = this.authService.getLoginUser();
  }

  ngOnInit() {
    var hParams = new HttpParams();
    hParams = hParams.append('companyNo', this.currentUser.displayCompanyNo);

    // 忘れ物状態
    this.lumpDeleteService.GetStateList(hParams).subscribe((res : LostStateInfo[]) => {
      this.states = res;
    });
  }

  /** 削除 */
  public async Delete(){

    // 確認
    let body = document.getElementById('lumpdelete');
    let confirmResult = await Common.modalMessageConfirm(Message.TITLE_CONFIRM, `一括削除を実行します。よろしいですか？`, body, MessagePrefix.CONFIRM + FunctionId.LUMPDELETE + '001');
    if (!confirmResult) return;

    // 削除条件
    let cond = new LostItemListInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.itemState = this.lostItemListForm.value.itemState;
    cond.udtBefore = this.ToFormatDate(this.lostItemListForm.value.udtBefore);
    cond.udtAfter = this.ToFormatDate(this.lostItemListForm.value.udtAfter);
    this.lumpDeleteService.LumpDeleteLostItem(cond).subscribe(result =>{
      this.SharedService.lostItemDataChanged = true;
      this.dialogRef.close();
    });
  }


  /** 日付フォーマット修正 */
  private ToFormatDate(value){
    var strDate : string;
    if (!Common.IsNullOrEmpty(value)){
      var date = moment(value);
      strDate = date.format(SystemConst.DATE_FORMAT_YYYYMMDD);
    }
    return strDate;
  }

  public Clear(){
    this.lostItemListForm.patchValue({itemState :""});
    this.lostItemListForm.patchValue({udtBefore :""});
    this.lostItemListForm.patchValue({udtAfter :""});
  }

  /** 戻る */
  public CloseDialog() {
    this.SharedService.lostItemDataChanged = false;
    this.dialogRef.close();
  }
}
