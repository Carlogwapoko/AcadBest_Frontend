import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { SubjectsUnitsComponent } from './subjects-units.component';
import { AssignLoadComponent } from '../components/assign-load/assign-load.component';

describe('SubjectsUnitsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[SubjectsUnitsComponent,AssignLoadComponent],
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

  it('filters subject offerings by program, semester, and year level',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Afternoon term',u:3,d:'Mon/Wed',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:2,f:null,session:'Afternoon',semester:'1st Semester',academic_year:'2026-2027'},
      IT202:{n:'Evening term',u:3,d:'Tue/Thu',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 2',p:'BSBA',y:3,f:null,session:'Evening',semester:'2nd Semester',academic_year:'2026-2027'},
    };
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.programFilter='BSIT';
    component.semesterFilter='1st Semester';
    component.yearLevelFilter='2';

    expect(component.visibleSubjects.map(subject=>subject.code)).toEqual(['IT101']);
  });

  it('offers Sunday when adding a subject',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    expect(component.days).toContain('Sun');
    expect(component.days).not.toContain('Mon/Wed/Fri');
    expect(component.yearLevels.map(level=>level.label)).toEqual([
      'All','1st Year','2nd Year','3rd Year','4th Year','Grade 11','Grade 12',
    ]);
  });

  it('requires a supported day selection when editing a legacy schedule',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT305']={n:'Legacy subject',u:3,d:'Mon/Wed/Fri',tm:'08:00–09:30',
      start:'08:00',end:'09:30',r:'Room 1',p:'BSIT',y:1,f:null};
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.openSub('IT305');

    expect(component.sm.d).toBe('');
    expect(component.days).not.toContain('Mon/Wed/Fri');
  });

  it('replaces session selection with program selection in subject forms',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Program Selection');
    expect(text).not.toContain('Session</');
    expect(fixture.componentInstance.sm.p).toBe('All');
  });

  it('shows majors for the selected program and omits academic year from subject forms',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.componentInstance.sm.p='BSED';
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Major');
    expect(text).not.toContain('Academic Year');
    expect(fixture.componentInstance.majorsFor('BSED')).toEqual([
      'Filipino','English','Mathematics',
    ]);
  });

  it('filters faculty and enrolled student loads by search text',()=>{
    const data=TestBed.inject(DataService);
    data.users=[
      {id:2,name:'Ada Faculty',email:'ada@example.com',role:'Faculty',act:true,phone:''},
      {id:3,name:'Ben Faculty',email:'ben@example.com',role:'Faculty',act:true,phone:''},
    ];
    data.students=[
      {id:1,name:'Alex Student',first_name:'Alex',school_id:'2026000001',
        enrollment_status:'Enrolled',prog:'BSIT',major:null,yr:1,sec:'A',g:{}},
      {id:2,name:'Pending Student',school_id:'2026000002',
        enrollment_status:'Pending',prog:'BSIT',major:null,yr:1,sec:'A',g:{}},
    ];
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.facultySearch='ada@example';
    component.studentSearch='2026000001';

    expect(component.faculty.map(user=>user.id)).toEqual([2]);
    expect(component.enrolledStudents.map(student=>student.id)).toEqual([1]);
  });

  it('groups assigned subjects by program and major and filters to the enrollment term',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      BA101:{n:'Finance',u:3,d:'Sat',tm:'09:00–10:00',start:'09:00',end:'10:00',
        r:'Room 1',p:'BSBA',major:'Financial Management',y:1,f:null,
        session:'Weekends',semester:'1st Semester',academic_year:'2026-2027'},
      BA102:{n:'Human Resources',u:3,d:'Sun',tm:'09:00–10:00',start:'09:00',end:'10:00',
        r:'Room 2',p:'BSBA',major:'Human Resources Management',y:1,f:null,
        session:'Weekends',semester:'1st Semester',academic_year:'2026-2027'},
      IT101:{n:'Programming',u:3,d:'Sat',tm:'09:00–10:00',start:'09:00',end:'10:00',
        r:'Room 3',p:'BSIT',y:1,f:null,session:'Weekends',semester:'1st Semester',academic_year:'2026-2027'},
      BA103:{n:'Other term',u:3,d:'Sat',tm:'09:00–10:00',start:'09:00',end:'10:00',
        r:'Room 4',p:'BSBA',major:'Financial Management',y:1,f:null,
        session:'Weekends',semester:'2nd Semester',academic_year:'2026-2027'},
    };
    const fixture=TestBed.createComponent(AssignLoadComponent);
    fixture.componentInstance.item={
      id:1,name:'Test Student',prog:'BSBA',major:'Financial Management',yr:1,
      session:'Weekends',semester:'1st Semester',academic_year:'2026-2027',
      subject_codes:['BA101','BA102','IT101','BA103'],g:{},
    };
    const component=fixture.componentInstance;

    expect(component.availableSubjects.map(subject=>subject.code)).toEqual(['BA101']);
    expect(component.subjectGroups.map(group=>group.label)).toEqual(['BSBA · Financial Management']);
    expect([...component.picked]).toEqual(['BA101']);
  });
});
