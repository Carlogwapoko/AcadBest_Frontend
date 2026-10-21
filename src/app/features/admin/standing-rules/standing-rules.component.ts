import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';


@Component({selector:'app-standing-rules',standalone:true,imports:[COMMON],styleUrl:'./standing-rules.component.css',templateUrl:'./standing-rules.component.html'})
export class StandingRulesComponent{
  pass:any;safe:any;e:any={};busy=false;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){this.reset()}
  reset(){this.pass=this.d.rules.pass;this.safe=this.d.rules.safe;this.e={}}
  async save(){if(this.busy)return;const p=+this.pass,s=+this.safe;
    this.e={p:this.pass===''||this.pass===null?'Required.':isNaN(p)||p<50||p>95?'Enter a value from 50 to 95.':'',
      s:this.safe===''||this.safe===null?'Required.':isNaN(s)||s>100?'Maximum is 100.':s<=p?'Must be higher than the passing grade.':''};
    if(this.e.p||this.e.s)return this.ui.toast('Rules not saved – fix errors.','er');
    this.busy=true;
    if(!await this.ui.confirm('Save standing rules?',`Passing ${p}, Good Standing ${s}. Standing and at-risk lists will update for all users.`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{await this.d.saveRules(p,s);this.ui.toast('Standing rules saved.')}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Standing rules could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
