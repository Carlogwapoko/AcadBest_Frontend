import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { ReqDetailComponent } from '../../../shared/components/req-detail/req-detail.component';
import { DataService,Req } from '../../../core/data.service';

@Component({selector:'app-request-queue',standalone:true,imports:[COMMON,ReqDetailComponent],
  styleUrl:'./request-queue.component.css',templateUrl:'./request-queue.component.html'})
export class RequestQueueComponent{
  q='';st='All';ty='All';sel:Req|null=null;statuses=['All','Pending',
    'Approved','Ready for pick-up','Completed','No Release'];
  page=1;lastPage=1;total=0;loading=false;loadError='';private searchTimer?:ReturnType<typeof setTimeout>;
  constructor(public d:DataService,private cdr:ChangeDetectorRef){}
  ngOnInit(){void this.loadPage()}
  ngOnDestroy(){if(this.searchTimer)clearTimeout(this.searchTimer)}
  async loadPage(page=1){if(this.loading)return;this.loading=true;this.loadError='';
    try{const result=await this.d.loadRequests(page,this.q,this.st==='No Release'?'Rejected':this.st,this.ty,10);
      this.page=result.current_page;this.lastPage=result.last_page;this.total=result.total}
    catch(error){this.loadError=this.message(error)}
    finally{this.loading=false;this.cdr.markForCheck()}}
  searchChanged(){if(this.searchTimer)clearTimeout(this.searchTimer);
    this.searchTimer=setTimeout(()=>void this.loadPage(1),300)}
  filtersChanged(){void this.loadPage(1)}
  chip(s:string){return ({Pending:'wn',Approved:'ok','Ready for pick-up':'ok',
    Completed:'ok',Rejected:'er','No Release':'er'} as any)[s]||''}
  statusLabel(s:string){return s==='Rejected'?'No Release':s}
  statusIcon(s:string){return s==='Rejected'||s==='No Release'?'alert':s==='Pending'||s==='Processing'?'clock':'check'}
  get list(){return this.d.requests}
  refreshAfterAction(){void this.loadPage(1)}
  private message(error:unknown){return (error as {error?:{message?:string}})?.error?.message
    ||(error instanceof Error?error.message:'Requests could not be loaded.')}
}
