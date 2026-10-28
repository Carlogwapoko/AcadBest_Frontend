import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { GradeEntryComponent } from './grade-entry.component';

describe('GradeEntryComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[GradeEntryComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Faculty',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(GradeEntryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('shows existing period grades and computes an incomplete/equal-weight overall grade',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT101']={n:'Information Technology',u:3,d:'Mon/Wed',tm:'8:00–9:30 AM',
      start:'08:00',end:'09:30',r:'Lab 1',p:'All',y:'All',f:1,session:'Afternoon',
      faculty_assignments:[{faculty_id:1,semester:'1st Semester',academic_year:'2026-2027',section:'A'}]};
    data.students=[
      {id:2,enrollment_id:20,name:'Student',prog:'BSIT',yr:1,sec:'A',session:'Afternoon',
        semester:'1st Semester',academic_year:'2026-2027',subject_codes:['IT101'],enrollment_status:'Enrolled',g:{IT101:[85,90,null]}},
      {id:3,enrollment_id:30,name:'Evening Student',prog:'BSIT',yr:1,sec:'A',session:'Evening',
        semester:'1st Semester',academic_year:'2026-2027',subject_codes:['IT101'],enrollment_status:'Enrolled',g:{IT101:[80,null,null]}},
    ];
    const fixture=TestBed.createComponent(GradeEntryComponent);
    const component=fixture.componentInstance;
    component.subj='IT101';
    component.load();

    expect(component.periodGrade(data.students[0],'Prelim')).toBe(85);
    expect(component.overall(data.students[0])).toBeNull();
    component.entries[20].Final=95;
    expect(component.periodGrade(data.students[0],'Final')).toBe(95);
    expect(component.overall(data.students[0])).toBe(90);
    component.session='Afternoon';
    expect(component.rows.map(student=>student.id)).toEqual([2]);
  });

  it('renders direct entry for all periods without grading-system controls',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT101']={n:'Information Technology',u:3,d:'Mon/Wed',tm:'8:00–9:30 AM',
      start:'08:00',end:'09:30',r:'Lab 1',p:'All',y:'All',f:1,session:'Afternoon',
      faculty_assignments:[{faculty_id:1,semester:'1st Semester',academic_year:'2026-2027',section:'A'}]};
    data.students=[{
      id:2,enrollment_id:20,name:'Student',school_id:'2026000002',prog:'BSIT',yr:1,sec:'A',
      session:'Afternoon',semester:'1st Semester',academic_year:'2026-2027',
      subject_codes:['IT101'],enrollment_status:'Enrolled',g:{IT101:[80,85,90]},
    }];
    const fixture=TestBed.createComponent(GradeEntryComponent);
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    const headings=[...(fixture.nativeElement as HTMLElement).querySelectorAll('th')]
      .map(cell=>cell.textContent?.trim());

    expect(text).not.toContain('Grading System');
    expect(text).not.toContain('Save Grading System');
    expect(headings).toEqual(['School ID','Student Name','Prelim','Midterm','Final','Overall Grade']);
  });

  it('uses the configured subject grading weights for the overall grade',()=>{
    const data=TestBed.inject(DataService);
    data.subjects['IT202']={n:'Weighted course',u:3,d:'Mon',tm:'08:00',start:'08:00',end:'09:00',
      r:'Room',p:'All',y:'All',f:1,grade_weights:{Prelim:20,Midterm:30,Final:50}};
    expect(data.subjectAverage('IT202',[80,90,100])).toBe(93);
  });
});
