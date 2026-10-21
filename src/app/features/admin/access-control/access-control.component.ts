import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,ROLE_NAME } from '../../../core/data.service';
import { Mod,MODS,SCOPE } from '../../../core/modules';
import { UiService } from '../../../core/ui.service';

/** Limit access to modules and records by role. Disabled modules disappear from the sidebar and are blocked by moduleGuard. */
@Component({selector:'app-access-control',standalone:true,imports:[COMMON],styleUrl:'./access-control.component.css',templateUrl:'./access-control.component.html'})
export class AccessControlComponent{
  mods=MODS;scope=SCOPE;roleName=ROLE_NAME;
  busy=new Set<string>();
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  on(m:Mod){return this.d.moduleOn(m.role,m.key)}
  async toggle(m:Mod){const key=`${m.role}:${m.key}`;if(this.busy.has(key))return;const on=this.on(m);
    this.busy.add(key);
    if(!await this.ui.confirm((on?'Disable':'Enable')+' module?',`${on?'Remove':'Grant'} access to “${m.label}” for ${ROLE_NAME[m.role]}?`,
      on?'Disable':'Enable',on)){this.busy.delete(key);this.cdr.markForCheck();return}
    try{await this.d.setModule(m.role,m.key,!on);
      this.ui.toast(`${m.label} ${on?'disabled':'enabled'} for ${ROLE_NAME[m.role]}.`)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Module access could not be updated.'),'er')}
    finally{this.busy.delete(key);this.cdr.markForCheck()}}
}
