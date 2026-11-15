import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { StudentGradesComponent } from './grades.component';

describe('StudentGradesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGradesComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '',
      role: 'Student',
      act: true,
    };
    TestBed.inject(AuthService).user!.sid = 1;
    TestBed.inject(DataService).students = [
      { id: 1, name: 'Test User', prog: 'BSIT', yr: 1, sec: 'A', g: {} },
    ];
  });

  it('creates and renders the standalone component', () => {
    const fixture = TestBed.createComponent(StudentGradesComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('filters the subject list by semester and academic year', () => {
    const data = TestBed.inject(DataService);
    data.subjects = {
      IT101: {
        n: 'First Term',
        u: 3,
        d: 'Mon/Wed',
        tm: '8:00–9:30',
        start: '08:00',
        end: '09:30',
        r: 'Room 1',
        p: 'BSIT',
        y: 1,
        f: null,
        semester: '1st Semester',
        term: '1st Term',
        academic_year: '2026-2027',
      },
      IT202: {
        n: 'Second Term',
        u: 3,
        d: 'Tue/Thu',
        tm: '8:00–9:30',
        start: '08:00',
        end: '09:30',
        r: 'Room 2',
        p: 'BSIT',
        y: 1,
        f: null,
        semester: '2nd Semester',
        term: '2nd Term',
        academic_year: '2026-2027',
      },
    };
    data.students = [
      {
        id: 1,
        name: 'Test User',
        prog: 'BSIT',
        yr: 1,
        sec: 'A',
        g: {
          IT101: [85, null, null],
          IT202: [90, null, null],
        },
      },
    ];
    const component = TestBed.createComponent(StudentGradesComponent).componentInstance;
    component.semesterFilter = '2nd Semester';
    component.termFilter = '2nd Term';

    expect(component.rows.map((subject) => subject.code)).toEqual(['IT202']);
    expect(component.totalUnits).toBe(3);
  });

  it('shows the instructor assigned to the student section in the schedule and subject information', () => {
    const data = TestBed.inject(DataService);
    data.subjects = {
      IT301: {
        n: 'Integrative Programming',
        u: 3,
        d: 'Mon/Wed',
        tm: '08:00–09:30',
        start: '08:00',
        end: '09:30',
        r: 'Lab 2',
        p: 'BSIT',
        y: 1,
        f: 7,
        semester: '1st Semester',
        term: '2nd Term',
        academic_year: '2026-2027',
        faculty_assignments: [
          {
            faculty_id: 8,
            faculty_name: 'Wrong Section Instructor',
            semester: '1st Semester',
            academic_year: '2026-2027',
            section: 'B',
            session: 'Weekends',
          },
          {
            faculty_id: 7,
            faculty_name: 'Assigned Instructor',
            semester: '1st Semester',
            academic_year: '2026-2027',
            section: 'A',
            session: 'Weekends',
          },
        ],
      },
    };
    data.students = [
      {
        id: 1,
        name: 'Test User',
        prog: 'BSIT',
        yr: 1,
        sec: 'A',
        session: 'Weekends',
        semester: '1st Semester',
        academic_year: '2026-2027',
        g: { IT301: [85, 90, 95] },
      },
    ];

    const fixture = TestBed.createComponent(StudentGradesComponent);
    const component = fixture.componentInstance;
    component.tab = 's';
    fixture.detectChanges();

    expect(component.scheduleRows[0].instructorName).toBe('Assigned Instructor');
    expect(fixture.nativeElement.textContent).toContain('Instructor Name');
    expect(fixture.nativeElement.textContent).toContain('Assigned Instructor');
    expect(fixture.nativeElement.textContent).not.toContain('Wrong Section Instructor');
    expect(fixture.nativeElement.textContent).toContain('2nd Term');

    (fixture.nativeElement.querySelector('tr.cl') as HTMLTableRowElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Subject info');
    expect(fixture.nativeElement.textContent).toContain('Assigned Instructor');
  });

  it('renders enrollment details and registered subjects in organized sections', () => {
    const data = TestBed.inject(DataService);
    data.subjects = {
      IT301: {
        n: 'Integrative Programming',
        u: 3,
        d: 'Mon/Wed',
        tm: '08:00–09:30',
        start: '08:00',
        end: '09:30',
        r: 'Lab 2',
        p: 'BSIT',
        y: 1,
        f: null,
        term: '1st Term',
      },
    };
    data.students = [
      {
        id: 1,
        name: 'Test User',
        prog: 'BSIT',
        yr: 1,
        sec: 'A',
        school_id: '1234567890',
        academic_year: '2026-2027',
        session: 'Afternoon',
        g: { IT301: [85, 90, 95] },
      },
    ];
    const fixture = TestBed.createComponent(StudentGradesComponent);
    fixture.componentInstance.tab = 'e';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.enrollment-summary')).toBeTruthy();
    expect(element.querySelectorAll('.enrollment-summary-card')).toHaveLength(4);
    expect(element.querySelector('.enrollment-units-badge')?.textContent).toContain(
      '3 total units',
    );
    expect(element.querySelector('.student-record-table')?.textContent).toContain(
      'Integrative Programming',
    );
    expect(element.textContent).toContain('Enrollment overview');
  });
});
