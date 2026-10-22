import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { StudentGradesComponent } from './grades.component';

describe('StudentGradesComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[StudentGradesComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
    TestBed.inject(AuthService).user!.sid=1;
    TestBed.inject(DataService).students=[{id:1,name:'Test User',prog:'BSIT',yr:1,sec:'A',g:{}}];
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(StudentGradesComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('filters the subject list by semester and academic year',()=>{
    const data=TestBed.inject(DataService);
    data.subjects={
      IT101:{n:'First Term',u:3,d:'Mon/Wed',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:1,f:null,semester:'1st Semester',academic_year:'2026-2027'},
      IT202:{n:'Second Term',u:3,d:'Tue/Thu',tm:'8:00–9:30',start:'08:00',end:'09:30',
        r:'Room 2',p:'BSIT',y:1,f:null,semester:'2nd Semester',academic_year:'2026-2027'},
    };
    data.students=[{id:1,name:'Test User',prog:'BSIT',yr:1,sec:'A',g:{
      IT101:[85,null,null],IT202:[90,null,null],
    }}];
    const component=TestBed.createComponent(StudentGradesComponent).componentInstance;
    component.semesterFilter='2nd Semester';

    expect(component.rows.map(subject=>subject.code)).toEqual(['IT202']);
    expect(component.totalUnits).toBe(3);
  });
});
