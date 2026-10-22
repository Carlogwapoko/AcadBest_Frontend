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
      start:'08:00',end:'09:30',r:'Lab 1',p:'All',y:'All',f:1,session:'Afternoon'};
    data.students=[
      {id:2,name:'Student',prog:'BSIT',yr:1,sec:'A',session:'Afternoon',g:{IT101:[85,90,null]}},
      {id:3,name:'Evening Student',prog:'BSIT',yr:1,sec:'A',session:'Evening',g:{IT101:[80,null,null]}},
    ];
    const fixture=TestBed.createComponent(GradeEntryComponent);
    const component=fixture.componentInstance;
    component.subj='IT101';
    component.load();

    expect(component.periodGrade(2,0)).toBe(85);
    expect(component.overall(2)).toBeNull();
    component.term='Final';
    component.entries[2]=95;
    expect(component.periodGrade(2,2)).toBe(95);
    expect(component.overall(2)).toBe(90);
    component.session='Afternoon';
    expect(component.rows.map(student=>student.id)).toEqual([2]);
  });
});
