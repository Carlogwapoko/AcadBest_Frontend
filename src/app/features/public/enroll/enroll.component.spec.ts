import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { EnrollComponent } from './enroll.component';

describe('EnrollComponent', () => {
  const fillRequiredFields = (component: EnrollComponent) => Object.assign(component.f, {
    fn: 'Ada', ln: 'Lovelace', dob: '2000-01-01', sex: 'Female',
    em: 'ada@example.com', ph: '09123456789', ad: '123 Example Street',
    academic_year: '2026-2027', pr: 'BSTM', yr: '1', semester: '1st Semester',
    session: 'Afternoon', ty: 'New Student', sc: 'Example High School',
    gn: 'Augusta Lovelace', gp: '09123456789', ok: true,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {
      id: 1, name: 'Test User', email: 'test@example.com', phone: '', role: 'Student', act: true,
    };
  });

  it('creates and renders the standalone component', () => {
    const fixture = TestBed.createComponent(EnrollComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('shows one step at a time and validates before advancing', () => {
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    component.yearLoading = false;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#first-name')).toBeTruthy();
    expect(element.querySelector('#academic-year')).toBeNull();
    expect(element.querySelector('label[for="first-name"]')).toBeTruthy();
    expect(element.querySelector('input[type="date"]')).toBeTruthy();
    expect(element.querySelector('input[type="email"]')).toBeTruthy();
    expect(element.querySelector('input[type="tel"]')).toBeTruthy();

    element.querySelector('.next-button')?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.step).toBe(1);
    expect(component.e['fn']).toBe('First name is required.');
    expect(element.querySelector('#first-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#error-first-name')?.textContent).toContain('First name is required.');

    Object.assign(component.f, {
      fn: 'Ada', ln: 'Lovelace', dob: '2000-01-01', sex: 'Female',
      em: 'ada@example.com', ph: '09123456789', ad: '123 Example Street',
    });
    element.querySelector('.next-button')?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.step).toBe(2);
    expect(element.querySelector('#first-name')).toBeNull();
    expect(element.querySelector('#academic-year')).toBeTruthy();
    expect((element.querySelector('#academic-year') as HTMLInputElement).readOnly).toBe(true);
  });

  it('supports keyboard selection from the bounded custom dropdown', () => {
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    component.yearLoading = false;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const gender = element.querySelector('#gender') as HTMLButtonElement;

    expect(gender.getAttribute('role')).toBe('combobox');
    expect(element.querySelector('select')).toBeNull();
    gender.focus();
    gender.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(gender.getAttribute('aria-expanded')).toBe('true');
    gender.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    gender.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(component.f.sex).toBe('Male');
    expect(gender.getAttribute('aria-expanded')).toBe('false');
  });

  it('retains the program, major, and session catalog across the academic step', () => {
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    component.step = 2;
    component.yearLoading = false;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const programs = component.programOptions;
    expect(programs.some(option => option.value === 'BSTM')).toBe(true);
    expect(programs.some(option => option.value === 'ABSTM')).toBe(false);
    expect(programs.map(option => option.label).join(' ')).toContain('BSED BEED BSE BSMA BSHM BSIT BSBA');
    expect(programs.map(option => option.label).join(' ')).toContain('STEM ABM HUMSS GAS TVL');
    expect(component.yearLevelOptions.map(option => option.label).join(' ')).toContain('1st Year 2nd Year 3rd Year 4th Year Grade 11 Grade 12');
    expect(component.sessionOptions.map(option => option.label).join(' ')).toContain('Afternoon Evening Weekends');
    expect(component.semesterOptions.map(option => option.label).join(' ')).toContain('1st Semester 2nd Semester');
    expect(element.textContent).not.toContain('Financial Management');

    const chooseProgram = (value: string) => {
      (element.querySelector('#program') as HTMLButtonElement).click();
      fixture.detectChanges();
      const option = Array.from(element.querySelectorAll<HTMLElement>('[role="option"]'))
        .find(item => item.textContent?.trim() === value);
      expect(option).toBeTruthy();
      option?.click();
      fixture.detectChanges();
    };

    chooseProgram('BSBA');
    expect(component.majors).toContain('Financial Management');
    expect(component.majors).toContain('Human Resources Management');
    expect(component.majors).not.toContain('Mathematics');

    chooseProgram('BSED');
    expect(component.majors).toContain('Filipino');
    expect(component.majors).toContain('English');
    expect(component.majors).toContain('Mathematics');
    expect(component.majors).not.toContain('Financial Management');

    chooseProgram('TVL');
    expect(component.majors).toContain('ICT – Computer Servicing');
    expect(component.majors).toContain('Home Economics');
    expect(component.majors).toContain('Automotive Servicing');
    expect(component.majors).toContain('Electricity Servicing');
    expect(component.majors).not.toContain('Filipino');
  });

  it('shows the contact information heading and blocks submission until certified', async () => {
    const data = TestBed.inject(DataService);
    vi.spyOn(data, 'loadAcademicYear').mockResolvedValue('2026-2027');
    const submit = vi.spyOn(data, 'submitEnrollment').mockResolvedValue('ENR-123');
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    component.step = 3;
    fixture.detectChanges();
    component.yearLoading = false;
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.section-heading')?.textContent?.trim()).toBe('Parent/Guardian Information');
    expect(element.querySelectorAll('.section-heading').length).toBe(2);
    expect(element.querySelector('.field-section-title')).toBeNull();
    expect(element.querySelector('.section-heading.full-width')?.textContent?.trim()).toBe('CONTACT INFORMATION');
    expect(element.querySelectorAll('.field-label').length).toBe(8);
    expect(element.querySelector('#guardian-name')).toBeTruthy();
    expect(element.querySelector('#guardian-phone')).toBeTruthy();

    fillRequiredFields(component);
    component.f.ok = false;
    component.step = 4;
    await component.submit();
    fixture.detectChanges();

    expect(component.step).toBe(3);
    expect(component.e['ok']).toBe('You must certify your information.');
    expect(element.querySelector('#certify')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#error-certify')?.textContent).toContain('You must certify your information.');
    expect(submit).not.toHaveBeenCalled();
  });

  it('locks submit while sending, then resets to step one and shows the tracking number', async () => {
    const data = TestBed.inject(DataService);
    vi.spyOn(data, 'loadAcademicYear').mockResolvedValue('2026-2027');
    let resolveSubmission!: (reference: string) => void;
    const submit = vi.spyOn(data, 'submitEnrollment').mockReturnValue(
      new Promise(resolve => { resolveSubmission = resolve; }),
    );
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.yearLoading = false;
    component.step = 4;
    fillRequiredFields(component);

    const submission = component.submit();
    expect(component.busy).toBe(true);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('.next-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Submitting...');
    await component.submit();
    expect(submit).toHaveBeenCalledTimes(1);

    resolveSubmission('ENR-123');
    await submission;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(component.step).toBe(1);
    expect(component.f.fn).toBe('');
    expect(component.f.ok).toBe(false);
    expect(component.ref).toBe('ENR-123');
    expect(element.querySelector('.submission-success')?.textContent).toContain('ENR-123');
    expect(element.querySelector('#first-name')).toBeTruthy();
  });

  it('shows server errors without clearing entered values', async () => {
    const data = TestBed.inject(DataService);
    vi.spyOn(data, 'loadAcademicYear').mockResolvedValue('2026-2027');
    vi.spyOn(data, 'submitEnrollment').mockRejectedValue({ error: { message: 'Enrollment is temporarily unavailable.' } });
    const fixture = TestBed.createComponent(EnrollComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.yearLoading = false;
    component.step = 4;
    fillRequiredFields(component);

    await component.submit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(component.step).toBe(4);
    expect(component.f.fn).toBe('Ada');
    expect(component.f.ok).toBe(true);
    expect(component.submitError).toBe('Enrollment is temporarily unavailable.');
    expect(element.querySelector('.submit-error')?.textContent).toContain('Enrollment is temporarily unavailable.');
  });
});
