import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,Enr,Student } from '../../../core/data.service';
import { Subject } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { AssignLoadComponent } from '../components/assign-load/assign-load.component';

// ------------------------------------------------------------ Subjects & Units (subjects, faculty loads, student loads)
@Component({selector:'app-subjects-units',standalone:true,imports:[COMMON,AssignLoadComponent],
  styleUrl:'./subjects-units.component.css',templateUrl:'./subjects-units.component.html'})
export class SubjectsUnitsComponent{
  tab='s';sm:any=null;fm:any=null;e:any={};stu:Student|null=null;app:Enr|null=null;busy=false;days=['Mon/Wed',
    'Tue/Thu','Mon/Wed/Fri','Fri','Sat'];
  loadingApplicants=false;private applicantsLoaded=false;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){
  }
  async selectTab(tab:string){this.tab=tab;if(tab!=='l'||this.applicantsLoaded||this.loadingApplicants)return;
    this.loadingApplicants=true;
    try{await this.d.loadEnrollments(1,'','All',50);this.applicantsLoaded=true}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.loadingApplicants=false;this.cdr.detectChanges()}}
  get applicants(){return this.d.enrollments.filter(e=>e.st!='Rejected'&&!e.acct)}
  get fmCodes(){return [...this.fm.picked]}
  count(c:string){return this.d.students.filter(s=>c in s.g).length}
  openSub(code?:string){this.e={};const x=code?this.d.subjects[code]:{n:'',u:3,
    d:'Mon/Wed',tm:'',start:'',end:'',r:'',p:'All',y:'All',w:[30,30,40],cw:[30,50,20],f:null};
    this.sm={isNew:!code,code:code||'',n:x.n,u:x.u,d:x.d,start:x.start||'',end:x.end||'',
      r:x.r,p:x.p,y:String(x.y)}}
  async saveSub(){if(this.busy||!this.sm)return;const m=this.sm,c=m.code.trim().toUpperCase(),u=+m.u;
    this.e={c:!/^[A-Z]{2,4}\d{3}$/.test(c)?'Use a code like IT305.':m.isNew&&this.d.subjects[c]?'This subject code already exists.':'',
      u:!Number.isInteger(u)||u<1||u>6?'Units must be a whole number from 1 to 6.':'',
      n:m.n.trim().length<3?'Subject name is required.':'',
      start:/^\d{2}:\d{2}$/.test(m.start)?'':'Choose a valid start time.',
      end:/^\d{2}:\d{2}$/.test(m.end)?'':'Choose a valid end time.',
      range:/^\d{2}:\d{2}$/.test(m.start)&&/^\d{2}:\d{2}$/.test(m.end)&&m.end>m.start?'':'End time must be later than start time.',
        r:m.r.trim()?'':'Room is required.'};
    if(Object.values(this.e).some(x=>x))return;
    const subject:Subject={n:m.n.trim(),u,d:m.d,tm:`${m.start}–${m.end}`,start:m.start,end:m.end,r:m.r.trim(),p:m.p,
      y:m.y=='All'?'All':+m.y,w:m.isNew?[30,30,40]:this.d.subjects[c].w,
      cw:m.isNew?[30,50,20]:this.d.subjects[c].cw,f:m.isNew?null:this.d.subjects[c].f};
    this.busy=true;
    try{await this.d.saveSubject(c,subject);this.ui.toast(m.isNew?`${c} added to the subject list.`:`${c} updated.`);this.sm=null}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.detectChanges()}}
  async del(c:string){if(this.count(c)||this.d.enrollments.some(e=>(e.subs||[]).includes(c)))return this.ui.toast(`${c} is assigned to students. Remove it from their loads first.`,
    'er');
    if(await this.ui.confirm('Delete subject?',`${c} – ${this.d.subjects[c].n} will be removed from the subject list.`,
      'Delete',true)){try{await this.d.deleteSubject(c);this.ui.toast(c+' deleted.')}
      catch(error){this.ui.toast(this.message(error),'er')}}}
  openFac(u:any){this.fm={u,picked:new Set(this.d.mySubjects(u.id)),err:''}}
  tog(c:string){const p=this.fm.picked;p.has(c)?p.delete(c):p.add(c)}
  async saveFac(){const c=this.fmCodes,t=this.d.unitsOf(c),id=this.fm.u.id;this.fm.err=t>24?`Maximum teaching load is 24 units (currently ${t}).`:this.d.clash(c);if(this.fm.err)return this.ui.toast('Assignment not saved.',
    'er');
    const mv=c.filter(x=>this.d.subjects[x].f&&this.d.subjects[x].f!=id);
    if(!await this.ui.confirm('Save assignment?',`${this.fm.u.name} will handle ${c.length} subject(s) · ${t} units.`+(mv.length?` ${mv.join(', ')} will be moved from other instructors.`:''),
      'Save'))return;
    try{await this.d.assignFaculty(id,c);this.ui.toast('Subjects assigned to '+this.fm.u.name+'.');this.fm=null}
    catch(error){this.ui.toast(this.message(error),'er')}}
  private message(error:unknown){return (error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error?.message
    ||Object.values((error as {error?:{errors?:Record<string,string[]>}})?.error?.errors||{}).flat()[0]
    ||(error instanceof Error?error.message:'The change could not be saved.')}
}
