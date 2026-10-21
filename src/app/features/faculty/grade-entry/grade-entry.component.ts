import { ChangeDetectorRef,Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { GradingSystemComponent } from '../components/grading-system/grading-system.component';

type ComponentInput=number|string|null;

@Component({selector:'app-grade-entry',standalone:true,imports:[COMMON,GradingSystemComponent],
  styleUrl:'./grade-entry.component.css',templateUrl:'./grade-entry.component.html'})
export class GradeEntryComponent{
  terms=['Prelim','Midterm','Final'];term='Prelim';subj='';
  entries:Record<number,{written_works:ComponentInput;performance_tasks:ComponentInput;exams:ComponentInput}>={};
  bad:Record<number,boolean>={};err='';busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef,route:ActivatedRoute){
    const q=route.snapshot.queryParamMap.get('s');this.subj=q&&this.mine.includes(q)?q:this.mine[0]||'';this.load()}
  get mine(){return this.d.mySubjects(this.a.user!.id)}
  get cw(){return this.d.subjects[this.subj]?.cw||[30,50,20]}
  get rows(){const rows=this.d.students.filter(s=>this.subj in s.g);
    const termIndex=this.terms.indexOf(this.term);
    rows.forEach(s=>{if(!this.entries[s.id]){
      const current=s.gc?.[this.subj]?.[termIndex];
      this.entries[s.id]=current?{...current}:{written_works:null,performance_tasks:null,exams:null};
    }});
    return rows}
  load(){this.entries={};this.bad={};this.err='';void this.rows}
  calculated(id:number){const entry=this.entries[id];
    if(!entry||[entry.written_works,entry.performance_tasks,entry.exams].some(v=>v===null||v===''))return null;
    const values=[entry.written_works,entry.performance_tasks,entry.exams].map(Number);
    if(values.some(value=>!Number.isFinite(value)||value<0||value>100))return null;
    return Number(((values[0]*this.cw[0]+values[1]*this.cw[1]+values[2]*this.cw[2])/100).toFixed(2))}
  async save(){if(this.busy)return;this.bad={};const ch:Array<{student_id:number;written_works:number;performance_tasks:number;exams:number}>=[];let invalid=0;
    for(const s of this.rows){const entry=this.entries[s.id];
      const values=[entry?.written_works,entry?.performance_tasks,entry?.exams];
      if(values.every(value=>value===null||value===undefined||value===''))continue;
      if(values.some(value=>value===null||value===undefined||value===''||!Number.isFinite(Number(value))
        ||Number(value)<0||Number(value)>100)){this.bad[s.id]=true;invalid++;continue}
      ch.push({student_id:s.id,written_works:Number(values[0]),performance_tasks:Number(values[1]),exams:Number(values[2])})}
    if(invalid){this.err=`${invalid} student(s) need valid scores in all three components (0 to 100).`;return this.ui.toast('Grades not saved – fix invalid scores.',
      'er')}this.err='';
    if(!ch.length)return this.ui.toast('Enter at least one score to save.','er');
    this.busy=true;
    if(!await this.ui.confirm('Save grades?',`Save Written Works, Performance Tasks, and Exams scores for ${ch.length} student(s) in ${this.term} (${this.subj}).`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{await this.d.saveGrades(this.subj,this.term,ch);
      this.load();this.ui.toast(`Grades saved for ${this.subj} (${this.term}).`)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Grades could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
