import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { RiskTableComponent } from '../components/risk-table/risk-table.component';


@Component({selector:'app-at-risk',standalone:true,imports:[COMMON,RiskTableComponent],
  styleUrl:'./at-risk.component.css',templateUrl:'./at-risk.component.html'})
export class AtRiskComponent{constructor(public d:DataService,public a:AuthService){}}
