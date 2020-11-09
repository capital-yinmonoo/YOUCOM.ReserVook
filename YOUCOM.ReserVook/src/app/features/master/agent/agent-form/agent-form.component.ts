import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../../core/system.const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AgentService } from '../../agent/services/agent.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.model';
import { AgentInfo } from '../../agent/model/agentinfo.model';
import { Common } from 'src/app/core/common';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-agent-form',
  templateUrl: './agent-form.component.html',
  styleUrls: ['../../../../shared/shared.style.scss', './agent-form.component.scss']
})
export class AgentFormComponent implements OnInit, OnDestroy {

  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly numberFormatPattern = '^[-]?([0-9])*$';
  public readonly AlphabetFormatPattern = '([0-9a-zA-Z])*$';
  public readonly CodeFormatPattern = '([0-9A-Z])*$';
  public readonly min1 = 1;
  public readonly max9999 = 9999;
  public readonly maxLengthCode = 6;
  public readonly maxLengthName = 20;
  public readonly maxLengthRemarks = 100;

  //** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  //** 半角数字で入力してください。 */
  public readonly msgPatternNumber = Message.PATTERN_NUMBER;
  //** 英数カナで入力してください。 */
  public readonly msgPatternKana = Message.PATTERN_KANA;
  //** 半角英大文字数値で入力してください。 */
  public readonly msgPatternAlphabetUpper = Message.PATTERN_ALPHABET_UPPER;
  //** 半角英数で入力してください。 */
  public readonly msgPatternAlphabet = Message.PATTERN_ALPHABET;


  //** 1以上の値で入力してください。 */
  public readonly msgMin1 = this.min1.toString() + Message.MIN_DIGITS;
  //** 9999以下の値で入力してください。 */
  public readonly msgMax9999 = this.max9999.toString() + Message.MAX_DIGITS;
  //** 6文字以下で入力してください。 */
  public readonly msgMaxLengthCode = this.maxLengthCode.toString() + Message.MAX_LENGTH;
  //** 20文字以下で入力してください。 */
  public readonly msgMaxLengthName = this.maxLengthName.toString() + Message.MAX_LENGTH;
  //** 100文字以下で入力してください。 */
  public readonly msgMaxLengthRemarks = this.maxLengthRemarks.toString() + Message.MAX_LENGTH;

  agentCode :string;
  Current_user :User;
  updateFlg: boolean;

  agentForm = new FormGroup({
    companyNo: new FormControl(''),
    agentCode: new FormControl('',[Validators.required, Validators.pattern(this.AlphabetFormatPattern),Validators.maxLength(this.maxLengthCode)]),
    agentName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthName)]),
    remarks: new FormControl('', [Validators.maxLength(this.maxLengthRemarks)]),
    displayOrder: new FormControl('',[Validators.required, Validators.pattern(this.numberFormatPattern),Validators.min(this.min1),Validators.max(this.max9999)]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private agentService: AgentService, private header: HeaderService) {
    // 取得したURLパラメータを渡す
    this.agentCode = this.route.snapshot.paramMap.get('agentCode');
    this.Current_user = this.authService.getLoginUser();
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    this.updateFlg = false;

    if (this.agentCode) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      var cond = new AgentInfo();
      cond.companyNo = this.Current_user.displayCompanyNo;
      cond.agentCode = this.agentCode;

      this.agentService.GetAgentById(cond).pipe().subscribe(agentinfo => this.agentForm.patchValue(agentinfo));
    }
  }

  onSubmit() {

    var agent = this.agentForm.value;
    agent.updator = this.Current_user.userName;

    if (this.agentCode) {
      // エージェント情報の更新
      this.agentCode = this.agentCode;

      this.agentService.UpdateAgent(agent).pipe().subscribe(result => {
        switch(result){
          case DBUpdateResult.Success:
            break;
          case DBUpdateResult.VersionError:
            Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.AGENT_FORM + '001')
            break;

          case DBUpdateResult.Error:
            Common.modalMessageError(Message.TITLE_ERROR, 'エージェントマスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.AGENT_FORM + '001');
            break;
          }
          this.router.navigate(['../../list/'], { relativeTo: this.route });
      });

    } else {

      // エージェント情報の追加
      agent.creator = this.Current_user.userName;
      agent.companyNo = this.Current_user.displayCompanyNo;
      agent.version = 0; //nullだとエラーになるためここで0をセット

      this.agentService.InsertAgent(agent).pipe().subscribe(result => {
        if (result == 0) {
          this.router.navigate(['../../list/'], { relativeTo: this.route });
        }else if(result == 1) {
          Common.modalMessageError(Message.TITLE_ERROR, '使用中のエージェントコードが既に存在しているため新規登録できません。', MessagePrefix.ERROR + FunctionId.AGENT_FORM + '002');
        }
      });
    }
  }
  // 中止
  cancel(): void {
    this.router.navigate(['../../list/'], { relativeTo: this.route });
  }
}
