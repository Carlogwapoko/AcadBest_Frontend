import { Component,Input } from '@angular/core';
import { COMMON } from '../../common';
import { DataService,Req } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

/** Request details + (registrar only) approve / reject actions. */
@Component({selector:'app-req-detail',standalone:true,imports:[COMMON],styleUrl:'./req-detail.component.css',templateUrl:'./req-detail.component.html'})
export class ReqDetailComponent{
  @Input() r:Req|null=null;@Input() canAct=false;
  rejecting=false;reason='';err='';
  constructor(private ui:UiService,private data:DataService){}
  chip(s:string){return ({Pending:'wn',Processing:'wn',Approved:'ok','Ready for pick-up':'ok',
    Completed:'ok',Rejected:'er'} as any)[s]||''}
  statusIcon(s:string){return s==='Rejected'?'alert':s==='Pending'||s==='Processing'?'clock':'check'}
  close(){this.r=null;this.rejecting=false;this.reason='';this.err=''}
  async approve(){const r=this.r!;if(await this.ui.confirm('Approve request?',
    `${r.id} for ${r.by} will be set to “Approved”.`)){try{await this.data.updateRequest(r.id,'Approved');
      this.ui.toast(r.id+' approved.');this.close()}
      catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
        ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}}}
  async advance(status:string){const r=this.r!;
    if(!await this.ui.confirm('Update request?',`${r.id} for ${r.by} will be set to “${status}”.`))return;
    try{await this.data.updateRequest(r.id,status);this.ui.toast(r.id+' updated to '+status+'.');this.close()}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}}
  async reject(){const r=this.r!;this.err=this.reason.trim().length<5?'Please give a reason (at least 5 characters).':'';if(this.err)return;
    if(await this.ui.confirm('Reject request?',`${r.id} for ${r.by} will be rejected.`,
      'Reject',true)){try{await this.data.updateRequest(r.id,'Rejected',this.reason.trim());
        this.ui.toast(r.id+' rejected.');this.close()}
        catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
          ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}}}
}
