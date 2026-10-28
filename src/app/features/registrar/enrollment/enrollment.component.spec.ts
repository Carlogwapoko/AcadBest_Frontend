import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { EnrollmentComponent } from './enrollment.component';

describe('EnrollmentComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[EnrollmentComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps applicant name values in their separate table columns',()=>{
    TestBed.inject(DataService).enrollments=[{
      ref:'ENR-2026-ABC123',name:'First Middle Last',first_name:null,middle_name:'Middle',last_name:null,
      email:'legacy@example.com',phone:'',dob:'2007-01-01',sex:'Female',addr:'Address',
      prog:'BSIT',yr:1,type:'New Student',student_status:'Applicant',school:'School',
      gname:'Guardian',gph:'',st:'Pending',date:'Oct 23',note:'',acct:false,log:[],
    }];
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const cells=fixture.nativeElement.querySelectorAll(
      '.tw tr:last-child td'
    ) as NodeListOf<HTMLTableCellElement>;

    expect(Array.from(cells).slice(1,4).map(cell=>cell.textContent?.trim()))
      .toEqual(['—','Middle','—']);
    expect(fixture.nativeElement.querySelector('td[colspan="3"]')).toBeNull();
  });

  it('updates all six parent name fields from the registrar detail view',async()=>{
    const data=TestBed.inject(DataService);
    const update=vi.spyOn(data,'updateEnrollmentParents').mockResolvedValue();
    vi.spyOn(TestBed.inject(UiService),'toast').mockImplementation(()=>{});
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const component=fixture.componentInstance;
    component.sel={
      ref:'ENR-2026-ABC123',name:'First Last',first_name:'First',last_name:'Last',
      email:'applicant@example.com',phone:'',dob:'2007-01-01',sex:'Female',addr:'Address',
      prog:'BSIT',yr:1,type:'New Student',student_status:'Applicant',school:'School',
      gname:'Guardian',gph:'',st:'Pending',date:'Oct 23',note:'',acct:false,log:[],
    };
    component.editParents();
    component.parentForm={
      mother_first_name:'Mother',mother_middle_name:'Marie',mother_last_name:'Parent',
      father_first_name:'Father',father_middle_name:'James',father_last_name:'Parent',
    };
    await component.saveParents();
    expect(update).toHaveBeenCalledWith('ENR-2026-ABC123',{
      mother_first_name:'Mother',mother_middle_name:'Marie',mother_last_name:'Parent',
      father_first_name:'Father',father_middle_name:'James',father_last_name:'Parent',
    });
    expect(component.sel.mother_middle_name).toBe('Marie');
    expect(component.editingParents).toBe(false);
  });

  it('creates a student account only from an approved application with the application identity',async()=>{
    const data=TestBed.inject(DataService);
    const save=vi.spyOn(data,'saveUser').mockResolvedValue({
      id:10,name:'First Middle Last',first_name:'First',middle_name:'Middle',last_name:'Last',
      email:'applicant@example.com',role:'Student',act:true,phone:'',
    });
    const mark=vi.spyOn(data,'markEnrollmentAccountIssued');
    vi.spyOn(TestBed.inject(UiService),'toast').mockImplementation(()=>{});
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const component=fixture.componentInstance;
    const applicant={
      ref:'ENR-2026-ABC123',name:'First Middle Last',first_name:'First',middle_name:'Middle',
      last_name:'Last',email:'applicant@example.com',phone:'',dob:'2007-01-01',sex:'Female',
      addr:'Address',prog:'BSIT',yr:1,type:'New Student',student_status:'New Student',
      school:'School',gname:'Guardian',gph:'',st:'Enrolled',date:'Oct 23',note:'',
      acct:false,school_id:'2026000001',log:[],
    };
    component.openAccount(applicant);
    component.accountPassword='temporary-pass';
    component.accountSection='B';
    await component.createStudentAccount();
    expect(save).toHaveBeenCalledWith(undefined,{
      first_name:'First',middle_name:'Middle',last_name:'Last',email:'applicant@example.com',
      role:'Student',password:'temporary-pass',program:'BSIT',year_level:1,section:'B',
      application_ref:'ENR-2026-ABC123',
    });
    expect(mark).toHaveBeenCalledWith('ENR-2026-ABC123');
    expect(applicant.acct).toBe(true);
    expect(component.accountApplicant).toBeNull();
  });
});
