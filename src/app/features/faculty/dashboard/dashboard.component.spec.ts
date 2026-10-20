import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FacultyDashboardComponent } from './dashboard.component';

describe('FacultyDashboardComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[FacultyDashboardComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Faculty',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(FacultyDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
