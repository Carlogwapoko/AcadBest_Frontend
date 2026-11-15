import { ChangeDetectorRef, Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import {
  DataService,
  SectionOverview,
  SectionStudent,
  SectionSummary,
} from '../../../core/data.service';

@Component({
  selector: 'app-section-overview',
  standalone: true,
  imports: [COMMON],
  styleUrl: './section-overview.component.css',
  templateUrl: './section-overview.component.html',
})
export class SectionOverviewComponent {
  sections: SectionOverview[] = [];
  students: SectionStudent[] = [];
  summary: SectionSummary | undefined;
  selected: SectionOverview | null = null;
  search = '';
  semester = '';
  academicYear = '';
  sectionTotal = 0;
  semesterOptions: string[] = [];
  academicYearOptions: string[] = [];
  studentSearch = '';
  sectionPage = 1;
  studentTotal = 0;
  studentPage = 1;
  loading = false;
  studentsLoading = false;
  error = '';
  studentsError = '';
  private filterOptionsLoaded = false;
  private sectionSearchTimer?: ReturnType<typeof setTimeout>;
  private studentSearchTimer?: ReturnType<typeof setTimeout>;
  private sectionRequest = 0;
  private studentRequest = 0;

  constructor(
    public d: DataService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    void this.initialize();
  }

  get role(): 'staff' | 'faculty' {
    return this.auth.role === 'faculty' ? 'faculty' : 'staff';
  }

  private async initialize(): Promise<void> {
    try {
      await Promise.all([this.d.loadAcademicYear().catch(() => ''), this.load()]);
      if (
        this.d.currentAcademicYear &&
        this.academicYearOptions.includes(this.d.currentAcademicYear)
      ) {
        this.academicYear = this.d.currentAcademicYear;
        await this.load();
      }
    } catch {
      this.error = 'Sections could not be loaded. Check your connection and try again.';
      this.cdr.markForCheck();
    }
  }

  async load(page = 1): Promise<void> {
    const request = ++this.sectionRequest;
    this.loading = true;
    this.error = '';
    try {
      const optionsRequest = !this.filterOptionsLoaded
        ? this.d.loadSections(this.role, '', '', '', 1, 50)
        : Promise.resolve(null);
      const [result, options] = await Promise.all([
        this.d.loadSections(this.role, this.search, this.semester, this.academicYear, page, 10),
        optionsRequest,
      ]);
      if (request !== this.sectionRequest) return;
      this.sections = result.data;
      this.sectionPage = result.current_page;
      this.sectionTotal = result.total;
      this.summary = result.summary;
      if (options) {
        this.semesterOptions = [
          ...new Set(
            options.data
              .map((section) => section.semester)
              .filter((value): value is string => !!value),
          ),
        ].sort();
        this.academicYearOptions = [
          ...new Set(
            options.data
              .map((section) => section.academic_year)
              .filter((value): value is string => !!value),
          ),
        ].sort((a, b) => b.localeCompare(a));
        this.filterOptionsLoaded = true;
      }
    } catch {
      this.error = 'Sections could not be loaded. Check your connection and try again.';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async open(section: SectionOverview, page = 1): Promise<void> {
    this.studentPage = page;
    const request = ++this.studentRequest;
    this.selected = section;
    this.students = [];
    this.studentTotal = 0;
    this.studentsLoading = true;
    this.studentsError = '';
    try {
      const result = await this.d.loadSectionStudents(
        this.role,
        section,
        this.studentSearch,
        page,
        10,
      );
      if (request !== this.studentRequest) return;
      this.students = result.data;
      this.studentPage = result.current_page;
      this.studentTotal = result.total;
    } catch {
      this.studentsError = 'Students could not be loaded. Check your connection and try again.';
    } finally {
      this.studentsLoading = false;
      this.cdr.markForCheck();
    }
  }

  async searchStudents(): Promise<void> {
    if (this.selected) await this.open(this.selected, 1);
  }

  searchChanged(): void {
    if (this.sectionSearchTimer) clearTimeout(this.sectionSearchTimer);
    this.sectionSearchTimer = setTimeout(() => void this.load(), 250);
  }

  studentSearchChanged(): void {
    this.studentPage = 1;
    if (this.studentSearchTimer) clearTimeout(this.studentSearchTimer);
    this.studentSearchTimer = setTimeout(() => void this.searchStudents(), 250);
  }

  ngOnDestroy(): void {
    if (this.sectionSearchTimer) clearTimeout(this.sectionSearchTimer);
    if (this.studentSearchTimer) clearTimeout(this.studentSearchTimer);
  }
}
