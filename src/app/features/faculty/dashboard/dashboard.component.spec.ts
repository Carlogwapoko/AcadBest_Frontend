import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { FacultyDashboardComponent } from './dashboard.component';

describe('FacultyDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyDashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '',
      role: 'Faculty',
      act: true,
    };
  });

  it('creates and renders the standalone component', () => {
    const fixture = TestBed.createComponent(FacultyDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('displays the subject term in the weekly schedule', () => {
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
        f: 1,
        semester: '1st Semester',
        term: '2nd Term',
        faculty_assignments: [
          {
            faculty_id: 1,
            semester: '1st Semester',
            academic_year: '2026-2027',
            section: 'A',
            session: 'Afternoon',
          },
        ],
      },
    };

    const fixture = TestBed.createComponent(FacultyDashboardComponent);
    fixture.detectChanges();

    const table = (fixture.nativeElement as HTMLElement).querySelector('.schedule-table');
    expect(table?.textContent).toContain('Term');
    expect(table?.textContent).toContain('2nd Term');
    expect(table?.querySelector('td[data-label="Term"]')?.textContent?.trim()).toBe('2nd Term');
  });
});
