import { ChangeDetectorRef,Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

@Component({selector:'app-grade-entry',standalone:true,imports:[COMMON],
  styleUrl:'./grade-entry.component.css',templateUrl:'./grade-entry.component.html'})
export class GradeEntryComponent{
  terms=['Prelim','Midterm','Final'];term='Prelim';subj='';
  session='All';
  entries:Record<number,number|string|null>={};
  bad:Record<number,boolean>={};err='';busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef,route:ActivatedRoute){
    const q=route.snapshot.queryParamMap.get('s');this.subj=q&&this.mine.includes(q)?q:this.mine[0]||'';this.load()}
  get mine(){return this.d.mySubjects(this.a.user!.id)}
  get sessionOptions(){return ['All',...new Set(this.d.students.filter(s=>this.subj in s.g)
    .map(s=>s.session).filter((session):session is string=>!!session))]}
  get rows(){const rows=this.d.students.filter(s=>this.subj in s.g
    &&(this.session==='All'||s.session===this.session));
    const termIndex=this.terms.indexOf(this.term);
    rows.forEach(s=>{if(this.entries[s.id]===undefined){
      this.entries[s.id]=s.g[this.subj]?.[termIndex]??null;
    }});
    return rows}
  load(){this.entries={};this.bad={};this.err='';if(!this.sessionOptions.includes(this.session))this.session='All';void this.rows}
  periodGrade(id:number,index:number){
    if(index===this.terms.indexOf(this.term)){
      const value=this.entries[id];
      if(value!==null&&value!==undefined&&value!==''){
        const score=Number(value);
        return Number.isFinite(score)&&score>=0&&score<=100?score:null;
      }
    }
    return this.d.students.find(student=>student.id===id)?.g[this.subj]?.[index]??null;
  }
  overall(id:number){
    return this.d.avg(this.terms.map((_,index)=>this.periodGrade(id,index)));
  }
  async save(){if(this.busy)return;this.bad={};const ch:Array<{student_id:number;score:number}>=[];let invalid=0;
    for(const s of this.rows){const entry=this.entries[s.id];
      if(entry===null||entry===undefined||entry==='')continue;
      if(!Number.isFinite(Number(entry))||Number(entry)<0||Number(entry)>100){this.bad[s.id]=true;invalid++;continue}
      ch.push({student_id:s.id,score:Number(entry)})}
    if(invalid){this.err=`${invalid} student(s) need a valid grade from 0 to 100.`;return this.ui.toast('Grades not saved – fix invalid grades.',
      'er')}this.err='';
    if(!ch.length)return this.ui.toast('Enter at least one score to save.','er');
    this.busy=true;
    if(!await this.ui.confirm('Save grades?',`Save ${this.term} grades for ${ch.length} student(s) in ${this.subj}.`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{await this.d.saveGrades(this.subj,this.term,ch);
      this.load();this.ui.toast(`Grades saved for ${this.subj} (${this.term}).`)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Grades could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
