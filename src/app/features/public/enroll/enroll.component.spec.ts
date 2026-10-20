import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { EnrollComponent } from './enroll.component';

describe('EnrollComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[EnrollComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(EnrollComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('renders the requested name placeholders, programs, and sessions',()=>{
    const fixture=TestBed.createComponent(EnrollComponent);
    fixture.detectChanges();
    const element=fixture.nativeElement as HTMLElement;
    expect(element.querySelector('input[placeholder="Enter your first name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Enter your middle name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Enter your last name"]')).toBeTruthy();
    expect(element.textContent).toContain('Gender');
    expect(element.textContent).toContain('Others');
    expect(element.textContent).toContain('BSTM');
    expect(element.textContent).toContain('BSED');
    expect(element.textContent).toContain('BEED');
    expect(element.textContent).toContain('BSE');
    expect(element.textContent).toContain('BSMA');
    expect(element.textContent).toContain('BSHM');
    expect(element.textContent).toContain('BSIT');
    expect(element.textContent).toContain('BSBA');
    expect(element.textContent).toContain('Afternoon');
    expect(element.textContent).toContain('Evening');
    expect(element.textContent).toContain('Weekends');
  });
});
