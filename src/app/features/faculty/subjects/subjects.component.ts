import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';


@Component({selector:'app-faculty-subjects',standalone:true,imports:[COMMON,
  RouterLink],styleUrl:'./subjects.component.css',templateUrl:'./subjects.component.html'})
export class FacultySubjectsComponent{
  sel='';
  constructor(public d:DataService,private a:AuthService){}
  get mine(){return this.d.mySubjects(this.a.user!.id)}
  count(c:string){return this.d.students.filter(s=>c in s.g).length}
  has(s:any,c:string){return c in s.g}
}
