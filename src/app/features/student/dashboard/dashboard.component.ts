import { ChangeDetectorRef,Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AnnListComponent } from '../../../shared/components/ann-list/ann-list.component';
import { AuthService } from '../../../core/auth.service';
import { DataService,Student } from '../../../core/data.service';

@Component({selector:'app-student-dashboard',standalone:true,imports:[COMMON,
  RouterLink,AnnListComponent],styleUrl:'./dashboard.component.css',templateUrl:'./dashboard.component.html'})
export class StudentDashboardComponent{
  constructor(public d:DataService,private a:AuthService,private cdr:ChangeDetectorRef){
    void this.d.load().then(()=>this.cdr.detectChanges(),()=>this.cdr.detectChanges());
  }
  get s():Student|undefined{return this.a.student}
  get avg(){return this.s?this.d.gwa(this.s):null}
  get sd(){return this.d.standing(this.avg)}
  get open(){return this.d.openRequestCount}
  get latest(){return this.s?this.d.annsFor(this.s).filter(x=>x.dt<=this.d.today).slice(0,3):[]}
}
