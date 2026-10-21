import { ChangeDetectorRef,Component,Input } from '@angular/core';
import { COMMON } from '../../../../shared/common';
import { DataService,Student } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';

@Component({selector:'app-risk-table',standalone:true,imports:[COMMON],styleUrl:'./risk-table.component.css',templateUrl:'./risk-table.component.html'})
export class RiskTableComponent{
  @Input() items:Student[]=[];@Input() loading=false;sel:Student|null=null;busy=false;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  async remind(){if(this.busy||!this.sel)return;this.busy=true;const student=this.sel;
    try{await this.d.sendAlert(student.id,'Advising reminder',
    'Your instructor asked you to meet for academic advising.');
    this.ui.toast('Reminder sent to '+student.name+'.');this.sel=null}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Reminder could not be sent.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
