import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService, Enr } from '../../../core/data.service';
import { TrackApplicationComponent } from './track-application.component';

describe('TrackApplicationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackApplicationComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '',
      role: 'Student',
      act: true,
    };
  });

  const application = (status: string): Enr => ({
    ref: 'ENR-2026-ABC123',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '',
    dob: '',
    sex: '',
    addr: '',
    prog: 'BSTM',
    yr: 1,
    type: 'New Student',
    student_status: 'Applicant',
    school: '',
    gname: '',
    gph: '',
    st: status,
    date: '',
    note: '',
    acct: false,
    log: [['Nov 09', 'Application submitted']],
  });

  it('looks up an application and displays its status and history', async () => {
    const data = TestBed.inject(DataService);
    const trackEnrollment = vi
      .spyOn(data, 'trackEnrollment')
      .mockResolvedValue(application('Under Review'));
    const fixture = TestBed.createComponent(TrackApplicationComponent);
    const component = fixture.componentInstance;
    component.reference = ' ENR-2026-ABC123 ';
    component.email = ' ada@example.com ';

    await component.track();
    fixture.detectChanges();

    expect(trackEnrollment).toHaveBeenCalledWith('ENR-2026-ABC123', 'ada@example.com');
    expect(fixture.nativeElement.textContent).toContain('Under Review');
    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('Application submitted');
    expect(fixture.nativeElement.querySelector('.status-review')).toBeTruthy();
  });

  it('shows the lookup error when no matching application is found', async () => {
    vi.spyOn(TestBed.inject(DataService), 'trackEnrollment').mockRejectedValue({
      error: { message: 'No application found for that reference number and e-mail.' },
    });
    const fixture = TestBed.createComponent(TrackApplicationComponent);
    fixture.componentInstance.reference = 'ENR-UNKNOWN';
    fixture.componentInstance.email = 'ada@example.com';

    await fixture.componentInstance.track();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'No application found',
    );
    expect(fixture.nativeElement.querySelector('.track-result')).toBeNull();
  });

  it('assigns a distinct visual style to each application status', () => {
    const fixture = TestBed.createComponent(TrackApplicationComponent);
    const component = fixture.componentInstance;

    for (const [status, className] of [
      ['Pending', 'status-pending'],
      ['Under Review', 'status-review'],
      ['Enrolled', 'status-enrolled'],
      ['Rejected', 'status-rejected'],
    ]) {
      component.application = application(status);
      expect(component.statusClass).toBe(className);
    }
  });
});
