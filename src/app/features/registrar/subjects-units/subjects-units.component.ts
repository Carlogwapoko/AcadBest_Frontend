import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,FacultyAssignment,Student } from '../../../core/data.service';
import { Subject } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { AssignLoadComponent } from '../components/assign-load/assign-load.component';
import { ENROLLMENT_PROGRAMS, majorsForProgram } from '../../../shared/program-catalog';

// ------------------------------------------------------------ Subjects & Units (subjects, faculty loads, student loads)
@Component({selector:'app-subjects-units',standalone:true,imports:[COMMON,AssignLoadComponent],
  styleUrl:'./subjects-units.component.css',templateUrl:'./subjects-units.component.html'})
export class SubjectsUnitsComponent{
  tab='s';sm:any=null;fm:any=null;e:any={};stu:Student|null=null;busy=false;actionBusy=false;deleting='';
  programFilter='All';semesterFilter='All';yearLevelFilter='All';facultySearch='';studentSearch='';
  facultyProgramFilter='All';facultyMajorFilter='All';
  facultySemester='1st Semester';facultyAcademicYear='';facultySection='All';
  studentSemesterFilter='All';studentAcademicYearFilter='All';
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){
  }
  selectTab(tab:string){this.tab=tab}
  get visibleSubjects(){return this.d.subjectList.filter(s=>
    (this.programFilter==='All'||s.p===this.programFilter||s.p==='All')
    &&(this.semesterFilter==='All'||s.semester===this.semesterFilter)
    &&(this.yearLevelFilter==='All'||s.y==='All'||String(s.y)===this.yearLevelFilter))}
  get programs():string[]{return ['All',...ENROLLMENT_PROGRAMS]}
  majorsFor(program:string):string[]{return majorsForProgram(program)}
  programChanged(){this.sm.major=''}
  facultyProgramChanged(){
    this.facultyMajorFilter='All';
  }
  get semesters(){return ['All','1st Semester','2nd Semester','Summer']}
  get loadSemesters(){return ['1st Semester','2nd Semester','Summer']}
  get academicYears(){return [...new Set([
    this.d.currentAcademicYear,
    ...this.d.subjectList.map(subject=>subject.academic_year||''),
    ...this.d.eligibleEnrollments.map(student=>student.academic_year||''),
  ].filter(Boolean))].sort().reverse()}
  get facultySections(){return ['All','A','B']}
  get studentSemesters(){return ['All',...new Set(this.d.eligibleEnrollments.map(student=>student.semester||'').filter(Boolean))]}
  get studentAcademicYears(){return ['All',...new Set(this.d.eligibleEnrollments.map(student=>student.academic_year||'').filter(Boolean))]}
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
  get facultySessions(){return ['Afternoon','Evening','Weekends']}
  get facultySessionOptions(){return [...this.facultySessions,'All']}
  otherFacultyNames(subject:Subject,facultyId:number){
    const assigned=(subject.faculty_assignments||[]).filter(assignment=>
      assignment.faculty_id!==facultyId
      &&assignment.semester===this.fm?.semester
      &&assignment.academic_year===this.fm?.academic_year
      &&(this.fm?.section==='All'||assignment.section==='All'||assignment.section===this.fm?.section))
      .map(assignment=>assignment.faculty_id);
    return this.d.facultyNames([...new Set(assigned)])
  }
  count(c:string){return this.d.eligibleEnrollments.filter(s=>
    s.semester===this.fm?.semester&&s.academic_year===this.fm?.academic_year
    &&(this.fm?.section==='All'||s.sec===this.fm?.section)
    &&this.d.codes(s).includes(c)).length}
  schedule(subject:Subject):string{
    const time=subject.start&&subject.end?`${subject.start}–${subject.end}`:subject.tm;
    return subject.d?`${subject.d}${time?` · ${time}`:''}`:time||'—'
  }
  openSub(code?:string){this.e={};const x=code?this.d.subjects[code]:{n:'',u:3,
    d:'',tm:'',start:null,end:null,r:'',p:'All',major:null,y:'All',f:null,
    semester:'1st Semester'};
    this.sm={isNew:!code,code:code||'',n:x.n,u:x.u,
      p:x.p,major:x.major||'',y:String(x.y),semester:x.semester||'1st Semester'}}
  async saveSub(){if(this.busy||!this.sm)return;const m=this.sm,c=m.code.trim().toUpperCase(),u=+m.u;
    const existingLegacyProgram=!m.isNew&&m.p==='ABSTM'&&this.d.subjects[c]?.p==='ABSTM';
    this.e={c:!/^[A-Z]{2,4}\d{3}$/.test(c)?'Use a code like IT305.':m.isNew&&this.d.subjects[c]?'This subject code already exists.':'',
      u:!Number.isInteger(u)||u<1||u>6?'Units must be a whole number from 1 to 6.':'',
      n:m.n.trim().length<3?'Subject name is required.':'',
      p:this.programs.includes(m.p)||existingLegacyProgram?'':'Select a valid program.',
      y:['All','1','2','3','4','11','12'].includes(String(m.y))?'':'Select a valid year level.',
      semester:['1st Semester','2nd Semester','Summer'].includes(m.semester)?'':'Select a semester.',
      major:this.majorsFor(m.p).length&&!this.majorsFor(m.p).includes(m.major)
        ?'Select a major for the selected program.':'',
      programChanged:!this.majorsFor(m.p).length&&m.major?'Choose a major that matches the selected program.':''};
    if(Object.values(this.e).some(x=>x))return;
    const previous=m.isNew?null:this.d.subjects[c];
    const subject:Subject={n:m.n.trim(),u,d:previous?.d||'',tm:previous?.tm||'',
      start:previous?.start||null,end:previous?.end||null,r:previous?.r||'',p:m.p,
      major:m.major||null,
      y:m.y=='All'?'All':+m.y,f:m.isNew?null:previous?.f??null,
      faculty_ids:m.isNew?[]:this.d.facultyIds(this.d.subjects[c]),semester:m.semester,
      academic_year:m.isNew?null:previous?.academic_year??null};
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
  openFac(u:any){const semester=this.facultySemester,academic_year=this.facultyAcademicYear||this.d.currentAcademicYear,section=this.facultySection;
    this.fm={u,picked:new Set(this.d.mySubjects(u.id,{semester,academic_year,section})),semester,
      academic_year,section,err:'',schedules:this.assignmentSchedules(u.id,{semester,academic_year,section})}}
  assignmentSchedules(id:number,scope:Pick<FacultyAssignment,'semester'|'academic_year'|'section'>){
    return Object.fromEntries(this.d.subjectList.map(subject=>{
      const current=this.d.facultyAssignments(subject).filter(item=>item.faculty_id===id
        &&item.semester===scope.semester&&item.academic_year===scope.academic_year&&item.section===scope.section);
      const schedules=current.length?current.map(item=>this.withSection({
        session:item.session||'All',
        days:item.days??subject.d,
        start_time:this.timeValue(item.start_time??subject.start),
        end_time:this.timeValue(item.end_time??subject.end),
        room:item.room??subject.r,
      },item.section??scope.section)):[this.withSection({
        session:this.facultySessions.includes(subject.session||'')?subject.session!:'Afternoon',
        days:subject.d,
        start_time:this.timeValue(subject.start),
        end_time:this.timeValue(subject.end),
        room:subject.r,
      },scope.section)];
      return [subject.code,schedules];
    }));
  }
  private withSection<T extends object>(schedule:T,section:string|null):T&{section:string|null}{
    Object.defineProperty(schedule,'section',{value:section,writable:true,enumerable:false});
    return schedule as T&{section:string|null};
  }
  private timeValue(value:string|null|undefined){return value?value.slice(0,5):null}
  facultyScopeChanged(){
    if(!this.fm)return;
    this.fm.picked=new Set(this.d.mySubjects(this.fm.u.id,{
      semester:this.fm.semester,
      academic_year:this.fm.academic_year,
      section:this.fm.section,
    }));
    this.fm.schedules=this.assignmentSchedules(this.fm.u.id,{
      semester:this.fm.semester,
      academic_year:this.fm.academic_year,
      section:this.fm.section,
    });
    this.fm.err='';
  }
  tog(c:string){const p=this.fm.picked;p.has(c)?p.delete(c):p.add(c)}
  get faculty(){
    const query=this.facultySearch.trim().toLocaleLowerCase();
    const terms=query.split(/\s+/).filter(Boolean);
    return this.d.faculty().filter(user=>{
      const searchable=[
        user.name,
        user.first_name,
        user.middle_name,
        user.last_name,
        [user.first_name,user.middle_name,user.last_name].filter(Boolean).join(' '),
      ].filter((value):value is string=>!!value)
        .join(' ')
        .toLocaleLowerCase();
      const matchesName=terms.every(term=>searchable.includes(term));
      const matchesProgram=this.facultyProgramFilter==='All'
        ||this.facultyCodes(user.id).length>0;
      return matchesName&&matchesProgram;
    });
  }
  get facultySubjectGroups(){
    const groups=new Map<string,Array<Subject&{code:string}>>();
    for(const subject of this.d.subjectList.filter(subject=>
      (this.facultyProgramFilter==='All'||subject.p===this.facultyProgramFilter||subject.p==='All')
      &&(this.facultyMajorFilter==='All'||subject.major===this.facultyMajorFilter)
      &&(!subject.semester||subject.semester===this.fm?.semester)
      &&(!subject.academic_year||subject.academic_year===this.fm?.academic_year))){
      const program=subject.p==='All'?'All programs':subject.p;
      const label=subject.major?`${program} · ${subject.major}`:program;
      groups.set(label,[...(groups.get(label)||[]),subject]);
    }
    return [...groups].map(([label,subjects])=>({label,subjects}));
  }
  get facultyMajors():string[]{
    return [...new Set(this.d.subjectList
      .filter(subject=>this.facultyProgramFilter==='All'
        ||subject.p===this.facultyProgramFilter
        ||subject.p==='All')
      .map(subject=>subject.major||'')
      .filter(Boolean))].sort();
  }
  facultyCodes(id:number){return this.d.mySubjects(id,{
    semester:this.facultySemester,
    academic_year:this.facultyAcademicYear||this.d.currentAcademicYear,
    section:this.facultySection,
  }).filter(code=>{
    const subject=this.d.subjects[code];
    return this.facultyProgramFilter==='All'
      ||subject.p===this.facultyProgramFilter
      ||subject.p==='All';
  }).filter(code=>this.facultyMajorFilter==='All'||this.d.subjects[code].major===this.facultyMajorFilter)}
  facultySchedules(id:number){
    const scope={semester:this.facultySemester,academic_year:this.facultyAcademicYear||this.d.currentAcademicYear,section:this.facultySection};
    return this.d.subjectList.flatMap(subject=>this.d.facultyAssignments(subject)
      .filter(item=>item.faculty_id===id&&item.semester===scope.semester
        &&item.academic_year===scope.academic_year
        &&(item.section===scope.section||(!item.section&&scope.section==='All')))
      .map(item=>({
        code:subject.code,
        assignment_id:item.id,
        session:item.session||'Afternoon',
        days:item.days??subject.d,
        start:this.timeValue(item.start_time??subject.start),
        end:this.timeValue(item.end_time??subject.end),
        room:item.room??subject.r,
      })));
  }
  addFacultySchedule(code:string){
    const schedules=this.fm?.schedules[code] as Array<{session:string;section:string|null;days:string;start_time:string|null;end_time:string|null;room:string}>|undefined;
    if(!schedules||schedules.length>=this.facultySessions.length)return;
    const session=this.facultySessions.find(value=>!schedules.some(schedule=>schedule.session===value));
    if(session)schedules.push({session,section:this.fm.section,days:'',start_time:null,end_time:null,room:''});
  }
  removeFacultySchedule(code:string,index:number){
    const schedules=this.fm?.schedules[code] as Array<unknown>|undefined;
    if(schedules&&schedules.length>1)schedules.splice(index,1);
  }
  async removeFacultySubject(user:any,code:string){
    if(this.actionBusy)return;
    const scope={semester:this.facultySemester,academic_year:this.facultyAcademicYear||this.d.currentAcademicYear,section:this.facultySection};
    const codes=this.d.mySubjects(user.id,scope).filter(subject=>subject!==code);
    if(!await this.ui.confirm('Remove subject assignment?',`${code} will be removed from ${user.name} for ${scope.section}, ${scope.semester}, ${scope.academic_year}.`,
      'Remove',true))return;
    this.actionBusy=true;
    try{
      const schedules=Object.fromEntries(this.facultySchedules(user.id)
        .filter(schedule=>codes.includes(schedule.code))
        .reduce((entries,schedule)=>{
          const current=entries.get(schedule.code)||[];
          current.push({
            session:schedule.session,
            days:schedule.days,
            start_time:schedule.start,
            end_time:schedule.end,
            room:schedule.room,
          });
          entries.set(schedule.code,current);
          return entries;
        },new Map<string,Array<{session:string;section?:string|null;days:string;start_time:string|null;end_time:string|null;room:string}>>()));
      await this.d.assignFaculty(user.id,codes,scope,schedules);
      this.ui.toast(`${code} removed from ${user.name}'s faculty load.`);
    }catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.actionBusy=false;this.cdr.markForCheck()}
  }
  get enrolledStudents(){const query=this.studentSearch.trim().toLowerCase();return this.d.eligibleEnrollments.filter(student=>
    student.enrollment_status==='Enrolled'
    &&(this.studentSemesterFilter==='All'||student.semester===this.studentSemesterFilter)
    &&(this.studentAcademicYearFilter==='All'||student.academic_year===this.studentAcademicYearFilter)
    &&(!query||[
      [student.first_name,student.middle_name,student.last_name].filter(Boolean).join(' ')||student.name,
      student.name,student.first_name,student.middle_name,student.last_name,student.school_id,
    ].some(value=>value?.toLowerCase().includes(query))))}
  async removeStudentSubject(student:Student,code:string){
    if(this.actionBusy)return;
    if(!student.enrollment_ref)return this.ui.toast('The approved enrollment record is unavailable.','er');
    const codes=this.d.codes(student).filter(subject=>subject!==code);
    if(!await this.ui.confirm('Remove subject from student load?',`${code} will be removed from ${student.name}'s current enrolled term. Existing grades will be kept.`,
      'Remove',true))return;
    this.actionBusy=true;
    try{
      await this.d.assignStudent(student.id,codes,student.enrollment_ref);
      this.ui.toast(`${code} removed from ${student.name}'s load.`);
    }catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.actionBusy=false;this.cdr.markForCheck()}
  }
  async saveFac(){if(this.actionBusy||!this.fm)return;const c=this.fmCodes,t=this.d.unitsOf(c),id=this.fm.u.id;this.fm.err='';
    this.actionBusy=true;
    if(!await this.ui.confirm('Save assignment?',`${this.fm.u.name} will handle ${c.length} subject(s) · ${t} units.`,
      'Save')){this.actionBusy=false;this.cdr.markForCheck();return}
    try{await this.d.assignFaculty(id,c,{semester:this.fm.semester,academic_year:this.fm.academic_year,section:this.fm.section},
      Object.fromEntries(c.map(code=>[code,this.fm.schedules[code]])));
      this.ui.toast('Subjects assigned to '+this.fm.u.name+'.');this.fm=null}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.actionBusy=false;this.cdr.detectChanges()}}
  private message(error:unknown){return (error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error?.message
    ||Object.values((error as {error?:{errors?:Record<string,string[]>}})?.error?.errors||{}).flat()[0]
    ||(error instanceof Error?error.message:'The change could not be saved.')}
}
