import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { EnrollmentComponent } from './enrollment.component';

describe('EnrollmentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '',
      role: 'Registrar Staff',
      act: true,
    };
  });

  it('creates and renders the standalone component', () => {
    const fixture = TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps applicant name values in their separate table columns', () => {
    TestBed.inject(DataService).enrollments = [
      {
        ref: 'ENR-2026-ABC123',
        name: 'First Middle Last',
        first_name: null,
        middle_name: 'Middle',
        last_name: null,
        email: 'legacy@example.com',
        phone: '',
        dob: '2007-01-01',
        sex: 'Female',
        addr: 'Address',
        prog: 'BSIT',
        yr: 1,
        type: 'New Student',
        student_status: 'Applicant',
        school: 'School',
        gname: 'Guardian',
        gph: '',
        st: 'Pending',
        date: 'Oct 23',
        note: '',
        acct: false,
        log: [],
      },
    ];
    const fixture = TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll(
      '.tw tr:last-child td',
    ) as NodeListOf<HTMLTableCellElement>;

    expect(
      Array.from(cells)
        .slice(1, 4)
        .map((cell) => cell.textContent?.trim()),
    ).toEqual(['—', 'Middle', '—']);
    expect(cells[cells.length - 1].textContent).toContain('Approve Enrollment');
    expect(cells[cells.length - 1].textContent).not.toContain('Create Account');
    expect(fixture.nativeElement.querySelector('td[colspan="3"]')).toBeNull();
  });

  it('updates all six parent name fields from the registrar detail view', async () => {
    const data = TestBed.inject(DataService);
    const update = vi.spyOn(data, 'updateEnrollmentParents').mockResolvedValue();
    vi.spyOn(TestBed.inject(UiService), 'toast').mockImplementation(() => {});
    const fixture = TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.sel = {
      ref: 'ENR-2026-ABC123',
      name: 'First Last',
      first_name: 'First',
      last_name: 'Last',
      email: 'applicant@example.com',
      phone: '',
      dob: '2007-01-01',
      sex: 'Female',
      addr: 'Address',
      prog: 'BSIT',
      yr: 1,
      type: 'New Student',
      student_status: 'Applicant',
      school: 'School',
      gname: 'Guardian',
      gph: '',
      st: 'Pending',
      date: 'Oct 23',
      note: '',
      acct: false,
      log: [],
    };
    component.editParents();
    component.parentForm = {
      mother_first_name: 'Mother',
      mother_middle_name: 'Marie',
      mother_last_name: 'Parent',
      father_first_name: 'Father',
      father_middle_name: 'James',
      father_last_name: 'Parent',
    };
    await component.saveParents();
    expect(update).toHaveBeenCalledWith('ENR-2026-ABC123', {
      mother_first_name: 'Mother',
      mother_middle_name: 'Marie',
      mother_last_name: 'Parent',
      father_first_name: 'Father',
      father_middle_name: 'James',
      father_last_name: 'Parent',
    });
    expect(component.sel.mother_middle_name).toBe('Marie');
    expect(component.editingParents).toBe(false);
  });

  it('creates an account only for an already-enrolled student without a manual password', async () => {
    const data = TestBed.inject(DataService);
    const resend = vi.spyOn(data, 'resendEnrollmentCredentials').mockResolvedValue({
      email: 'applicant@example.com',
      email_sent: true,
    });
    const complete = vi.spyOn(data, 'completeEnrollment').mockResolvedValue({
      status: 'Enrolled',
      section: 'B',
      school_id: '2026000001',
      account_issued: true,
    });
    vi.spyOn(TestBed.inject(UiService), 'toast').mockImplementation(() => {});
    const fixture = TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const applicant = {
      ref: 'ENR-2026-ABC123',
      name: 'First Middle Last',
      first_name: 'First',
      middle_name: 'Middle',
      last_name: 'Last',
      email: 'applicant@example.com',
      phone: '',
      dob: '2007-01-01',
      sex: 'Female',
      addr: 'Address',
      prog: 'BSIT',
      yr: 1,
      type: 'New Student',
      student_status: 'New Student',
      school: 'School',
      gname: 'Guardian',
      gph: '',
      st: 'Enrolled',
      date: 'Oct 23',
      note: '',
      acct: false,
      school_id: '2026000001',
      sec: 'B',
      semester: '1st Semester',
      academic_year: '2026-2027',
      log: [],
    };
    component.openAccount(applicant);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeNull();
    expect(component).not.toHaveProperty('accountPassword');
    component.accountSection = 'B';
    await component.createStudentAccount();
    expect(complete).toHaveBeenCalledWith('ENR-2026-ABC123', 'B');
    expect(applicant.acct).toBe(true);
    expect(component.accountApplicant).toBeNull();

    component.sel = applicant;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Resend Login Credentials');
    await component.resendCredentials(applicant);
    expect(resend).toHaveBeenCalledWith('ENR-2026-ABC123');
  });
});
