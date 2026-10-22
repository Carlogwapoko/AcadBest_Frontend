import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { SubjectsUnitsComponent } from './subjects-units.component';

describe('SubjectsUnitsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[SubjectsUnitsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('uses separate time fields and leaves faculty assignment out of subject forms',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Start Time');
    expect(text).toContain('End Time');
    expect(text).not.toContain('Instructor');
  });

  it('filters subject offerings by session, semester, and academic year',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Afternoon term',u:3,d:'Mon/Wed',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'All',y:'All',f:null,session:'Afternoon',semester:'1st Semester',academic_year:'2026-2027'},
      IT202:{n:'Evening term',u:3,d:'Tue/Thu',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 2',p:'All',y:'All',f:null,session:'Evening',semester:'2nd Semester',academic_year:'2026-2027'},
    };
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.sessionFilter='Afternoon';
    component.semesterFilter='1st Semester';
    component.academicYearFilter='2026-2027';

    expect(component.visibleSubjects.map(subject=>subject.code)).toEqual(['IT101']);
  });
});
