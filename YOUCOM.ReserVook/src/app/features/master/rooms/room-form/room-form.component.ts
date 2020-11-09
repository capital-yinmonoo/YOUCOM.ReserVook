import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component,OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomService } from '../../../rooms/services/room.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { CodeNameInfo } from '../../codename/model/codename.model';
import { HttpParams } from '@angular/common/http';
import { RoomInfo } from '../../../rooms/model/rooms.model';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-edit',
  templateUrl: './room-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './room-form.component.scss']
})

export class roomInfoComponent implements OnInit, OnDestroy{

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly kanaFormatPattern = '^[0-9a-zA-Zァ-ンヴー 　]*$';
  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLengthRoomName = 20;
  public readonly maxLengthRemarks = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;

  //** 0以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthRoomName = this.maxLengthRoomName.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLengthRemarks = this.maxLengthRemarks.toString() + Message.MAX_LENGTH;

  roomNo :string;
  Current_user :User;
  updateFlg: boolean;

  roomForm = new FormGroup({
    roomNo: new FormControl('',[Validators.required, Validators.pattern(this.numberFormatPattern),Validators.min(this.min1),Validators.max(this.max9999)]),
    roomName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthRoomName)]),
    floor: new FormControl('',[Validators.required]),
    roomTypeCode: new FormControl('',[Validators.required]),
    smokingDivision: new FormControl('',[Validators.required]),
    remarks: new FormControl('', [Validators.maxLength(this.maxLengthRemarks)]),
    rowIndex: new FormControl(''),
    columnIndex: new FormControl(''),
    companyNo: new FormControl(''),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  floors: CodeNameInfo[];
  types: CodeNameInfo[];
  isForbids: CodeNameInfo[];

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private roomService: RoomService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.roomNo = this.route.snapshot.paramMap.get('roomNo');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit( ) {

    this.updateFlg = false;

    if (this.roomNo) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      var room = new RoomInfo();
      room.companyNo = this.Current_user.displayCompanyNo;
      room.roomNo = this.roomNo;

      this.roomService.getRoomInfoById(room).pipe().subscribe(roominfo => this.roomForm.patchValue(roominfo));
    }

    var cond = new HttpParams()
    cond = cond.append('companyNo', this.Current_user.displayCompanyNo);

    // フロア
    this.roomService.GetFloorList(cond).subscribe((res : CodeNameInfo[]) => {
      this.floors = res;
    });

    // 部屋タイプ
    this.roomService.GetTypeList(cond).subscribe((res : CodeNameInfo[]) => {
      this.types = res;
    });

    // 禁煙/喫煙
    this.roomService.GetIsForbidList(cond).subscribe((res : CodeNameInfo[]) => {
      this.isForbids = res;
    });

  }

  // 部屋情報追加
  onSubmit() {

    var room = this.roomForm.value;
    room.updator = this.Current_user.userName;

    if (this.roomNo) {
      // 部屋情報の更新
      this.roomNo = this.roomNo;

      this.roomService.updateRoomInfo(room).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;

          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ROOMS_FORM + '001')
            break;

          default:
            Common.modalMessageError(Message.TITLE_ERROR, '部屋マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ROOMS_FORM + '001');
            break;
        }
        this.router.navigate(["../../list/"], { relativeTo: this.route });
      })

    } else {

      // 部屋情報の追加
      room.creator = this.Current_user.userName;
      room.companyNo = this.Current_user.displayCompanyNo;
      room.columnIndex = null;
      room.rowIndex = null;
      room.version = 0; //nullだとエラーになるためここで0をセット

      this.roomService.InsertRoomInfo(room).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(["../../list/"], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_ERROR, '使用中の同部屋番号が既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.ROOMS_FORM + '002');
        }
      });
    }
  }

  // 戻る
  cancel(): void {
    this.router.navigate(["../../list/"], { relativeTo: this.route });
  }
}
