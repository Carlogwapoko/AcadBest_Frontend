import { ChangeDetectorRef,Component,EventEmitter,Input,Output } from '@angular/core';
import { COMMON } from '../../../../shared/common';
import { DataService } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';
import { fullName } from '../../../../shared/full-name';

// ------------------------------------------------------------ Assign subjects (students + applicants)
@Component({selector:'app-assign-load',standalone:true,imports:[COMMON],styleUrl:'./assign-load.component.css',templateUrl:'./assign-load.component.html'})
export class AssignLoadComponent{
  @Input() kind:'s'|'e'='s';@Output() closed=new EventEmitter<void>();
  target:any=null;picked=new Set<string>();err='';busy=false;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  @Input() set item(v:any){this.target=v;this.err='';if(v)this.picked=new Set(this.kind=='s'?(v.subject_codes||Object.keys(v.g)):(v.subs||[]))}
  get units(){return this.d.unitsOf([...this.picked])}
  get availableSubjects(){return this.d.subjectList.filter(s=>
    !this.target?.session||s.session==='All'||s.session===this.target.session)}
  fullName(name:string,middleName?:string|null){return fullName(name,middleName)}
  toggle(c:string){this.picked.has(c)?this.picked.delete(c):this.picked.add(c)}
  rec(s:any){return (s.p=='All'||s.p==this.target.prog)&&(s.y=='All'||s.y==+this.target.yr)
    &&(!this.target?.session||s.session==='All'||s.session===this.target.session)}
  recommended(){this.picked=new Set(this.availableSubjects.filter(s=>this.rec(s)).map(s=>s.code))}
  async save(){if(this.busy||!this.target)return;const c=[...this.picked],u=this.units;this.err=u==0?'Select at least one subject.':u>27?`Maximum load is 27 units (currently ${u}).`:this.d.clash(c);
    if(this.err)return this.ui.toast('Subject load not saved.','er');const t=this.target;
    const rm=this.kind=='s'?this.d.codes(t).filter(x=>!c.includes(x)&&t.g[x]?.some((v:any)=>v!=null)):[];
    this.busy=true;
    if(!await this.ui.confirm('Save subject load?',`${t.name} will have ${c.length} subject(s) · ${u} units.`+(rm.length?` Removing ${rm.join(', ')} from the current load will not delete historical grades.`:''),
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{
      if(this.kind=='s')await this.d.assignStudent(t.id,c);
      else await this.d.saveApplicantSubjects(t.ref,c);
      this.ui.toast('Subject load saved for '+t.name+'.');this.closed.emit();
    }catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Subject load could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}
  }
}
