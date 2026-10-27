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

  it('omits instructor names from the subjects table',()=>{
    const data=TestBed.inject(DataService);
    data.users=[{id:42,name:'Assigned Faculty',email:'faculty@example.com',role:'Faculty',act:true,phone:''}];
    data.subjects={
      IT305:{n:'Software Design',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:3,f:42,session:'All',semester:'1st Semester'},
    };
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    const table=(fixture.nativeElement as HTMLElement).querySelector('table');
    const text=table?.textContent||'';

    expect(table?.textContent).not.toContain('Instructor');
    expect(text).not.toContain('Assigned Faculty');
    expect(text).toContain('Software Design');
    expect(text).toContain('Units');
  });

  it('preserves existing faculty assignments and does not assign new subjects',async()=>{
    const data=TestBed.inject(DataService);
    const subject={
      n:'Software Design',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
      r:'Room 1',p:'BSIT',y:3,f:42,session:'All',semester:'1st Semester',academic_year:'2026-2027',
    };
    data.subjects={IT305:{...subject,faculty_ids:[42,43]}};
    const saveSubject=vi.spyOn(data,'saveSubject').mockResolvedValue();
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.openSub('IT305');

    await component.saveSub();

    expect(saveSubject).toHaveBeenCalledWith('IT305',expect.objectContaining({f:42,faculty_ids:[42,43]}));
    expect(saveSubject).toHaveBeenCalledWith('IT305',expect.objectContaining({
      d:'Mon/Wed',academic_year:'2026-2027',
    }));
    expect(data.subjects['IT305'].f).toBe(42);

    component.openSub();
    component.sm.code='IT306';
    component.sm.n='New Subject';
    component.sm.start='08:00';
    component.sm.end='09:00';
    component.sm.r='Room 2';
    await component.saveSub();

    expect(saveSubject.mock.calls[1][1].f).toBeNull();
    expect(saveSubject.mock.calls[1][1].faculty_ids).toEqual([]);
  });

  it('filters subject offerings by program, semester, and year level',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Afternoon term',u:3,d:'Mon/Wed',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:2,f:null,session:'Afternoon',semester:'1st Semester',academic_year:'2026-2027'},
      IT202:{n:'Evening term',u:3,d:'Tue/Thu',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 2',p:'BSBA',y:3,f:null,session:'Evening',semester:'2nd Semester',academic_year:'2026-2027'},
      AB101:{n:'ABSTM offering',u:3,d:'Tue/Thu',tm:'10:00–11:00',start:'10:00',end:'11:00',
        r:'Room 3',p:'ABSTM',y:3,f:null,session:'All',semester:'2nd Semester',academic_year:'2025-2026'},
    };
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.programFilter='BSIT';
    component.semesterFilter='1st Semester';
    component.yearLevelFilter='2';

    expect(component.visibleSubjects.map(subject=>subject.code)).toEqual(['IT101']);
    component.programFilter='ABSTM';
    component.semesterFilter='2nd Semester';
    component.yearLevelFilter='3';
    expect(component.visibleSubjects.map(subject=>subject.code)).toEqual(['AB101']);
  });

  it('offers Sunday when adding a subject',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    expect(component.days.map(day=>day.value)).toContain('Sun');
    expect(component.days.map(day=>day.value)).not.toContain('Mon/Wed/Fri');
    expect(component.yearLevels.map(level=>level.label)).toEqual([
      'All','1st Year','2nd Year','3rd Year','4th Year','Grade 11','Grade 12',
    ]);
  });

  it('loads legacy schedule days into the multi-select picker',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT305']={n:'Legacy subject',u:3,d:'Mon/Wed/Fri',tm:'08:00–09:30',
      start:'08:00',end:'09:30',r:'Room 1',p:'BSIT',y:1,f:null};
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.openSub('IT305');

    expect(component.sm.days).toEqual(['Mon','Wed','Fri']);
  });

  it('omits session from subject forms and save data',async()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT305']={
      n:'Legacy session subject',u:3,d:'Mon/Wed',tm:'08:00–09:00',start:'08:00',end:'09:00',
      r:'Room 1',p:'BSIT',y:1,f:null,session:'Weekends',semester:'1st Semester',
    };
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub('IT305');
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Program Selection');
    expect(text).not.toContain('Session');
    expect(fixture.componentInstance.sm.p).toBe('BSIT');

    const saveSubject=vi.spyOn(data,'saveSubject').mockResolvedValue();
    await fixture.componentInstance.saveSub();
    expect('session' in saveSubject.mock.calls[0][1]).toBe(false);
  });

  it('shows searchable major options without exposing academic-year selection',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.componentInstance.sm.p='BSED';
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Major');
    expect(text).not.toContain('Academic year');
    expect(fixture.componentInstance.sm.academic_year).toBeUndefined();
    expect(fixture.componentInstance.majorsFor('BSED')).toEqual([
      'Filipino','English','Mathematics',
    ]);
  });

  it('offers the requested programs and filters offerings without an academic-year filter',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    expect(component.programs).toEqual([
      'All','BSIT','BSBA','ABSTM','BSED','BEED','BSMA','BSHM','TVL','BSE','STEM','ABM','HUMSS','GAS',
    ]);

    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).not.toContain('Academic year');
    expect('academicYearFilter' in component).toBe(false);
  });

  it('shows separate catalog columns and keeps offering metadata out of the table',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT305:{n:'Software Design',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:3,f:null,session:'All',semester:'1st Semester',academic_year:'2026-2027'},
    };
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    const table=fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const headings=[...table.querySelectorAll('th')].map(cell=>cell.textContent?.trim());
    expect(headings).toEqual([
      'Subject Code','Subject Name','Units','Schedule','Room','Program','Year Level','Semester','Actions',
    ]);
    expect(table.textContent).not.toContain('2026-2027');
    expect(table.textContent).not.toContain('Students');
  });

  it('uses dashes when offering values are unavailable',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT305:{n:'',u:0,d:'',tm:'',start:null,end:null,r:'',p:'',y:'',f:null,semester:null},
    };
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    const row=fixture.nativeElement.querySelector('table tr:nth-child(2)') as HTMLTableRowElement;
    const cells=[...row.querySelectorAll('td')].map(cell=>cell.textContent?.trim());

    expect(cells.slice(1,8)).toEqual(['—','0','—','—','—','—','—']);
  });

  it('detects a room clash only when the day, time, and offering term overlap',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Database',u:3,d:'Mon/Wed',tm:'08:00–09:00',start:'08:00',end:'09:00',
        r:'Lab 1',p:'BSIT',y:1,f:null,semester:'1st Semester',academic_year:'2026-2027'},
    };
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    const offering={r:' lab 1 ',start:'08:30',end:'09:30',days:['Wed'],semester:'1st Semester',
      academic_year:'2026-2027'};

    expect(component.roomConflict(offering,'IT102')).toBe(true);
    expect(component.roomConflict({...offering,days:['Thu']},'IT102')).toBe(false);
    expect(component.roomConflict({...offering,semester:'2nd Semester'},'IT102')).toBe(false);
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
