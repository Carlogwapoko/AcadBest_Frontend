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

  it('renders assigned subjects as a weekday schedule table',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'Programming',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:1,f:1,session:'Afternoon'},
    };
    data.students=[{
      id:2,name:'Student A',prog:'BSIT',yr:1,sec:'A',g:{},subject_codes:['IT101'],
    }];
    const fixture=TestBed.createComponent(FacultySubjectsComponent);
    fixture.detectChanges();
    const rows=fixture.nativeElement.querySelectorAll(
      '.schedule-table tbody tr'
    ) as NodeListOf<HTMLTableRowElement>;

    expect(fixture.nativeElement.querySelector('.grid.g2')).toBeNull();
    expect(Array.from(rows).map(row=>row.cells[0].textContent?.trim()))
      .toEqual(['Monday','Wednesday']);
    expect(rows[0].textContent).toContain('Afternoon');
    expect(rows[0].textContent).toContain('A');
  });
});
