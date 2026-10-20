import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AnnListComponent } from '../../../shared/components/ann-list/ann-list.component';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

// ------------------------------------------------------------ Post Announcement
@Component({selector:'app-post-announcement',standalone:true,imports:[COMMON,
  AnnListComponent],styleUrl:'./post-announcement.component.css',templateUrl:'./post-announcement.component.html'})
export class PostAnnouncementComponent{
  f:any;e:any={};busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef){
    this.f=this.blank();
    void this.d.load().then(()=>this.cdr.detectChanges(),()=>this.cdr.detectChanges());
  }
  blank(){return{t:'',m:'',prog:'All Programs',yr:'All Years',sec:'All Sections',dt:this.d.today,end:''}}
  reset(){this.f=this.blank();this.e={}}
  valid(){const f=this.f;this.e={t:f.t.trim().length<5?'Title is required (min 5 characters).':'',
    m:f.m.trim().length<15?'Message is required (min 15 characters).':'',dt:!f.dt?'Publish date is required.':f.dt<this.d.today?'Publish date cannot be in the past.':'',
    end:f.end&&f.end<f.dt?'Valid-until must be on or after the publish date.':''};return !Object.values(this.e).some(x=>x)}
  build(){const f=this.f,p=f.prog.startsWith('All')?'All':f.prog,y=f.yr.startsWith('All')?'All':+f.yr,
    s=f.sec.startsWith('All')?'All':f.sec;
    return{t:f.t.trim(),m:f.m.trim(),aud:[p=='All'?'All programs':p,
      y=='All'?'':'Year '+y,s=='All'?'':'Sec '+s].filter(Boolean).join(' · '),prog:p,
      yr:y,sec:s,pr:'Normal',dt:f.dt,end:f.end,by:this.a.user!.name,d:new Date(f.dt+'T00:00').toLocaleDateString('en',
      {month:'short',day:'2-digit'})}}
  async publish(){if(this.busy||!this.valid())return this.ui.toast('Please fix the highlighted fields.','er');const a=this.build();
    this.busy=true;
    if(!await this.ui.confirm('Publish announcement?',`“${a.t}” will be sent to: ${a.aud} on ${a.dt}.`,
      'Publish')){this.busy=false;this.cdr.detectChanges();return}
    try{await this.d.saveAnnouncement({title:a.t,message:a.m,priority:a.pr,publish_date:a.dt,
      valid_until:a.end||null,program:a.prog,year_level:String(a.yr),section:a.sec},this.a.user?.name);
      this.reset();this.ui.toast('Announcement published.')}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.detectChanges()}}
  private message(error:unknown){const value=(error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error;
    return value?.errors?Object.values(value.errors).flat()[0]:value?.message
    ||(error instanceof Error?error.message:'Announcement could not be published.')}
}
