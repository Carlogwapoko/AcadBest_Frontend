import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AnnListComponent } from '../../../shared/components/ann-list/ann-list.component';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { ENROLLMENT_PROGRAMS } from '../../../shared/program-catalog';

// ------------------------------------------------------------ Post Announcement
@Component({selector:'app-post-announcement',standalone:true,imports:[COMMON,
  AnnListComponent],styleUrl:'./post-announcement.component.css',templateUrl:'./post-announcement.component.html'})
export class PostAnnouncementComponent{
  readonly programs=ENROLLMENT_PROGRAMS;
  f:any;e:any={};busy=false;
  get showStudentTargeting(){return this.f.audience!=='faculty'}
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef){
    this.f=this.blank();
    void this.d.load().then(()=>this.cdr.detectChanges(),()=>this.cdr.detectChanges());
  }
  blank(){return{t:'',m:'',audience:'all_users',category:'General',prog:['All Programs'],yr:['All Years'],
    sec:['All Sections'],dt:this.d.today,end:''}}
  reset(){this.f=this.blank();this.e={}}
  valid(){const f=this.f;this.e={t:f.t.trim().length<5?'Title is required (min 5 characters).':'',
    m:f.m.trim().length<15?'Message is required (min 15 characters).':'',dt:!f.dt?'Publish date is required.':f.dt<this.d.today?'Publish date cannot be in the past.':'',
    end:f.end&&f.end<f.dt?'Valid-until must be on or after the publish date.':''};
    return !Object.values(this.e).some(x=>x)}
  normalizeTarget(field:'prog'|'yr'|'sec',values:string[]){
    const all={prog:'All Programs',yr:'All Years',sec:'All Sections'}[field];
    this.f[field]=values.length===0||values.includes(all)?[all]:values;
  }
  build(){const f=this.f,facultyAudience=f.audience==='faculty',
    programs=Array.isArray(f.prog)?f.prog:[f.prog],
    years=Array.isArray(f.yr)?f.yr:[f.yr],
    sections=Array.isArray(f.sec)?f.sec:[f.sec],
    p=facultyAudience||programs.includes('All Programs')?['All']:programs,
    y=facultyAudience||years.includes('All Years')?['All']:years.map((value:string)=>+value),
    s=facultyAudience||sections.includes('All Sections')?['All']:sections;
    const pValue=p.length===1?p[0]:p;
    const yValue=y.length===1?y[0]:y;
    const sValue=s.length===1?s[0]:s;
    const audienceLabels:Record<string,string>={all_users:'All Users',students:'Students Only',
      faculty:'Faculty Only'};
    return{t:f.t.trim(),m:f.m.trim(),aud:audienceLabels[f.audience],audience:f.audience,category:f.category,
      priority:['Important','Urgent'].includes(f.category)?'High':'Normal',
      audienceText:[audienceLabels[f.audience],p[0]=='All'?'':p.join(', '),
      y[0]=='All'?'':y.map((value:number)=>this.d.yearLevelLabel(value)).join(', '),
      s[0]=='All'?'':'Sec '+s.join(', ')].filter(Boolean).join(' · '),prog:pValue,
      yr:yValue,sec:sValue,dt:f.dt,end:f.end,
      by:this.a.user!.name,d:new Date(f.dt+'T00:00').toLocaleDateString('en',
      {month:'short',day:'2-digit'})}}
  async publish(){if(this.busy||!this.valid())return this.ui.toast('Please fix the highlighted fields.','er');const a=this.build();
    this.busy=true;
    if(!await this.ui.confirm('Publish announcement?',`“${a.t}” will be sent to: ${a.audienceText} on ${a.dt}.`,
      'Publish')){this.busy=false;this.cdr.detectChanges();return}
    try{await this.d.saveAnnouncement({title:a.t,message:a.m,priority:a.priority,publish_date:a.dt,
      valid_until:a.end||null,audience:a.audience,category:a.category,program:a.prog,
      year_level:a.yr,section:a.sec},this.a.user?.name);
      this.reset();this.ui.toast('Announcement published.')}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.detectChanges()}}
  private message(error:unknown){const value=(error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error;
    return value?.errors?Object.values(value.errors).flat()[0]:value?.message
    ||(error instanceof Error?error.message:'Announcement could not be published.')}
}
