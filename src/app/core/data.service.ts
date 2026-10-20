import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { firstValueFrom,Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export type Role='student'|'faculty'|'registrar'|'admin';
export const ROLE_NAME:Record<Role,string>={student:'Student',faculty:'Faculty',
  registrar:'Registrar Staff',admin:'Admin'};
export const ROLE_KEY:Record<string,Role>={'Student':'student','Faculty':'faculty',
  'Registrar Staff':'registrar','Admin':'admin'};
export interface Subject{n:string;u:number;d:string;tm:string;start:string|null;end:string|null;r:string;p:string;y:string|number;w:number[];cw:number[];f:number|null}
export interface GradeComponents{written_works:number;performance_tasks:number;exams:number}
export interface Student{id:number;name:string;middle_name?:string;status?:string|null;prog:string;yr:number;sec:string;g:Record<string,(number|null)[]>;gc?:Record<string,(GradeComponents|null)[]>}
export interface User{id:number;name:string;middle_name?:string;email:string;role:string;act:boolean;phone:string;sid?:number;avatar?:string;prog?:string;yr?:number}
export interface Req{id:string;sid:number;by:string;type:string;purpose:string;copies:number;need:string;rem:string;st:string;log:string[][]}
export interface Ann{id:number;t:string;m:string;aud:string;pr:string;by:string;d:string;dt:string;end?:string;prog:string;yr:string|number;sec:string}
export interface Enr{ref:string;name:string;middle_name:string;email:string;phone:string;dob:string;sex:string;addr:string;prog:string;yr:number;session?:string|null;type:string;student_status:string;school:string;gname:string;gph:string;st:string;date:string;note:string;acct:boolean;subs?:string[];log:string[][]}
export interface Notif{id:number;sid:number;type:'grade'|'alert';t:string;m:string;d:string;read:boolean}
export interface Page<T>{data:T[];current_page:number;last_page:number;per_page:number;total:number}

@Injectable({providedIn:'root'})
export class DataService{
  today=new Date().toISOString().slice(0,10);
  rules={pass:75,safe:80};
  reqTypes=['Certificate of Enrollment','Transcript of Records','Good Moral Certificate','Clearance','Copy of Grades'];
  subjects:Record<string,Subject>={};
  students:Student[]=[];
  users:User[]=[];
  requests:Req[]=[];
  anns:Ann[]=[];
  enrollments:Enr[]=[];
  notifications:Notif[]=[];
  disabled=new Set<string>();
  loading=false;
  loadError='';
  pendingOperations=0;
  openRequestCount=0;
  private loadPromise:Promise<void>|null=null;
  private enrollmentLoads=new Map<string,Promise<Page<Enr>>>();
  private requestLoads=new Map<string,Promise<Page<Req>>>();
  private enrollmentPage=1;
  private enrollmentSearch='';
  private enrollmentStatus='All';
  private requestPage=1;
  private requestSearch='';
  private requestStatus='All';
  private requestType='All';
  private userPage=1;
  private userSearch='';
  private readOperations=new Map<number,Promise<void>>();
  private markAllPromise:Promise<void>|null=null;

  constructor(private http:HttpClient){}

  private async mutate<T>(request:Observable<T>):Promise<T>{
    this.pendingOperations++;
    try{return await firstValueFrom(request)}
    finally{this.pendingOperations--}
  }

  async load():Promise<void>{
    if(this.loadPromise)return this.loadPromise;
    this.loading=true;this.loadError='';
    this.loadPromise=(async()=>{
      try{
        const data=await firstValueFrom(this.http.get<Record<string,unknown>>(`${API_BASE_URL}/portal`));
        this.today=String(data['today']);
        this.rules=data['rules'] as {pass:number;safe:number};
        this.disabled=new Set(data['disabled'] as string[]);
        this.subjects=data['subjects'] as Record<string,Subject>;
        this.students=data['students'] as Student[];
        this.users=(data['users'] as Array<Record<string,unknown>>).map(x=>this.mapUser(x));
        this.anns=data['announcements'] as Ann[];
        this.openRequestCount=Number(data['open_request_count']||0);
        this.notifications=data['notifications'] as Notif[];
        this.reqTypes=data['requestTypes'] as string[];
      }catch(error){
        this.loadError='Portal data could not be loaded. Check your connection and try again.';
        throw error;
      }finally{this.loading=false;this.loadPromise=null}
    })();
    return this.loadPromise;
  }

  async usersList(page=this.userPage,search=this.userSearch,append=false):Promise<Page<User>>{
    this.userPage=page;this.userSearch=search;
    const params=new HttpParams().set('page',page).set('per_page',25).set('search',search);
    const result=await firstValueFrom(this.http.get<Page<Record<string,unknown>>>(`${API_BASE_URL}/users`,{params}));
    const mapped={...result,data:result.data.map(x=>this.mapUser(x))};
    this.users=append?[...this.users,...mapped.data]:mapped.data;
    return mapped;
  }
  loadEnrollments(page=1,search='',status='All',perPage=25,append=false):Promise<Page<Enr>>{
    this.enrollmentPage=page;this.enrollmentSearch=search;this.enrollmentStatus=status;
    const key=JSON.stringify([page,search,status,perPage,append]);
    const inFlight=this.enrollmentLoads.get(key);
    if(inFlight)return inFlight;
    const params=new HttpParams().set('page',page).set('per_page',perPage).set('search',search).set('status',status);
    const request=firstValueFrom(this.http.get<Page<Enr>>(`${API_BASE_URL}/enrollments`,{params}))
      .then(result=>{
        this.enrollments=append?[...this.enrollments,...result.data]:result.data;
        return result;
      }).finally(()=>this.enrollmentLoads.delete(key));
    this.enrollmentLoads.set(key,request);
    return request;
  }
  loadRequests(page=1,search='',status='All',type='All',perPage=25,append=false):Promise<Page<Req>>{
    this.requestPage=page;this.requestSearch=search;this.requestStatus=status;this.requestType=type;
    const key=JSON.stringify([page,search,status,type,perPage,append]);
    const inFlight=this.requestLoads.get(key);
    if(inFlight)return inFlight;
    const params=new HttpParams().set('page',page).set('per_page',perPage)
      .set('search',search).set('status',status).set('type',type);
    const request=firstValueFrom(this.http.get<Page<Req>>(`${API_BASE_URL}/requests`,{params}))
      .then(result=>{
        this.requests=append?[...this.requests,...result.data]:result.data;
        return result;
      }).finally(()=>this.requestLoads.delete(key));
    this.requestLoads.set(key,request);
    return request;
  }
  async saveUser(id:number|undefined,data:Record<string,unknown>):Promise<User>{
    const saved=await this.mutate(id
      ?this.http.put<Record<string,unknown>>(`${API_BASE_URL}/users/${id}`,data)
      :this.http.post<Record<string,unknown>>(`${API_BASE_URL}/users`,data));
    const user=this.mapUser(saved);
    const index=this.users.findIndex(x=>x.id===user.id);
    if(index<0)this.users.unshift(user);else this.users[index]=user;
    return user;
  }
  async deleteUser(id:number):Promise<void>{
    await this.mutate(this.http.delete<void>(`${API_BASE_URL}/users/${id}`));
    const sid=this.users.find(x=>x.id===id)?.sid;
    this.users=this.users.filter(x=>x.id!==id);
    if(sid)this.students=this.students.filter(x=>x.id!==sid);
  }
  async submitEnrollment(form:Record<string,unknown>):Promise<string>{
    const result=await this.mutate(this.http.post<{reference:string}>(`${API_BASE_URL}/enrollments`,form));
    return result.reference;
  }
  async trackEnrollment(reference:string,email:string):Promise<Enr>{
    return firstValueFrom(this.http.post<Enr>(`${API_BASE_URL}/enrollments/track`,{reference,email}));
  }
  async updateEnrollment(ref:string,status:string,note?:string):Promise<void>{
    const result=await this.mutate(this.http.put<{status:string;note?:string}>(`${API_BASE_URL}/enrollments/${encodeURIComponent(ref)}`,{status,note}));
    this.enrollments=this.enrollments.map(item=>item.ref===ref
      ?{...item,st:result.status,student_status:result.status==='Enrolled'?'New Student':'Applicant',
        note:result.note??item.note,log:[...item.log,[this.today,status]]}
      :item);
  }
  async saveApplicantSubjects(ref:string,codes:string[]):Promise<void>{
    await this.mutate(this.http.put(`${API_BASE_URL}/enrollments/${encodeURIComponent(ref)}`,{subjects:codes}));
    this.enrollments=this.enrollments.map(item=>item.ref===ref?{...item,subs:[...codes]}:item);
  }
  async saveRequest(data:Record<string,unknown>):Promise<string>{
    const result=await this.mutate(this.http.post<{reference:string}>(`${API_BASE_URL}/requests`,data));
    this.openRequestCount++;
    return result.reference;
  }
  async updateRequest(ref:string,status:string,remarks?:string):Promise<void>{
    await this.mutate(this.http.put(`${API_BASE_URL}/requests/${encodeURIComponent(ref)}`,{status,remarks}));
    this.requests=this.requests.map(item=>item.id===ref?{
      ...item,st:status,rem:remarks??item.rem,log:[...item.log,[this.today,status]],
    }:item);
  }
  async saveGrades(code:string,term:string,grades:Array<{student_id:number;written_works:number;performance_tasks:number;exams:number}>):Promise<void>{
    await this.mutate(this.http.put<void>(`${API_BASE_URL}/grades`,{subject_code:code,term,grades}));
    const termIndex=['Prelim','Midterm','Final'].indexOf(term);
    const weights=this.subjects[code]?.cw||[30,50,20];
    const changed=new Map(grades.map(grade=>[grade.student_id,{
      score:Number(((grade.written_works*weights[0]+grade.performance_tasks*weights[1]+grade.exams*weights[2])/100).toFixed(2)),
      components:{written_works:grade.written_works,performance_tasks:grade.performance_tasks,exams:grade.exams},
    }]));
    this.students=this.students.map(student=>{
      const grade=changed.get(student.id);
      if(grade===undefined)return student;
      const courseGrades={...student.g};
      const terms=[...(courseGrades[code]??[null,null,null])];
      terms[termIndex]=grade.score;
      courseGrades[code]=terms;
      const components={...(student.gc||{})};
      const componentTerms=[...(components[code]??[null,null,null])];
      componentTerms[termIndex]=grade.components;
      components[code]=componentTerms;
      return {...student,g:courseGrades,gc:components};
    });
  }
  async saveAnnouncement(data:Record<string,unknown>,authorName='Registrar'):Promise<void>{
    const result=await this.mutate(this.http.post<{id:number}>(`${API_BASE_URL}/announcements`,data));
    const publishDate=String(data['publish_date']);
    const yearLevel=String(data['year_level']??'All');
    const program=String(data['program']??'All');
    this.anns=[{
      id:result.id,t:String(data['title']),m:String(data['message']),
      aud:program==='All'?'All programs':program,pr:String(data['priority']),by:authorName,
      d:new Date(`${publishDate}T00:00:00`).toLocaleDateString('en',{month:'short',day:'2-digit'}),
      dt:publishDate,end:typeof data['valid_until']==='string'?data['valid_until']:undefined,
      prog:program,yr:yearLevel==='All'?'All':Number(yearLevel),sec:String(data['section']??'All'),
    },...this.anns];
  }
  async saveSubject(code:string,data:Subject):Promise<void>{
    const isUpdate=code in this.subjects;
    const payload={code,name:data.n,units:data.u,days:data.d,start_time:data.start,end_time:data.end,
      room:data.r,program:data.p,year_level:String(data.y),grade_weights:data.w,
      component_weights:data.cw||[30,50,20]};
    await this.mutate(this.http.request<void>(isUpdate?'put':'post',
      `${API_BASE_URL}/subjects${isUpdate?'/'+encodeURIComponent(code):''}`,{body:payload}));
    this.subjects={...this.subjects,[code]:data};
    if(isUpdate){
      this.students=this.students.map(student=>{
        const components=student.gc?.[code];
        if(!components)return student;
        const grades=[...(student.g[code]??[null,null,null])];
        components.forEach((value,index)=>{
          if(value)grades[index]=Number(((value.written_works*payload.component_weights[0]
            +value.performance_tasks*payload.component_weights[1]+value.exams*payload.component_weights[2])/100).toFixed(2));
        });
        return {...student,g:{...student.g,[code]:grades}};
      });
    }
  }
  async deleteSubject(code:string):Promise<void>{
    await this.mutate(this.http.delete(`${API_BASE_URL}/subjects/${encodeURIComponent(code)}`));
    const subjects={...this.subjects};delete subjects[code];this.subjects=subjects;
  }
  async assignFaculty(id:number,codes:string[]):Promise<void>{
    await this.mutate(this.http.put(`${API_BASE_URL}/faculty/${id}/subjects`,{codes}));
    const selected=new Set(codes);
    this.subjects=Object.fromEntries(Object.entries(this.subjects).map(([code,subject])=>[
      code,{...subject,f:selected.has(code)?id:subject.f===id?null:subject.f},
    ]));
  }
  async assignStudent(id:number,codes:string[]):Promise<void>{
    await this.mutate(this.http.put(`${API_BASE_URL}/students/${id}/subjects`,{codes}));
    const selected=new Set(codes);
    this.students=this.students.map(student=>{
      if(student.id!==id)return student;
      const g:Student['g']={};
      for(const code of selected)g[code]=student.g[code]??[null,null,null];
      const gc:Student['gc']={};
      for(const code of selected)if(student.gc?.[code])gc[code]=student.gc[code];
      return {...student,g,gc};
    });
  }
  async saveRules(pass:number,safe:number):Promise<void>{
    this.rules=await this.mutate(this.http.put<{pass:number;safe:number}>(`${API_BASE_URL}/settings/rules`,{pass,safe}));
  }
  async setModule(role:string,module:string,enabled:boolean):Promise<void>{
    await this.mutate(this.http.put(`${API_BASE_URL}/settings/modules`,{role,module,enabled}));
    const key=`${role}:${module}`;
    enabled?this.disabled.delete(key):this.disabled.add(key);
  }
  async markRead(id:number):Promise<void>{
    if(this.markAllPromise)return this.markAllPromise;
    const inFlight=this.readOperations.get(id);
    if(inFlight)return inFlight;
    const operation=(async()=>{
      await this.mutate(this.http.put(`${API_BASE_URL}/notifications/${id}/read`,{}));
      const item=this.notifications.find(x=>x.id===id);
      if(item)item.read=true;
    })().finally(()=>this.readOperations.delete(id));
    this.readOperations.set(id,operation);
    return operation;
  }
  async markAllRead(sid:number):Promise<void>{
    if(this.markAllPromise)return this.markAllPromise;
    const unreadIds=this.notifications.filter(item=>item.sid===sid&&!item.read).map(item=>item.id);
    if(!unreadIds.length)return;
    const previous=this.notifications.filter(item=>unreadIds.includes(item.id));
    this.notifications=this.notifications.map(item=>item.sid===sid?{...item,read:true}:item);
    this.markAllPromise=(async()=>{
      try{await this.mutate(this.http.put(`${API_BASE_URL}/notifications/read-all`,{}))}
      catch(error){
        const unread=new Set(unreadIds);
        this.notifications=this.notifications.map(item=>unread.has(item.id)
          ?{...item,read:previous.find(old=>old.id===item.id)?.read??item.read}:item);
        throw error;
      }finally{this.markAllPromise=null}
    })();
    return this.markAllPromise;
  }
  async sendAlert(studentId:number,title:string,message:string):Promise<void>{
    await this.mutate(this.http.post(`${API_BASE_URL}/notifications`,{student_id:studentId,title,message}));
  }

  unread(sid:number){return this.notifications.filter(n=>n.sid===sid&&!n.read).length}
  moduleOn(role:string,key:string){return !this.disabled.has(role+':'+key)}
  get subjectList(){return Object.entries(this.subjects).map(([code,s])=>({code,...s}))}
  codes(s:Student){return Object.keys(s.g)}
  avg(a:(number|null)[],code?:string){const W=(code&&this.subjects[code]?.w)||[30,30,40];let total=0,weight=0;
    a.forEach((v,i)=>{if(v!=null){total+=v*W[i];weight+=W[i]}});return weight?total/weight:null}
  gwa(s:Student){const values=Object.entries(s.g).map(([c,g])=>this.avg(g,c)).filter(x=>x!=null) as number[];
    return values.length?values.reduce((a,b)=>a+b)/values.length:null}
  standing(a:number|null):[string,string]{return a==null?['No Data','']:a>=this.rules.safe?['Good Standing',
    'ok']:a>=this.rules.pass?['At Risk','wn']:['Failing','er']}
  f1(x:number|null|undefined){return x==null?'—':x.toFixed(1)}
  unitsOf(c:string[]){return c.reduce((a,x)=>a+(this.subjects[x]?.u||0),0)}
  facName(id:number|null){return this.users.find(u=>u.id===id)?.name||'Unassigned'}
  faculty(){return this.users.filter(u=>u.role==='Faculty')}
  mySubjects(uid:number){return Object.keys(this.subjects).filter(c=>this.subjects[c].f===uid)}
  myStudents(uid:number){const mine=this.mySubjects(uid);return this.students.filter(s=>mine.some(c=>c in s.g))}
  atRisk(uid?:number){return (uid?this.myStudents(uid):this.students).filter(s=>{const a=this.gwa(s);
    return a!=null&&a<this.rules.safe}).sort((x,y)=>this.gwa(x)!-this.gwa(y)!)}
  annsFor(s:Student){return this.anns.filter(a=>(a.prog==='All'||a.prog===s.prog)
    &&(a.yr==='All'||a.yr===s.yr)&&(a.sec==='All'||a.sec===s.sec))}
  clash(c:string[]){for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const a=this.subjects[c[i]],b=this.subjects[c[j]];
    const overlaps=a?.start&&a.end&&b?.start&&b.end?a.start<b.end&&b.start<a.end:a?.tm===b?.tm;
    if(a&&b&&overlaps&&a.d.split('/').some(day=>b.d.split('/').includes(day)))
      return 'Schedule conflict: '+c[i]+' and '+c[j]+' meet at the same time.'}return ''}

  private mapUser(x:Record<string,unknown>):User{
    return {id:Number(x['id']),name:String(x['name']),middle_name:String(x['middle_name']??''),email:String(x['email']),role:String(x['role']),
      act:Boolean(x['active']??x['act']),phone:String(x['phone']??''),sid:x['student_id']?Number(x['student_id'])
        :x['sid']?Number(x['sid']):undefined,avatar:typeof x['avatar']==='string'?x['avatar']:undefined,
      prog:typeof x['program']==='string'?x['program']:undefined,
      yr:x['year_level']?Number(x['year_level']):undefined};
  }
}
