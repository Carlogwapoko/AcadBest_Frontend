import { ChangeDetectorRef,Component,HostListener } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,Enr } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { AssignLoadComponent } from '../components/assign-load/assign-load.component';

// ------------------------------------------------------------ Enrollment applications
@Component({selector:'app-enrollment',standalone:true,imports:[COMMON,AssignLoadComponent],
  styleUrl:'./enrollment.component.css',templateUrl:'./enrollment.component.html'})
export class EnrollmentComponent{
  q='';st='All';sel:Enr|null=null;loadFor:Enr|null=null;rejecting=false;reason='';err='';
  page=1;lastPage=1;total=0;loading=false;loadError='';busy=false;private searchTimer?:ReturnType<typeof setTimeout>;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){void this.loadPage()}
  ngOnDestroy(){if(this.searchTimer)clearTimeout(this.searchTimer)}
  async loadPage(page=1){if(this.loading&&page>this.page)return;this.loading=true;this.loadError='';
    try{const result=await this.d.loadEnrollments(page,this.q,this.st,25,page>1);
      this.page=result.current_page;this.lastPage=result.last_page;this.total=result.total}
    catch(error){this.loadError=this.message(error)}
    finally{this.loading=false;this.loadMoreIfNeeded();this.cdr.markForCheck()}}
  @HostListener('window:scroll') onWindowScroll(){this.loadMoreIfNeeded()}
  private loadMoreIfNeeded(){
    if(!this.loading&&this.page<this.lastPage
      &&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-300)
      void this.loadPage(this.page+1);
  }
  searchChanged(){if(this.searchTimer)clearTimeout(this.searchTimer);
    this.searchTimer=setTimeout(()=>void this.loadPage(1),300)}
  filtersChanged(){void this.loadPage(1)}
  chip(s:string){return ({Pending:'wn',Enrolled:'ok',Rejected:'er'} as any)[s]||''}
  statusIcon(s:string){return s==='Rejected'?'alert':s==='Pending'||s==='Under Review'?'clock':'check'}
  get list(){return this.d.enrollments}
  async set(s:string,note?:string){if(this.busy||!this.sel)return;const e=this.sel;this.busy=true;
    if(!await this.ui.confirm(s=='Enrolled'?'Approve enrollment?':'Update application?',
      `${e.name} will be marked “${s}”.`+(s=='Enrolled'?' The administrator can then issue the portal account.':''),
      'Confirm',s=='Rejected')){this.busy=false;this.cdr.markForCheck();return}
    try{await this.d.updateEnrollment(e.ref,s,note);
      await this.loadPage(this.page);
      this.ui.toast(`${e.ref} is now ${s}.`);
      this.sel=null;this.rejecting=false;this.reason='';this.err=''}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
  reject(){this.err=this.reason.trim().length<5?'Please give a reason (at least 5 characters).':'';if(!this.err)this.set('Rejected',
    this.reason.trim())}
  private message(error:unknown){return (error as {error?:{message?:string}})?.error?.message
    ||(error instanceof Error?error.message:'Application status could not be updated.')}
}
