import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService,FacultyScheduleItem } from '../../../core/data.service';


@Component({selector:'app-faculty-subjects',standalone:true,imports:[COMMON,
  RouterLink],styleUrl:'./subjects.component.css',templateUrl:'./subjects.component.html'})
export class FacultySubjectsComponent{
  sel:FacultyScheduleItem|null=null;
  sessions=['Afternoon','Evening','Weekends'];
  session='Afternoon';
  semester='All';
  academicYear='All';
  constructor(public d:DataService,private a:AuthService){}
  get schedule(){return this.d.facultySchedule(this.a.user!.id)}
  get semesters(){return ['All',...new Set(this.schedule.map(item=>item.semester))]}
  get academicYears(){return ['All',...new Set(this.schedule
    .filter(item=>this.semester==='All'||item.semester===this.semester)
    .map(item=>item.academic_year))]}
  get assignments(){
    const assignments=new Map<string,FacultyScheduleItem>();
    for(const item of this.schedule){
      if(item.session!=='All'&&item.session!==this.session)continue;
      if(this.semester!=='All'&&item.semester!==this.semester)continue;
      if(this.academicYear!=='All'&&item.academic_year!==this.academicYear)continue;
      const key=[item.assignment_id??item.code,item.semester,item.academic_year,item.section,item.session].join('|');
      if(!assignments.has(key)){
        assignments.set(key,{
          ...item,
          day:item.days||item.day,
          session:item.session==='All'?this.session:item.session,
        });
      }
    }
    return [...assignments.values()];
  }
  count(item:FacultyScheduleItem){return this.d.studentsForAssignment(item).length}
  has(student:any,item:FacultyScheduleItem){
    return this.d.studentsForAssignment(item).some(row=>row.enrollment_id===student.enrollment_id)
  }
}
