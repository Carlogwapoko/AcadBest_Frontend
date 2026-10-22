import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';


@Component({selector:'app-student-grades',standalone:true,imports:[COMMON],styleUrl:'./grades.component.css',templateUrl:'./grades.component.html'})
export class StudentGradesComponent{
  tab='g';sel:any=null;semesterFilter='All';academicYearFilter='All';
  constructor(public d:DataService,private a:AuthService){}
  get s(){return this.a.student!}
  get allRows(){return Object.entries(this.s.g).map(([code,g])=>{const avg=this.d.avg(g);
    return{code,...this.d.subjects[code],g,avg,sd:this.d.standing(avg)}})}
  get semesters(){return ['All',...new Set(this.allRows.map(row=>row.semester).filter((value):value is string=>!!value))]}
  get academicYears(){return ['All',...new Set(this.allRows.map(row=>row.academic_year).filter((value):value is string=>!!value))]}
  get rows(){return this.allRows.filter(row=>
    (this.semesterFilter==='All'||row.semester===this.semesterFilter)
    &&(this.academicYearFilter==='All'||row.academic_year===this.academicYearFilter))}
  get totalUnits(){return this.d.unitsOf(this.rows.map(row=>row.code))}
}
