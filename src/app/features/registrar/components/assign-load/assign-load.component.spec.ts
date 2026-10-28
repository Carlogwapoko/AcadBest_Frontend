import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { DataService } from '../../../../core/data.service';
import { AssignLoadComponent } from './assign-load.component';

describe('AssignLoadComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AssignLoadComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(AssignLoadComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('offers matching advanced and back subjects regardless of the current year level',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      BA101:{n:'Back subject',u:3,d:'Sat',tm:'09:00–10:00',start:'09:00',end:'10:00',
        r:'Room 1',p:'BSBA',major:'Financial Management',y:1,f:null,session:'Weekends',
        semester:'1st Semester',academic_year:'2026-2027'},
      BA401:{n:'Advanced subject',u:3,d:'Sat',tm:'11:00–12:00',start:'11:00',end:'12:00',
        r:'Room 2',p:'BSBA',major:'Financial Management',y:4,f:null,session:'Weekends',
        semester:'1st Semester',academic_year:'2026-2027'},
      BA201:{n:'Current-year subject',u:3,d:'Sat',tm:'12:00–13:00',start:'12:00',end:'13:00',
        r:'Room 4',p:'BSBA',major:'Financial Management',y:2,f:null,session:'Weekends',
        semester:'1st Semester',academic_year:'2026-2027'},
      BA402:{n:'Other major',u:3,d:'Sat',tm:'13:00–14:00',start:'13:00',end:'14:00',
        r:'Room 3',p:'BSBA',major:'Marketing Management',y:4,f:null,session:'Weekends',
        semester:'1st Semester',academic_year:'2026-2027'},
    };
    const fixture=TestBed.createComponent(AssignLoadComponent);
    fixture.componentInstance.item={
      id:10,name:'Student Example',prog:'BSBA',major:'Financial Management',yr:2,
      session:'Weekends',semester:'1st Semester',academic_year:'2026-2027',
      subject_codes:[],g:{},
    };

    expect(fixture.componentInstance.availableSubjects.map(subject=>subject.code).sort())
      .toEqual(['BA101','BA201','BA401']);
    fixture.componentInstance.recommended();
    expect([...fixture.componentInstance.picked]).toEqual(['BA201']);
  });
});
