import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,Student } from '../../../core/data.service';
import { Subject } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { AssignLoadComponent } from '../components/assign-load/assign-load.component';

// ------------------------------------------------------------ Subjects & Units (subjects, faculty loads, student loads)
@Component({selector:'app-subjects-units',standalone:true,imports:[COMMON,AssignLoadComponent],
  styleUrl:'./subjects-units.component.css',templateUrl:'./subjects-units.component.html'})
export class SubjectsUnitsComponent{
  tab='s';sm:any=null;fm:any=null;e:any={};stu:Student|null=null;busy=false;actionBusy=false;deleting='';
  programFilter='All';semesterFilter='All';yearLevelFilter='All';facultySearch='';studentSearch='';days=[
    'Mon/Wed','Tue/Thu','Fri','Sat','Sun'];
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){
  }
  selectTab(tab:string){this.tab=tab}
  get visibleSubjects(){return this.d.subjectList.filter(s=>
    (this.programFilter==='All'||s.p===this.programFilter||s.p==='All')
    &&(this.semesterFilter==='All'||s.semester===this.semesterFilter)
    &&(this.yearLevelFilter==='All'||s.y==='All'||String(s.y)===this.yearLevelFilter))}
  get programs(){return ['All','BSIT','BSBA','BSTM','BSED','BEED','BSMA','BSHM','TVL','BSE','STEM','ABM','HUMSS','GAS']}
  majorsFor(program:string):string[]{return ({
    BSBA:['Financial Management','Human Resources Management'],
    BSED:['Filipino','English','Mathematics'],
    TVL:['ICT – Computer Servicing','Home Economics','Automotive Servicing','Electricity Servicing'],
  } as Record<string,string[]>)[program]||[]}
  programChanged(){this.sm.major=''}
  get semesters(){return ['All','1st Semester','2nd Semester','Summer']}
  get yearLevels(){return[
    {value:'All',label:'All'},
    {value:'1',label:'1st Year'},
    {value:'2',label:'2nd Year'},
    {value:'3',label:'3rd Year'},
    {value:'4',label:'4th Year'},
    {value:'11',label:'Grade 11'},
    {value:'12',label:'Grade 12'},
  ]}
  get fmCodes(){return [...this.fm.picked]}
  count(c:string){return this.d.students.filter(s=>this.d.codes(s).includes(c)).length}
  openSub(code?:string){this.e={};const x=code?this.d.subjects[code]:{n:'',u:3,
    d:'Mon/Wed',tm:'',start:'',end:'',r:'',p:'All',major:null,y:'All',f:null,session:'All',
    semester:'1st Semester'};
    this.sm={isNew:!code,code:code||'',n:x.n,u:x.u,start:x.start||'',end:x.end||'',
      r:x.r,p:x.p,major:x.major||'',y:String(x.y),session:x.session||'All',semester:x.semester||'',
      d:this.days.includes(x.d)?x.d:''}}
  async saveSub(){if(this.busy||!this.sm)return;const m=this.sm,c=m.code.trim().toUpperCase(),u=+m.u;
    this.e={c:!/^[A-Z]{2,4}\d{3}$/.test(c)?'Use a code like IT305.':m.isNew&&this.d.subjects[c]?'This subject code already exists.':'',
      u:!Number.isInteger(u)||u<1||u>6?'Units must be a whole number from 1 to 6.':'',
      n:m.n.trim().length<3?'Subject name is required.':'',
      d:this.days.includes(m.d)?'':'Choose a supported days option.',
      start:/^\d{2}:\d{2}$/.test(m.start)?'':'Choose a valid start time.',
      end:/^\d{2}:\d{2}$/.test(m.end)?'':'Choose a valid end time.',
      range:/^\d{2}:\d{2}$/.test(m.start)&&/^\d{2}:\d{2}$/.test(m.end)&&m.end>m.start?'':'End time must be later than start time.',
        r:m.r.trim()?'':'Room is required.',
      major:this.majorsFor(m.p).length&&!this.majorsFor(m.p).includes(m.major)
        ?'Select a major for the selected program.':'',
      programChanged:!this.majorsFor(m.p).length&&m.major?'Choose a major that matches the selected program.':''};
    if(Object.values(this.e).some(x=>x))return;
    const subject:Subject={n:m.n.trim(),u,d:m.d,tm:`${m.start}–${m.end}`,start:m.start,end:m.end,r:m.r.trim(),p:m.p,
      major:m.major||null,
      y:m.y=='All'?'All':+m.y,f:m.isNew?null:this.d.subjects[c].f,session:m.session,semester:m.semester||null,
      ...(this.d.subjects[c]?.academic_year
        ? {academic_year:this.d.subjects[c].academic_year}
        : {})};
    this.busy=true;
    try{await this.d.saveSubject(c,subject);this.ui.toast(m.isNew?`${c} added to the subject list.`:`${c} updated.`);this.sm=null}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.detectChanges()}}
  async del(c:string){if(this.count(c)||this.d.enrollments.some(e=>(e.subs||[]).includes(c)))return this.ui.toast(`${c} is assigned to students. Remove it from their loads first.`,
    'er');
    if(this.deleting)return;
    this.deleting=c;
    if(!await this.ui.confirm('Delete subject?',`${c} – ${this.d.subjects[c].n} will be removed from the subject list.`,
      'Delete',true)){this.deleting='';this.cdr.markForCheck();return}
    try{await this.d.deleteSubject(c);this.ui.toast(c+' deleted.')}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.deleting='';this.cdr.markForCheck()}}
  openFac(u:any){this.fm={u,picked:new Set(this.d.mySubjects(u.id)),err:''}}
  tog(c:string){const p=this.fm.picked;p.has(c)?p.delete(c):p.add(c)}
  get faculty(){const query=this.facultySearch.trim().toLowerCase();return this.d.faculty().filter(user=>
    !query||[user.name,user.first_name,user.middle_name,user.last_name,user.email].some(value=>value?.toLowerCase().includes(query)))}
  get facultySubjectGroups(){
    const groups=new Map<string,Array<Subject&{code:string}>>();
    for(const subject of this.d.subjectList){
      const program=subject.p==='All'?'All programs':subject.p;
      const label=subject.major?`${program} · ${subject.major}`:program;
      groups.set(label,[...(groups.get(label)||[]),subject]);
    }
    return [...groups].map(([label,subjects])=>({label,subjects}));
  }
  get enrolledStudents(){const query=this.studentSearch.trim().toLowerCase();return this.d.students.filter(student=>
    student.enrollment_status==='Enrolled'&&(!query||[
      student.name,student.first_name,student.middle_name,student.last_name,student.school_id,student.prog,student.major,
    ].some(value=>value?.toLowerCase().includes(query))))}
  async saveFac(){if(this.actionBusy||!this.fm)return;const c=this.fmCodes,t=this.d.unitsOf(c),id=this.fm.u.id;this.fm.err=this.d.clash(c);if(this.fm.err)return this.ui.toast('Assignment not saved.',
    'er');
    const mv=c.filter(x=>this.d.subjects[x].f&&this.d.subjects[x].f!=id);
    this.actionBusy=true;
    if(!await this.ui.confirm('Save assignment?',`${this.fm.u.name} will handle ${c.length} subject(s) · ${t} units.`+(mv.length?` ${mv.join(', ')} will be moved from other instructors.`:''),
      'Save')){this.actionBusy=false;this.cdr.markForCheck();return}
    try{await this.d.assignFaculty(id,c);this.ui.toast('Subjects assigned to '+this.fm.u.name+'.');this.fm=null}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.actionBusy=false;this.cdr.detectChanges()}}
  private message(error:unknown){return (error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error?.message
    ||Object.values((error as {error?:{errors?:Record<string,string[]>}})?.error?.errors||{}).flat()[0]
    ||(error instanceof Error?error.message:'The change could not be saved.')}
}
