import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';


@Component({selector:'app-student-grades',standalone:true,imports:[COMMON],styleUrl:'./grades.component.css',templateUrl:'./grades.component.html'})
export class StudentGradesComponent{
  tab='g';sel:any=null;terms=['Prelim','Midterm','Final'];
  constructor(public d:DataService,private a:AuthService){}
  get s(){return this.a.student!}
  get rows(){return Object.entries(this.s.g).map(([code,g])=>{const avg=this.d.avg(g,
    code);return{code,...this.d.subjects[code],g,gc:this.s.gc?.[code]||[null,null,null],avg,sd:this.d.standing(avg)}})}
}
