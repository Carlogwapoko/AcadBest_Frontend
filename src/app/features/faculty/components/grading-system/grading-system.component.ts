import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../../shared/common';
import { AuthService } from '../../../../core/auth.service';
import { DataService } from '../../../../core/data.service';
import { Subject } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';

/** Per-subject grading system editor – only the assigned instructor can change it. */
@Component({selector:'app-grading-system',standalone:true,imports:[COMMON],styleUrl:'./grading-system.component.css',templateUrl:'./grading-system.component.html'})
export class GradingSystemComponent{
  code='';w:number[]=[30,30,40];cw:number[]=[30,50,20];e:string[]=['','',''];ce:string[]=['','',''];err='';busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef){}
  get total(){return this.w.reduce((s,x)=>s+(+x||0),0)}
  get componentTotal(){return this.cw.reduce((s,x)=>s+(+x||0),0)}
  open(c:string){if(this.d.subjects[c].f!=this.a.user!.id)return this.ui.toast('Only the assigned instructor can edit this grading system.',
    'er');this.code=c;this.w=[...this.d.subjects[c].w];this.cw=[...this.d.subjects[c].cw];
    this.e=['','',''];this.ce=['','',''];this.err='';this.cdr.markForCheck()}
  async save(){if(this.busy||!this.code)return;
    this.e=this.w.map(x=>x===null||isNaN(+x)||+x<0||+x>100?'Enter 0 to 100.':'');
    this.ce=this.cw.map(x=>x===null||isNaN(+x)||+x<0||+x>100?'Enter 0 to 100.':'');
    if(this.e.some(x=>x)||this.ce.some(x=>x))return;
    if(this.total!=100||this.componentTotal!=100){this.err=`Both period and component weights must total exactly 100% (periods: ${this.total}%, components: ${this.componentTotal}%).`;return this.ui.toast('Grading system not saved.',
      'er')}this.err='';
    const c=this.code,n=this.d.students.filter(s=>c in s.g).length;
    if(!await this.ui.confirm('Save grading system?',`${c} will use period weights Prelim ${this.w[0]}% · Midterm ${this.w[1]}% · Final ${this.w[2]}%, with Written Works ${this.cw[0]}% · Performance Tasks ${this.cw[1]}% · Exams ${this.cw[2]}% per period. Averages of ${n} student(s) will be recalculated.`,
      'Save'))return;
    this.busy=true;
    try{const subject=this.d.subjects[c];await this.d.saveSubject(c,{...subject,w:this.w.map(Number),cw:this.cw.map(Number)} as Subject);
        this.code='';this.ui.toast('Grading system updated for '+c+'.')}
      catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
        ||(error instanceof Error?error.message:'Grading system could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
