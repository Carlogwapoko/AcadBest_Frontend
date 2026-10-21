import { ChangeDetectorRef,Component,HostListener } from '@angular/core';
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
    try{const result=await this.d.loadRequests(page,'','All','All',25,page>1);this.page=result.current_page;
      this.lastPage=result.last_page;this.total=result.total}
    catch(error){this.loadError=(error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Your requests could not be loaded.')}
    finally{this.loading=false;this.cdr.markForCheck()}}
  onListScroll(event:Event){const element=event.target as HTMLElement;
    if(element.scrollTop+element.clientHeight>=element.scrollHeight-80)this.loadNextPage()}
  @HostListener('window:scroll') onWindowScroll(){if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-300)this.loadNextPage()}
  private loadNextPage(){if(this.tab==='my'&&!this.loading&&this.page<this.lastPage)void this.loadPage(this.page+1)}
  blank(){return{type:'Select…',purpose:'',copies:1,need:'',rem:''}}
  get mine(){return this.d.requests}
  chip(s:string){return ({Pending:'wn',Approved:'ok','Ready for pick-up':'ok',
    Completed:'ok',Rejected:'er'} as any)[s]||''}
  reset(){this.f=this.blank();this.e={}}
  async submit(){if(this.busy)return;const f=this.f,c=+f.copies;
    this.e={type:f.type=='Select…'?'Choose a request type.':'',purpose:f.purpose.trim().length<5?'Purpose is required (at least 5 characters).':'',
      copies:c>=1&&c<=5?'':'Copies must be between 1 and 5.',need:!f.need?'Date needed is required.':f.need<this.d.today?'Date cannot be in the past.':''};
    if(Object.values(this.e).some(x=>x))return this.ui.toast('Please fix the highlighted fields.','er');
    this.busy=true;
    if(!await this.ui.confirm('Submit this request?',`${f.type} · ${c} copy(ies) · needed ${f.need}.`,'Submit')){
      this.busy=false;this.cdr.markForCheck();return;
    }
    try{const id=await this.d.saveRequest({type:f.type,purpose:f.purpose.trim(),copies:c,
      date_needed:f.need,remarks:f.rem});
      this.reset();this.tab='my';this.ui.toast('Request '+id+' submitted. Status: Pending.');
      try{const result=await this.d.loadRequests(1,'','All','All',25);this.page=result.current_page;
        this.lastPage=result.last_page;this.total=result.total;this.loadError=''}
      catch(error){this.loadError=this.message(error);this.ui.toast('Request submitted, but the request list could not be refreshed. '+this.loadError,'er')}}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
  private message(error:unknown){return (error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error?.message
    ||Object.values((error as {error?:{errors?:Record<string,string[]>}})?.error?.errors||{}).flat()[0]
    ||(error instanceof Error?error.message:'Service request could not be submitted.')}
}
