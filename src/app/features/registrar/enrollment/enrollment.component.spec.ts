import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { EnrollmentComponent } from './enrollment.component';

describe('EnrollmentComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[EnrollmentComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
