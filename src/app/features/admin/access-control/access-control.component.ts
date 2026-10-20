import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService,ROLE_NAME } from '../../../core/data.service';
import { Mod,MODS,SCOPE } from '../../../core/modules';
import { UiService } from '../../../core/ui.service';

/** Limit access to modules and records by role. Disabled modules disappear from the sidebar and are blocked by moduleGuard. */
@Component({selector:'app-access-control',standalone:true,imports:[COMMON],styleUrl:'./access-control.component.css',templateUrl:'./access-control.component.html'})
export class AccessControlComponent{
  mods=MODS;scope=SCOPE;roleName=ROLE_NAME;
  constructor(public d:DataService,private ui:UiService){}
  on(m:Mod){return this.d.moduleOn(m.role,m.key)}
  async toggle(m:Mod){const on=this.on(m);
    if(!await this.ui.confirm((on?'Disable':'Enable')+' module?',`${on?'Remove':'Grant'} access to “${m.label}” for ${ROLE_NAME[m.role]}?`,
      on?'Disable':'Enable',on))return;
    try{await this.d.setModule(m.role,m.key,!on);
      this.ui.toast(`${m.label} ${on?'disabled':'enabled'} for ${ROLE_NAME[m.role]}.`)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Module access could not be updated.'),'er')}}
}
