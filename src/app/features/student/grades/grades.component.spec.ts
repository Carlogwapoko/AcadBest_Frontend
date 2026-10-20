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
});
