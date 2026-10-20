import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { StudentDashboardComponent } from './dashboard.component';

describe('StudentDashboardComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[StudentDashboardComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(StudentDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
