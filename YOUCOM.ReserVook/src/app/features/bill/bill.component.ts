import { HeaderService } from './../../core/layout/header/header.service';
import { DBUpdateResult, FunctionId, Message, MessagePrefix } from './../../core/system.const';
import { ReserveService } from './../reserve/services/reserve.service';
import { AuthService } from './../../core/auth/auth.service';
import { Component, OnInit, ViewChildren, AfterViewChecked, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BillService } from './bill.service';
import { BillPrintComponent } from '../print/bill-print/bill-print.component';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Reserve } from '../reserve/model/reserve.model';
import { User } from 'src/app/core/auth/auth.model';
import { BillCondition } from './model/billPrintInfo.model';
import { Common } from 'src/app/core/common';

@Component({
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})

export class BillComponent implements OnInit, AfterViewChecked, OnDestroy {

//#region 画面フォーム
// Validation maxLength
public readonly maxLengthName = 50;
public readonly maxLengthRoomNo = 6;
public readonly maxLengthProviso = 20;

// Validation Message
public readonly msgmaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
public readonly msgmaxLengthRoomNo = this.maxLengthRoomNo.toString() + Message.MAX_LENGTH;
public readonly msgmaxLengthProviso = this.maxLengthProviso.toString() + Message.MAX_LENGTH;

// FormControls
billForm = new FormGroup({
  name : new FormControl('',[Validators.maxLength(this.maxLengthName)]),
  roomNo : new FormControl('',[Validators.maxLength(this.maxLengthRoomNo)]),
  proviso : new FormControl('',[Validators.maxLength(this.maxLengthProviso)]),
  sepBillNo : new FormControl('')
});
//#endregion

//#region Public変数

  /**ビル分割No毎の印刷条件リスト */
  public sepBillNoList: Array<BillCondition> = [];

  /**予約番号 */
  public reserveNo :string;

//#endregion

//#region Private変数

  /**ログインユーザ情報 */
  private currentUser: User;

//#endregion

//#region Property

  /**子コンポーネント(BillPrint)*/
  @ViewChildren(BillPrintComponent) ViewChildBillPrint :BillPrintComponent;

//#endregion

//#region Event Method

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private billService: BillService,
              private reserveService: ReserveService,
              private header: HeaderService) {

    this.currentUser = this.authService.getLoginUser();
    this.reserveNo = this.route.snapshot.paramMap.get('id');
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    // 条件セット
    let cond = new Reserve();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;
    cond.updator = this.currentUser.userName;

    // 予約に存在するビル分割Noを取得
    this.getSeparateBillNoList(cond);

    // ビルNoをチェック,登録がなければ新規採番を行う
    this.checkBillNo(cond);

    this.header.lockCompanySeleter();

  }

  ngAfterViewChecked(){

    this.changeBillPrintCondition();

  }

//#endregion

  /** 印刷条件変更時 */
  private changeBillPrintCondition(){

    // 子コンポーネントに画面値を渡す
    this.ViewChildBillPrint.reserveNo = this.reserveNo;
    this.ViewChildBillPrint.name = this.billForm.controls['name'].value;
    this.ViewChildBillPrint.roomNo = this.billForm.controls['roomNo'].value;
    this.ViewChildBillPrint.proviso = this.billForm.controls['proviso'].value;
    this.ViewChildBillPrint.sepBillNo = this.billForm.controls['sepBillNo'].value;

    // 印刷条件を変数にセット
    const idx = this.sepBillNoList.findIndex(f => f.SepBillNo == this.billForm.controls['sepBillNo'].value)
    if (idx < 0) { return; }
    this.sepBillNoList[idx].ReserveNo = this.reserveNo;
    this.sepBillNoList[idx].Name = this.billForm.controls['name'].value;
    this.sepBillNoList[idx].RoomNo = this.billForm.controls['roomNo'].value;
    this.sepBillNoList[idx].Proviso = this.billForm.controls['proviso'].value;
    this.sepBillNoList[idx].SepBillNo = this.billForm.controls['sepBillNo'].value;
  }

  /** 指定ビル分割Noを印刷するかをセット
   * @param allPrintFlg True:一括印刷 False:画面で指定したビルNoのみ印刷
   */
  private setCondition(allPrintFlg: boolean){

    if (allPrintFlg){

      this.sepBillNoList.forEach((value) => {
        value.PrintOutFlg = true;
      });

    } else {

      const idx = this.sepBillNoList.findIndex(f => f.SepBillNo == this.billForm.controls['sepBillNo'].value)
      this.sepBillNoList[idx].PrintOutFlg = true;

    }

    return;
  }

  /**予約に紐づく利用者名,部屋番号を取得しセット
   * @param res ビル分割Noのリスト
  */
　private getReserveRelationInfo(res :Array<string>){

    let cond = new Reserve();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.reserveNo = this.reserveNo;

    this.reserveService.getReserveInfoByPK(cond).subscribe((rsvInfo :Reserve) => {
      if (rsvInfo == null) {
        Common.modalMessageError(Message.TITLE_ERROR, "予約情報" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.BILL + '001').then(() => {
          this.router.navigate(["/company/rooms"]);
          return;
        });
      }

      // ビル分割毎の印刷条件に利用者、部屋番号をセット
      this.sepBillNoList = [];
      res.forEach((value) => {
        let info = new BillCondition();
        info.ReserveNo = this.reserveNo;
        info.SepBillNo = value;
        info.Name = rsvInfo.guestInfo.guestName;
        info.RoomNo = rsvInfo.assignList[0].roomNo;
        info.Proviso = "";
        info.PrintOutFlg = false;

        this.sepBillNoList.push(info);
      });

      // 画面コントロールの初期値をセット
      this.billForm.controls['name'].setValue(this.sepBillNoList[0].Name);
      this.billForm.controls['roomNo'].setValue(this.sepBillNoList[0].RoomNo);
      this.billForm.controls['proviso'].setValue(this.sepBillNoList[0].Proviso);
      this.billForm.controls['sepBillNo'].setValue("1");

    });

  }

  /**予約に存在するビル分割Noのリストを取得
   * @param cond 予約検索条件
  */
  private getSeparateBillNoList(cond: Reserve){

    this.billService.getSeparateBillNoList(cond).subscribe((res: string[]) => {
      if (res == null) {
        Common.modalMessageError(Message.TITLE_ERROR, "ビル分割情報" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.BILL + '002').then(() => {
          this.router.navigate(["/company/rooms"]);
          return;
        });
      }

     this.getReserveRelationInfo(res);

    });

  }

  /**ビルNoをチェックし,登録がなければ新規採番する
   * @param cond 予約検索条件
  */
  private checkBillNo(cond: Reserve){

    this.billService.checkBillNo(cond).subscribe((res: number) => {
      if (res == DBUpdateResult.Error) {
        Common.modalMessageError(Message.TITLE_ERROR, "ビルNo" + Message.GET_DATA_FAULT + "<br>" + "アサイン状況" + Message.BACK_FORM_NOTICE, MessagePrefix.ERROR + FunctionId.BILL + '003').then(() => {
          this.router.navigate(["/company/rooms"]);
          return;
        });
      }

      this.ngAfterViewChecked();
    });

  }

  /**予約画面に戻る */
  public toReserve() {
    this.router.navigate(['/company/reserve', this.reserveNo]);
  }

  /**指定ビル分割No印刷 */
  public printSeqBill() {
    this.setCondition(false);
    this.billService.setBillCondition(this.sepBillNoList);
    this.billService.setPrintOutFlg(true);
    this.router.navigate(['/print/bill']);
  }

  /**一括印刷 */
  public printAllBill() {
    this.setCondition(true);
    this.billService.setBillCondition(this.sepBillNoList);
    this.billService.setPrintOutFlg(true);
    this.router.navigate(['/print/bill']);
  }

}
