import { ChangeDetectorRef,Component,EventEmitter,Input,Output } from '@angular/core';
import { COMMON } from '../../common';
import { DataService,Req } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

/** Request details + (registrar only) approve / reject actions. */
@Component({selector:'app-req-detail',standalone:true,imports:[COMMON],styleUrl:'./req-detail.component.css',templateUrl:'./req-detail.component.html'})
export class ReqDetailComponent{
  @Input() r:Req|null=null;@Input() canAct=false;
  @Output() closed=new EventEmitter<void>();
  @Output() updated=new EventEmitter<void>();
  rejecting=false;reason='';err='';busy=false;
  constructor(private ui:UiService,private data:DataService,private cdr:ChangeDetectorRef){}
  chip(s:string){return ({Pending:'wn',Processing:'wn',Approved:'ok','Ready for pick-up':'ok',
    Completed:'ok',Rejected:'er'} as any)[s]||''}
  statusIcon(s:string){return s==='Rejected'?'alert':s==='Pending'||s==='Processing'?'clock':'check'}
  close(force=false){if(this.busy&&!force)return;this.r=null;this.rejecting=false;this.reason='';this.err='';this.closed.emit()}
  async approve(){if(this.busy||!this.r)return;const r=this.r!;this.busy=true;
    if(!await this.ui.confirm('Approve request?',
      `${r.id} for ${r.by} will be set to “Approved”.`)){this.busy=false;this.cdr.markForCheck();return}
    try{await this.data.updateRequest(r.id,'Approved');
      this.ui.toast(r.id+' approved.');this.updated.emit();this.close(true)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
  async advance(status:string){if(this.busy||!this.r)return;const r=this.r!;this.busy=true;
    if(!await this.ui.confirm('Update request?',`${r.id} for ${r.by} will be set to “${status}”.`)){this.busy=false;this.cdr.markForCheck();return}
    try{await this.data.updateRequest(r.id,status);this.ui.toast(r.id+' updated to '+status+'.');
      this.updated.emit();this.close(true)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
  async reject(){if(this.busy||!this.r)return;const r=this.r!;this.err=this.reason.trim().length<5?'Please give a reason (at least 5 characters).':'';if(this.err)return;
    this.busy=true;
    if(!await this.ui.confirm('Reject request?',`${r.id} for ${r.by} will be rejected.`,
      'Reject',true)){this.busy=false;this.cdr.markForCheck();return}
    try{await this.data.updateRequest(r.id,'Rejected',this.reason.trim());
      this.ui.toast(r.id+' rejected.');this.updated.emit();this.close(true)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Request could not be updated.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
