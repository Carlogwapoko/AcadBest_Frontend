import { ChangeDetectorRef,Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

@Component({selector:'app-academic-year',standalone:true,imports:[COMMON],
  styleUrl:'./academic-year.component.css',templateUrl:'./academic-year.component.html'})
export class AcademicYearComponent{
  academicYear='';error='';busy=false;loading=true;
  constructor(public d:DataService,private ui:UiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){void this.load()}
  private async load(){
    try{this.academicYear=await this.d.loadAcademicYear()}
    catch(error){this.ui.toast(this.message(error,'Academic year could not be loaded.'),'er')}
    finally{this.loading=false;this.cdr.markForCheck()}
  }
  async save(){
    if(this.busy||this.loading)return;
    const value=this.academicYear.trim();
    this.error=/^\d{4}-\d{4}$/.test(value)&&Number(value.slice(5))===Number(value.slice(0,4))+1
      ?'':'Enter a valid academic year, such as 2026-2027.';
    if(this.error)return this.ui.toast('Academic year not saved – fix errors.','er');
    this.busy=true;
    if(!await this.ui.confirm('Save academic year?',`Online enrollment will suggest ${value}. Existing applications keep their recorded school year.`,
      'Save')){this.busy=false;this.cdr.markForCheck();return}
    try{await this.d.saveAcademicYear(value);this.ui.toast('Current academic school year saved.')}
    catch(error){this.ui.toast(this.message(error,'Academic year could not be saved.'),'er')}
    finally{this.busy=false;this.cdr.markForCheck()}
  }
  private message(error:unknown,fallback:string){
    return (error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:fallback)
  }
}
