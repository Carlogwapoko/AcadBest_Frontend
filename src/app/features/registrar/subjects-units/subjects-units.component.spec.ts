import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
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

  it('removes class schedule fields from subject forms',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).not.toContain('Class Schedule');
    expect(text).not.toContain('Start Time');
    expect(text).not.toContain('End Time');
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
    await component.saveSub();

    expect(saveSubject.mock.calls[1][1].f).toBeNull();
    expect(saveSubject.mock.calls[1][1].faculty_ids).toEqual([]);
    expect(saveSubject.mock.calls[1][1]).toEqual(expect.objectContaining({d:'',start:null,end:null,r:''}));
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

  it('limits faculty load sections to All, A, and B',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;

    expect(component.facultySections).toEqual(['All','A','B']);
  });

  it('keeps subject fields and year levels available without schedule controls',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    expect(component.yearLevels.map(level=>level.label)).toEqual([
      'All','1st Year','2nd Year','3rd Year','4th Year','Grade 11','Grade 12',
    ]);
  });

  it('removes a student subject from the selected enrollment, including the last subject',async()=>{
    const data=TestBed.inject(DataService);
    const ui=TestBed.inject(UiService);
    vi.spyOn(ui,'confirm').mockResolvedValue(true);
    vi.spyOn(ui,'toast');
    const assignStudent=vi.spyOn(data,'assignStudent').mockResolvedValue();
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    const student={
      id:10,name:'Student Example',prog:'BSIT',yr:1,sec:'A',g:{},semester:'1st Semester',
      academic_year:'2026-2027',enrollment_ref:'APP-10',subject_codes:['IT101'],
    };

    await component.removeStudentSubject(student,'IT101');

    expect(assignStudent).toHaveBeenCalledWith(10,[],'APP-10');
  });

  it('removes only the selected faculty subject while preserving remaining schedules',async()=>{
    const data=TestBed.inject(DataService);
    const ui=TestBed.inject(UiService);
    vi.spyOn(ui,'confirm').mockResolvedValue(true);
    vi.spyOn(ui,'toast');
    data.currentAcademicYear='2026-2027';
    data.subjects={
      IT101:{n:'Programming',u:3,d:'Mon',tm:'08:00–09:00',start:'08:00',end:'09:00',
        r:'Room 1',p:'BSIT',y:1,f:42,faculty_assignments:[
          {faculty_id:42,semester:'1st Semester',academic_year:'2026-2027',section:'A',
            days:'Mon',start_time:'08:00',end_time:'09:00',room:'Room 1'},
        ]},
      IT201:{n:'Databases',u:4,d:'Tue',tm:'10:00–11:00',start:'10:00',end:'11:00',
        r:'Room 2',p:'BSIT',y:2,f:42,faculty_assignments:[
          {faculty_id:42,semester:'1st Semester',academic_year:'2026-2027',section:'A',
            days:'Tue',start_time:'10:00',end_time:'11:00',room:'Room 2'},
        ]},
    };
    const assignFaculty=vi.spyOn(data,'assignFaculty').mockResolvedValue();
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.facultySection='A';

    await component.removeFacultySubject({id:42,name:'Faculty Example'},'IT101');

    expect(assignFaculty).toHaveBeenCalledWith(42,['IT201'],{
      semester:'1st Semester',academic_year:'2026-2027',section:'A',
    },{
      IT201:[{session:'Afternoon',days:'Tue',start_time:'10:00',end_time:'11:00',room:'Room 2'}],
    });
  });

  it('preserves legacy schedule and room values when editing subject information',async()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT305']={n:'Legacy subject',u:3,d:'Mon/Wed/Fri',tm:'08:00–09:30',
      start:'08:00',end:'09:30',r:'Room 1',p:'BSIT',y:1,f:null};
    const saveSubject=vi.spyOn(data,'saveSubject').mockResolvedValue();
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.openSub('IT305');
    await component.saveSub();
    expect(saveSubject).toHaveBeenCalledWith('IT305',expect.objectContaining({
      d:'Mon/Wed/Fri',start:'08:00',end:'09:30',r:'Room 1',
    }));
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

  it('uses the offering program list in the subject selector and keeps legacy ABSTM editable',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['AB902']={
      n:'Historical ABSTM Subject',u:3,d:'',tm:'',start:null,end:null,r:'',
      p:'ABSTM',y:1,f:null,
    };
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    const component=fixture.componentInstance;
    component.openSub();
    fixture.detectChanges();

    const filter=fixture.nativeElement.querySelector(
      '.subject-filters select'
    ) as HTMLSelectElement;
    const selects=Array.from(
      fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>
    );
    const subjectProgram=selects.find(select=>
      Array.from(select.options).some(option=>option.value==='')
    )!;
    expect(Array.from(subjectProgram.options).slice(1).map(option=>option.value))
      .toEqual(Array.from(filter.options).map(option=>option.value));
    expect(Array.from(subjectProgram.options).some(option=>option.value==='ABSTM')).toBe(false);

    subjectProgram.value='BSED';
    subjectProgram.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.sm.p).toBe('BSED');
    expect(component.majorsFor(component.sm.p)).toEqual(['Filipino','English','Mathematics']);
    expect(Array.from(
      fixture.nativeElement.querySelectorAll('#subject-major-options option') as NodeListOf<HTMLOptionElement>
    ).map(option=>option.value)).toEqual(['Filipino','English','Mathematics']);

    const legacyFixture=TestBed.createComponent(SubjectsUnitsComponent);
    const legacyComponent=legacyFixture.componentInstance;
    legacyComponent.openSub('AB902');
    legacyFixture.detectChanges();
    expect(legacyComponent.sm).toMatchObject({isNew:false,p:'ABSTM'});
    const legacySelect=Array.from(
      legacyFixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>
    ).find(select=>Array.from(select.options).some(option=>option.value==='ABSTM'))!;
    const legacyOption=legacySelect
      .querySelector('option[value="ABSTM"]') as HTMLOptionElement;
    expect(legacyOption.disabled).toBe(true);
  });

  it('offers the requested programs and filters offerings without an academic-year filter',()=>{
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    expect(component.programs).toEqual([
      'All','BSTM','BSED','BEED','BSE','BSMA','BSHM','BSIT','BSBA','STEM','ABM','HUMSS','GAS','TVL',
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

  it('uses assignment-specific schedule and room values in Faculty Loads',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Database',u:3,d:'Mon/Wed',tm:'08:00–09:00',start:'08:00',end:'09:00',
        r:'Lab 1',p:'BSIT',y:1,f:42,semester:'1st Semester',academic_year:'2026-2027',
        faculty_assignments:[{id:7,faculty_id:42,semester:'1st Semester',academic_year:'2026-2027',
          section:'A',session:'Evening',days:'Tue/Thu',start_time:'10:00',end_time:'11:00',room:'Lab 5'}]},
      };
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.facultyAcademicYear='2026-2027';
    component.facultySection='A';
    const row=component.facultySchedules(42)[0];
    expect(row).toEqual({code:'IT101',assignment_id:7,session:'Evening',
      days:'Tue/Thu',start:'10:00',end:'11:00',room:'Lab 5'});
    component.openFac({id:42,name:'Faculty',act:true});
    expect(component.fm.schedules.IT101).toEqual([{
      session:'Evening',days:'Tue/Thu',start_time:'10:00',end_time:'11:00',room:'Lab 5',
    }]);
    component.addFacultySchedule('IT101');
    expect(component.fm.schedules.IT101.map((schedule:any)=>schedule.session))
      .toEqual(['Evening','Afternoon']);
  });

  it('filters faculty and enrolled student loads by search text',()=>{
    const data=TestBed.inject(DataService);
    data.users=[
      {id:2,name:'Ada Faculty',email:'ada@example.com',role:'Faculty',act:true,phone:''},
      {id:3,name:'Ben Faculty',email:'ben@example.com',role:'Faculty',act:true,phone:''},
    ];
    data.eligibleEnrollments=[
      {id:1,name:'Alex Taylor',first_name:'Alex',middle_name:null,last_name:'Taylor',school_id:'2026000001',
        enrollment_status:'Enrolled',semester:'1st Semester',academic_year:'2026-2027',
        prog:'BSIT',major:null,yr:1,sec:'A',g:{}},
      {id:2,name:'Pending Student',school_id:'2026000002',
        enrollment_status:'Pending',semester:'1st Semester',academic_year:'2026-2027',
        prog:'BSIT',major:null,yr:1,sec:'A',g:{}},
    ];
    const component=TestBed.createComponent(SubjectsUnitsComponent).componentInstance;
    component.facultySearch='Ada Fac';
    component.studentSearch='Alex Taylor';

    expect(component.faculty.map(user=>user.id)).toEqual([2]);
    expect(component.enrolledStudents.map(student=>student.id)).toEqual([1]);
    component.studentSearch='Tay';
    expect(component.enrolledStudents.map(student=>student.id)).toEqual([1]);
    component.studentSearch='2026000001';
    expect(component.enrolledStudents.map(student=>student.id)).toEqual([1]);
    component.facultySearch='ada@example';
    expect(component.faculty).toEqual([]);
  });

  it('labels the Student Loads search field and uses the requested placeholder',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.selectTab('l');
    fixture.detectChanges();
    const search=fixture.nativeElement.querySelector('input[aria-label="Search student loads"]') as HTMLInputElement;
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Search Student Name or ID');
    expect(search.placeholder).toBe('Search student name or ID');
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
