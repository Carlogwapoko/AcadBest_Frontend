import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../../shared/common';
import { AuthService } from '../../../../core/auth.service';
import { DataService,Subject } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';

/** Per-subject grading system editor – only the assigned instructor can change it. */
@Component({selector:'app-grading-system',standalone:true,imports:[COMMON],styleUrl:'./grading-system.component.css',templateUrl:'./grading-system.component.html'})
export class GradingSystemComponent{
  code='';cw:number[]=[30,50,20];ce:string[]=['','',''];err='';busy=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef){}
  get componentTotal(){return this.cw.reduce((s,x)=>s+(+x||0),0)}
  open(c:string){if(this.d.subjects[c].f!=this.a.user!.id)return this.ui.toast('Only the assigned instructor can edit this grading system.',
    'er');this.code=c;this.cw=[...this.d.subjects[c].cw];
    this.ce=['','',''];this.err='';this.cdr.markForCheck()}
  async save(){if(this.busy||!this.code)return;
    this.ce=this.cw.map(x=>x===null||isNaN(+x)||+x<0||+x>100?'Enter 0 to 100.':'');
    if(this.ce.some(x=>x))return;
    if(this.componentTotal!=100){this.err=`Component weights must total exactly 100% (current total: ${this.componentTotal}%).`;return this.ui.toast('Grading system not saved.',
      'er')}this.err='';
    const c=this.code,n=this.d.students.filter(s=>c in s.g).length;
    this.busy=true;
    if(!await this.ui.confirm('Save grading system?',`${c} will use Written Works ${this.cw[0]}% · Performance Tasks ${this.cw[1]}% · Exams ${this.cw[2]}% in each selected term. Grades for ${n} student(s) will be recalculated.`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{const subject=this.d.subjects[c];await this.d.saveSubject(c,{...subject,cw:this.cw.map(Number)} as Subject);
        this.code='';this.ui.toast('Grading system updated for '+c+'.')}
      catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
        ||(error instanceof Error?error.message:'Grading system could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}}
}
