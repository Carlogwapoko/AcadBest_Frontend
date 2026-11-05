import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { ReqDetailComponent } from '../../../shared/components/req-detail/req-detail.component';
import { DataService,Req } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';


@Component({selector:'app-student-requests',standalone:true,imports:[COMMON,
  ReqDetailComponent],styleUrl:'./requests.component.css',templateUrl:'./requests.component.html'})
export class StudentRequestsComponent{
  tab='new';busy=false;sel:Req|null=null;e:any={};f:any=this.blank();
  page=1;lastPage=1;total=0;loading=false;loadError='';
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){void this.loadPage()}
  async loadPage(page=1){if(this.loading)return;this.loading=true;this.loadError='';
    try{const result=await this.d.loadRequests(page,'','All','All',10);this.page=result.current_page;
      this.lastPage=result.last_page;this.total=result.total}
    catch(error){this.loadError=(error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Your requests could not be loaded.')}
    finally{this.loading=false;this.cdr.markForCheck()}}
  refresh(){void this.loadPage(1)}
  blank(){return{type:'Select…',otherType:'',purpose:'',copies:1,need:'',rem:''}}
  get mine(){return this.d.requests}
  chip(s:string){return ({Pending:'wn',Approved:'ok','Ready for pick-up':'ok',
    Completed:'ok',Rejected:'er'} as any)[s]||''}
  reset(){this.f=this.blank();this.e={}}
  async submit(){if(this.busy)return;const f=this.f,c=+f.copies;
    const copiesValid=Number.isInteger(c)&&c>=1&&c<=5;
    const dateValid=/^\d{4}-\d{2}-\d{2}$/.test(f.need)&&!Number.isNaN(Date.parse(f.need));
    this.e={type:f.type=='Select…'?'Choose a request type.':'',purpose:f.purpose.trim().length<5?'Purpose is required (at least 5 characters).':f.purpose.trim().length>255?'Purpose cannot exceed 255 characters.':'',
      otherType:f.type==='Others'&&f.otherType.trim().length<3?'Describe your request (at least 3 characters).':
        f.type==='Others'&&f.otherType.trim().length>100?'Description cannot exceed 100 characters.':'',
      copies:copiesValid?'':'Copies must be a whole number between 1 and 5.',need:!f.need?'Date needed is required.':!dateValid?'Enter a valid date.':f.need<this.d.today?'Date cannot be in the past.':'',
      rem:f.rem.length>2000?'Remarks cannot exceed 2000 characters.':''};
    if(Object.values(this.e).some(x=>x))return this.ui.toast('Please fix the highlighted fields.','er');
    this.busy=true;
    const requestLabel=f.type==='Others'?`Others: ${f.otherType.trim()}`:f.type;
    if(!await this.ui.confirm('Submit this request?',`${requestLabel} · ${c} copy(ies) · needed ${f.need}.`,'Submit')){
      this.busy=false;this.cdr.markForCheck();return;
    }
    try{const id=await this.d.saveRequest({type:f.type,other_type:f.type==='Others'?f.otherType.trim():null,
      purpose:f.purpose.trim(),copies:c,
      date_needed:f.need,remarks:f.rem});
      this.reset();this.tab='my';this.ui.toast('Request '+id+' submitted. Status: Pending.');
      try{const result=await this.d.loadRequests(1,'','All','All',10);this.page=result.current_page;
        this.lastPage=result.last_page;this.total=result.total;this.loadError=''}
      catch(error){this.loadError=this.message(error);this.ui.toast('Request submitted, but the request list could not be refreshed. '+this.loadError,'er')}}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
  private message(error:unknown){return (error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error?.message
    ||Object.values((error as {error?:{errors?:Record<string,string[]>}})?.error?.errors||{}).flat()[0]
    ||(error instanceof Error?error.message:'Service request could not be submitted.')}
}
