import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AnnListComponent } from '../../../shared/components/ann-list/ann-list.component';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';


@Component({selector:'app-student-announcements',standalone:true,imports:[COMMON,
  AnnListComponent],styleUrl:'./announcements.component.css',templateUrl:'./announcements.component.html'})
export class StudentAnnouncementsComponent{
  y=2026;m=9;sel='';
  constructor(public d:DataService,private a:AuthService){}
  get all(){return this.d.annsFor(this.a.student!)}
  get list(){return this.sel?this.all.filter(x=>x.dt==this.sel):this.all.filter(x=>x.dt<=this.d.today)}
  get label(){return new Date(this.y,this.m,1).toLocaleString('en',{month:'long',year:'numeric'})}
  get blanks(){return Array(new Date(this.y,this.m,1).getDay())}
  get days(){const n=new Date(this.y,this.m+1,0).getDate();return Array.from({length:n},
    (_,i)=>{const k=`${this.y}-${String(this.m+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;return{n:i+1,
    k,has:this.all.some(x=>x.dt==k)}})}
  go(x:number){this.m+=x;if(this.m<0){this.m=11;this.y--}if(this.m>11){this.m=0;this.y++}}
}
