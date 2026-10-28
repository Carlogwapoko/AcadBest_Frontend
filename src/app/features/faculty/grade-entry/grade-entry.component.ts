import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService, FacultyAssignment, Student } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

type GradeTerm='Prelim'|'Midterm'|'Final';

@Component({selector:'app-grade-entry',standalone:true,imports:[COMMON],
  styleUrl:'./grade-entry.component.css',templateUrl:'./grade-entry.component.html'})
export class GradeEntryComponent{
  terms:GradeTerm[]=['Prelim','Midterm','Final'];
  subj='';
  semester='';
  academicYear='';
  section='All';
  session='All';
  entries:Record<number,Record<GradeTerm,number|string|null>>={};
  bad:Record<number,Record<GradeTerm,boolean>>={};
  err='';
  busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef,route:ActivatedRoute){
    const params=route.snapshot.queryParamMap;
    const assignments=this.assignments;
    const selected=assignments.find(item=>item.code===params.get('s')
      &&item.semester===params.get('semester')
      &&item.academic_year===params.get('academic_year')
      &&item.section===params.get('section')
      &&(!params.get('session')||item.session===params.get('session')))||assignments[0];
    this.subj=selected?.code||'';
    this.semester=selected?.semester||'';
    this.academicYear=selected?.academic_year||'';
    this.section=selected?.section||'All';
    this.session=selected?.session||params.get('session')||this.d.subjects[this.subj]?.session||'All';
    this.load();
  }
  get assignments(){return Object.entries(this.d.subjects).flatMap(([code,subject])=>
    this.d.facultyAssignments(subject)
      .filter(item=>item.faculty_id===this.a.user?.id)
      .map(item=>({code,...item,session:item.session||subject.session||'All'})))}
  get mine(){return [...new Set(this.assignments.map(item=>item.code))]}
  get selectedAssignments(){return this.assignments.filter(item=>item.code===this.subj)}
  get semesters(){return [...new Set(this.selectedAssignments.map(item=>item.semester))]}
  get academicYears(){return [...new Set(this.selectedAssignments
    .filter(item=>item.semester===this.semester).map(item=>item.academic_year))]}
  get sections(){return [...new Set(this.selectedAssignments
    .filter(item=>item.semester===this.semester&&item.academic_year===this.academicYear)
    .map(item=>item.section))]}
  get sessionOptions(){
    return [...new Set(this.selectedAssignments
      .filter(item=>item.semester===this.semester&&item.academic_year===this.academicYear
        &&(item.section==='All'||item.section===this.section))
      .flatMap(item=>item.session==='All'?['Afternoon','Evening','Weekends']:[item.session||'Afternoon']))];
  }
  get rows(){
    const assigned=this.selectedAssignments.some(item=>
      item.semester===this.semester
      &&item.academic_year===this.academicYear
      &&(item.section==='All'||item.section===this.section)
      &&(item.session==='All'||item.session===this.session));
    if(!assigned)return [];
    const selected=this.d.students.filter(student=>
      student.enrollment_status==='Enrolled'
      &&this.subj in student.g
      &&this.d.codes(student).includes(this.subj)
      &&student.semester===this.semester
      &&student.academic_year===this.academicYear
      &&(this.section==='All'||student.sec===this.section)
      &&(this.session==='All'||student.session===this.session));
    selected.forEach(student=>{
      const key=this.rowKey(student);
      if(this.entries[key]===undefined){
        this.entries[key]={
          Prelim:student.g[this.subj]?.[0]??null,
          Midterm:student.g[this.subj]?.[1]??null,
          Final:student.g[this.subj]?.[2]??null,
        };
      }
    });
    return selected;
  }
  rowKey(student:Student){return student.enrollment_id??student.id}
  subjectChanged(){
    const assignment=this.selectedAssignments[0];
    this.semester=assignment?.semester||'';
    this.academicYear=assignment?.academic_year||'';
    this.section=assignment?.section||'All';
    this.session=assignment?.session||this.d.subjects[this.subj]?.session||'Afternoon';
    this.load();
  }
  scopeChanged(){this.load()}
  load(){
    this.entries={};this.bad={};this.err='';
    if(!this.semesters.includes(this.semester))this.semester=this.semesters[0]||'';
    if(!this.academicYears.includes(this.academicYear))this.academicYear=this.academicYears[0]||'';
    if(!this.sections.includes(this.section))this.section=this.sections[0]||'All';
    if(!this.sessionOptions.includes(this.session))this.session='All';
    void this.rows;
  }
  periodGrade(student:Student,term:GradeTerm){
    const value=this.entries[this.rowKey(student)]?.[term];
    if(value===null||value===undefined||value==='')return null;
    const score=Number(value);
    return Number.isFinite(score)&&score>=0&&score<=100?score:null;
  }
  overall(student:Student){
    return this.d.subjectAverage(this.subj,this.terms.map(term=>this.periodGrade(student,term)));
  }
  async save(){
    if(this.busy)return;
    this.bad={};
    const changes:Array<{student_id:number;enrollment_application_id:number;
      scores:Partial<Record<GradeTerm,number>>}>=[];
    let invalid=0;
    for(const student of this.rows){
      const key=this.rowKey(student),entry=this.entries[key],scores:Partial<Record<GradeTerm,number>>={};
      let studentInvalid=false;
      for(const term of this.terms){
        const value=entry[term];
        if(value===null||value===undefined||value==='')continue;
        if(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>100){
          this.bad[key]??={Prelim:false,Midterm:false,Final:false};
          this.bad[key][term]=true;invalid++;studentInvalid=true;continue;
        }
        scores[term]=Number(value);
      }
      if(studentInvalid)continue;
      if(!Object.keys(scores).length)continue;
      if(!student.enrollment_id){
        this.err='An enrolled application is missing for a student in this class.';
        return;
      }
      changes.push({student_id:student.id,enrollment_application_id:student.enrollment_id,scores});
    }
    if(invalid){this.err=`${invalid} student(s) need a valid grade from 0 to 100.`;
      return this.ui.toast('Grades not saved – fix invalid grades.','er')}
    this.err='';
    if(!changes.length)return this.ui.toast('Enter at least one score to save.','er');
    this.busy=true;
    if(!await this.ui.confirm('Save grades?',`Save grades for ${changes.length} student(s) in ${this.subj}.`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{
      await this.d.saveGrades(this.subj,changes);
      this.load();this.ui.toast(`Grades saved for ${this.subj}.`);
    }catch(error){
      this.ui.toast((error as {error?:{message?:string}})?.error?.message
        ||(error instanceof Error?error.message:'Grades could not be saved.'),'er');
    }finally{this.busy=false;this.cdr.markForCheck()}
  }
}
