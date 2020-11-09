import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/network/http.service';
import { AgentInfo} from '../model/agentinfo.model';
import { AuthService } from '../../../../core/auth/auth.service';


@Injectable({
  providedIn: 'root'
})

export class AgentService extends HttpService {
  constructor(public http: HttpClient, public authService: AuthService) {
    super(http);
  }

  // URLアドレス
  agentUrl: string = "agent";

  // エージェント情報読込-画面表示用
  GetAgentList(agent: AgentInfo): Observable<AgentInfo[]> {
    return this.http.post<AgentInfo[]>(`${this.baseUrl}/${this.agentUrl}/getlist`, agent);
  }

  // エージェント情報読込-編集,削除用
  GetAgentById(agent: AgentInfo): Observable<AgentInfo> {
    return this.http.post<AgentInfo>(`${this.baseUrl}/${this.agentUrl}/getlistbyid`, agent);
  }

  // エージェント情報追加
  InsertAgent(agent: AgentInfo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${this.agentUrl}/addagent`, agent);
  }

  // エージェント情報更新
  UpdateAgent(agent: AgentInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.agentUrl}/updateagent`, agent);
  }

   // エージェント情報削除チェック
  DeleteAgentCheck(agent: AgentInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.agentUrl}/deleteagentcheck/`,agent);
  }

  // エージェント情報削除
  DeleteAgentInfoById(agent: AgentInfo): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${this.agentUrl}/delagent`, agent);
  }
}
