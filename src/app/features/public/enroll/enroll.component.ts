import { ChangeDetectorRef,Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

// ---------------------------------------------------------------- Online enrollment application
@Component({selector:'app-enroll',standalone:true,imports:[COMMON,RouterLink],styleUrl:'./enroll.component.css',templateUrl:'./enroll.component.html'})
export class EnrollComponent{
  f:any={fn:'',mn:'',ln:'',dob:'',sex:'Select…',em:'',ph:'',ad:'',pr:'Select…',yr:'Select…',
    session:'Select…',ty:'Select…',sc:'',gn:'',gp:'',ok:false};
  e:any={};busy=false;done=false;ref='';
  constructor(private d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  blank(){return{fn:'',mn:'',ln:'',dob:'',sex:'Select…',em:'',ph:'',ad:'',pr:'Select…',yr:'Select…',
    session:'Select…',ty:'Select…',sc:'',gn:'',gp:'',ok:false}}
  async submit(){if(this.busy||this.done)return;const f=this.f,ph=/^[0-9 +]{10,15}$/,pk=(v:string)=>v=='Select…'?'Please select an option.':'';
    this.e={fn:f.fn.trim().length<2?'First name is required.':'',ln:f.ln.trim().length<2?'Last name is required.':'',
      dob:!f.dob?'Date of birth is required.':f.dob>=this.d.today?'Enter a valid date of birth.':'',sex:pk(f.sex),
      em:/^\S+@\S+\.\S+$/.test(f.em)?'':'Enter a valid e-mail address.',ph:ph.test(f.ph)?'':'Enter a valid mobile number.',
        ad:f.ad.trim().length<5?'Home address is required.':'',pr:pk(f.pr),yr:pk(f.yr),
        session:pk(f.session),ty:pk(f.ty),
      sc:f.sc.trim().length<3?'Last school attended is required.':'',gn:f.gn.trim().length<3?'Guardian name is required.':'',
        gp:ph.test(f.gp)?'':'Enter a valid contact number.',ok:f.ok?'':'You must certify your information.'};
    if(Object.values(this.e).some(x=>x))return this.ui.toast('Please fix the highlighted fields.','er');
    this.busy=true;
    if(!await this.ui.confirm('Submit application?','Please make sure your details are correct. The registrar will review your application.',
      'Submit')){this.busy=false;this.cdr.markForCheck();return}
    try{
      this.ref=await this.d.submitEnrollment({name:[f.fn,f.ln].map((name:string)=>name.trim()).filter(Boolean).join(' '),
        middle_name:f.mn.trim(),
        email:f.em.trim().toLowerCase(),phone:f.ph,date_of_birth:f.dob,sex:f.sex,address:f.ad.trim(),
        program:f.pr,year_level:+f.yr,session:f.session,application_type:f.ty,previous_school:f.sc.trim(),
        guardian_name:f.gn.trim(),guardian_phone:f.gp,certified:f.ok});
      this.f=this.blank();this.e={};this.done=true;this.ui.toast('Application submitted.');
    }catch(error){
      this.ui.toast(this.message(error),'er');
    }finally{this.busy=false;this.cdr.markForCheck()}
  }
  private message(error:unknown){
    const value=(error as {error?:{message?:string}})?.error?.message;
    return value||(error instanceof Error?error.message:'The application could not be submitted.');
  }
}
