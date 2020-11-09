import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/auth/auth.model';
import { AgentInfo } from '../model/agentinfo.model';
import { AgentService } from '../services/agent.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent implements OnInit {

  private currentUser : User;

  public agents: AgentInfo[];

  constructor(private route: ActivatedRoute,private agentService: AgentService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit(): void{
    // エージェント情報読込み
    var agent = new AgentInfo();
    agent.companyNo = this.currentUser.displayCompanyNo;

    this.agentService.GetAgentList(agent).subscribe((res: AgentInfo[]) => {
      this.agents = res;
    });
  }

  // エージェント情報の削除
  delete(agentCode: string): void {

    var agent = new AgentInfo();
    agent = this.agents.find(element => element.agentCode == agentCode);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, 'エージェント:'+ agent.agentName + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.AGENT_LIST + '001').then((res) => {

      if(res){

        // 削除チェック
        this.agentService.DeleteAgentCheck(agent).pipe().subscribe(check => {

          switch (check) {
            // OK!
            case 0:
              this.deleteAgentInfo(agent);
              break;

            // Confirm
            case 1:
              Common.modalMessageConfirm(Message.TITLE_CONFIRM, Message.DELETE_CONFIRM_ADJUSTCANCEL, null, MessagePrefix.CONFIRM + FunctionId.AGENT_LIST + '002').then((checkresult) =>{
                if(!checkresult){
                  // Cancel
                  return;
                }else{
                  // OK
                  this.deleteAgentInfo(agent);
                }
              });
              break;

            // NG
            case -1:
              // 使用済/予定は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, '予約情報' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.AGENT_LIST + '001');
              break;

            case -2:
              // 使用済/予定は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, 'サイト変換マスタ' + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.AGENT_LIST + '002');
              break;

            default:
              Common.modalMessageError(Message.TITLE_ERROR, 'エージェントマスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.AGENT_LIST + '003');
              break;
          }

        });
      }

    });

  }

  deleteAgentInfo(agent: AgentInfo){

    agent.updator = this.currentUser.userName;

    this.agentService.DeleteAgentInfoById(agent).pipe().subscribe(result => {
      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.AGENT_LIST + '001')
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError(Message.TITLE_ERROR, 'エージェントマスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.AGENT_LIST + '004');
      }
      agent.companyNo = this.currentUser.displayCompanyNo;
      this.agentService.GetAgentList(agent).subscribe((res: AgentInfo[]) => {
        this.agents = res;
      });
    });
  }
}
