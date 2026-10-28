import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { FacultySubjectsComponent } from './subjects.component';

describe('FacultySubjectsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[FacultySubjectsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Faculty',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(FacultySubjectsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('shows only faculty-assigned subjects in the matching session tab with schedule and room',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Programming',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:1,f:1,session:'Afternoon',faculty_assignments:[
          {id:11,faculty_id:1,semester:'1st Semester',academic_year:'2026-2027',section:'A',
            session:'Afternoon',
            days:'Tue/Thu',start_time:'10:00',end_time:'11:00',room:'Lab 5'},
          {id:12,faculty_id:1,semester:'1st Semester',academic_year:'2026-2027',section:'A',
            session:'Evening',
            days:'Fri',start_time:'18:00',end_time:'19:00',room:'Lab 6'},
        ]},
      IT102:{n:'Not assigned',u:3,d:'Mon',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 2',p:'BSIT',y:1,f:2,session:'Afternoon',faculty_assignments:[
          {faculty_id:2,semester:'1st Semester',academic_year:'2026-2027',section:'A'},
        ]},
    };
    data.students=[{
      id:2,name:'Student A',prog:'BSIT',yr:1,sec:'A',g:{},subject_codes:['IT101'],
      semester:'1st Semester',academic_year:'2026-2027',session:'Afternoon',enrollment_status:'Enrolled',
    }];
    const fixture=TestBed.createComponent(FacultySubjectsComponent);
    fixture.detectChanges();
    const table=fixture.nativeElement.querySelector('.subject-table') as HTMLTableElement;
    expect([...table.querySelectorAll('th')].map(cell=>cell.textContent?.trim())).toEqual([
      'Subject Code','Subject Name','Schedule','Semester','Academic Year','Action',
    ]);
    expect(table.textContent).toContain('IT101');
    expect(table.textContent).toContain('Tue/Thu');
    expect(table.textContent).toContain('10:00–11:00');
    expect(table.textContent).toContain('Lab 5');
    expect(table.textContent).not.toContain('IT102');
    expect(table.textContent).not.toContain('Lab 6');
    const eveningTab=(fixture.nativeElement as HTMLElement).querySelectorAll('.session-tabs button')[1] as HTMLButtonElement;
    eveningTab.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.assignments.map(item=>item.room)).toEqual(['Lab 6']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.subject-table')?.textContent)
      .toContain('Lab 6');
    expect((fixture.nativeElement as HTMLElement).querySelector('.subject-table')?.textContent)
      .not.toContain('Lab 5');
  });

  it('filters assigned subjects by session, semester, and academic year',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Afternoon Class',u:3,d:'Mon',tm:'08:00',start:'08:00',end:'09:00',
        r:'Room A',p:'BSIT',y:1,f:1,session:'Afternoon',faculty_assignments:[
          {faculty_id:1,semester:'1st Semester',academic_year:'2026-2027',section:'A'},
        ]},
      IT102:{n:'Evening Class',u:3,d:'Tue',tm:'10:00',start:'10:00',end:'11:00',
        r:'Room B',p:'BSIT',y:1,f:1,session:'Evening',faculty_assignments:[
          {faculty_id:1,semester:'2nd Semester',academic_year:'2025-2026',section:'A'},
        ]},
    };
    const component=TestBed.createComponent(FacultySubjectsComponent).componentInstance;

    expect(component.assignments.map(item=>item.code)).toEqual(['IT101']);
    component.session='Evening';
    component.semester='2nd Semester';
    component.academicYear='2025-2026';
    expect(component.assignments.map(item=>item.code)).toEqual(['IT102']);
  });
});
