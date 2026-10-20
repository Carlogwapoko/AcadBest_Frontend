import { ChangeDetectorRef,Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AnnListComponent } from '../../../shared/components/ann-list/ann-list.component';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { RiskTableComponent } from '../components/risk-table/risk-table.component';


@Component({selector:'app-faculty-dashboard',standalone:true,imports:[COMMON,
  RouterLink,RiskTableComponent,AnnListComponent],styleUrl:'./dashboard.component.css',templateUrl:'./dashboard.component.html'})
export class FacultyDashboardComponent{
  constructor(public d:DataService,private a:AuthService,private cdr:ChangeDetectorRef){
    void this.d.load().then(()=>this.cdr.detectChanges(),()=>this.cdr.detectChanges());
  }
  get uid(){return this.a.user!.id}
  get risk(){return this.d.atRisk(this.uid)}
}
