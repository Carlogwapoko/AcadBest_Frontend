import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [COMMON],
  styleUrl: './grades.component.css',
  templateUrl: './grades.component.html',
})
export class StudentGradesComponent {
  tab = 'g';
  sel: any = null;
  semesterFilter = 'All';
  termFilter = 'All';
  academicYearFilter = 'All';
  gradesPage = 1;
  schedulePage = 1;
  enrollmentPage = 1;
  constructor(
    public d: DataService,
    private a: AuthService,
  ) {}
  get s() {
    return this.a.student!;
  }
  get allRows() {
    return Object.entries(this.s.g).map(([code, g]) => {
      const avg = this.d.avg(g);
      const subject = this.d.subjects[code];
      const assignment =
        subject &&
        this.d
          .facultyAssignments(subject)
          .find(
            (item) =>
              item.semester === (subject.semester || this.s.semester) &&
              item.academic_year === (subject.academic_year || this.s.academic_year) &&
              (!item.session || item.session === 'All' || item.session === this.s.session) &&
              (!item.section || item.section === 'All' || item.section === this.s.sec),
          );
      return {
        code,
        ...subject,
        g,
        avg,
        sd: this.d.standing(avg),
        academic_year: assignment?.academic_year || subject?.academic_year || this.s.academic_year,
        assignment,
        instructorName:
          assignment?.faculty_name ||
          (assignment ? this.d.facName(assignment.faculty_id) : 'Unassigned'),
        section: assignment?.section || 'Not Assigned',
        scheduleDays: assignment?.days || '',
        scheduleTime:
          assignment?.start_time && assignment?.end_time
            ? `${assignment.start_time}–${assignment.end_time}`
            : '',
        scheduleRoom: assignment?.room || '',
      };
    });
  }
  get semesters() {
    return [
      'All',
      ...new Set(
        this.allRows.map((row) => row.semester).filter((value): value is string => !!value),
      ),
    ];
  }
  get terms() {
    return ['All', '1st Term', '2nd Term'];
  }
  get academicYears() {
    return [
      'All',
      ...new Set(
        [
          ...(this.s.academic_years || []),
          ...this.allRows.map((row) => row.academic_year),
          this.d.currentAcademicYear,
        ].filter((value): value is string => !!value),
      ),
    ];
  }
  get rows() {
    return this.allRows.filter(
      (row) =>
        (this.semesterFilter === 'All' || row.semester === this.semesterFilter) &&
        (this.termFilter === 'All' || row.term === this.termFilter) &&
        (this.academicYearFilter === 'All' || row.academic_year === this.academicYearFilter),
    );
  }
  get scheduleRows() {
    return this.rows.filter((row) => !!row.assignment);
  }
  get totalUnits() {
    return this.d.unitsOf(this.rows.map((row) => row.code));
  }
  resetPages() {
    this.gradesPage = 1;
    this.schedulePage = 1;
    this.enrollmentPage = 1;
  }
}
