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
    expect(element.querySelector('input[placeholder="Mother\'s first name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Mother\'s middle name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Mother\'s last name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Father\'s first name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Father\'s middle name"]')).toBeTruthy();
    expect(element.querySelector('input[placeholder="Father\'s last name"]')).toBeTruthy();
    const academicYear = element.querySelector('input[aria-label="Current Academic School Year"]') as HTMLInputElement;
    expect(academicYear).toBeTruthy();
    expect(academicYear.readOnly).toBe(true);
    expect(element.textContent).toContain('Gender');
    expect(element.textContent).toContain('Others');
    expect(element.textContent).toContain('BSTM');
    expect(Array.from(element.querySelectorAll('select')).some(select=>
      Array.from(select.options).some(option=>option.value==='ABSTM')
    )).toBe(false);
    expect(element.textContent).toContain('BSED');
    expect(element.textContent).toContain('BEED');
    expect(element.textContent).toContain('BSE');
    expect(element.textContent).toContain('BSMA');
    expect(element.textContent).toContain('BSHM');
    expect(element.textContent).toContain('BSIT');
    expect(element.textContent).toContain('BSBA');
    expect(element.textContent).toContain('STEM');
    expect(element.textContent).toContain('ABM');
    expect(element.textContent).toContain('HUMSS');
    expect(element.textContent).toContain('GAS');
    expect(element.textContent).toContain('TVL');
    expect(element.textContent).toContain('1st Year');
    expect(element.textContent).toContain('4th Year');
    expect(element.textContent).toContain('Grade 11');
    expect(element.textContent).toContain('Grade 12');
    expect(element.textContent).toContain('Afternoon');
    expect(element.textContent).toContain('Evening');
    expect(element.textContent).toContain('Weekends');
    expect(element.textContent).toContain('1st Semester');
    expect(element.textContent).toContain('2nd Semester');
    expect(element.textContent).not.toContain('Financial Management');

    const program=Array.from(element.querySelectorAll('select'))
      .find(select=>Array.from(select.options).some(option=>option.text==='BSTM'))!;
    program.value='BSBA';
    program.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('Financial Management');
    expect(element.textContent).toContain('Human Resources Management');
    expect(element.textContent).not.toContain('Mathematics');

    program.value='BSED';
    program.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('Filipino');
    expect(element.textContent).toContain('English');
    expect(element.textContent).toContain('Mathematics');
    expect(element.textContent).not.toContain('Financial Management');

    program.value='TVL';
    program.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('ICT – Computer Servicing');
    expect(element.textContent).toContain('Home Economics');
    expect(element.textContent).toContain('Automotive Servicing');
    expect(element.textContent).toContain('Electricity Servicing');
    expect(element.textContent).not.toContain('Filipino');
  });
});
