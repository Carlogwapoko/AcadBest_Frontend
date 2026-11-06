import { ChangeDetectorRef, Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService, SectionOverview, SectionStudent, SectionSummary } from '../../../core/data.service';

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
  semesterOptions: string[] = [];
  academicYearOptions: string[] = [];
  studentSearch = '';
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
      await Promise.all([
        this.d.loadAcademicYear().catch(() => ''),
        this.load(),
      ]);
      if (this.d.currentAcademicYear && this.academicYearOptions.includes(this.d.currentAcademicYear)) {
        this.academicYear = this.d.currentAcademicYear;
        await this.load();
      }
    } catch {
      this.error = 'Sections could not be loaded. Check your connection and try again.';
      this.cdr.markForCheck();
    }
  }

  async load(): Promise<void> {
    const request = ++this.sectionRequest;
    this.loading = true;
    this.error = '';
    try {
      const result = await this.d.loadSections(this.role, this.search, this.semester, this.academicYear);
      if (request !== this.sectionRequest) return;
      this.sections = result.data;
      this.summary = result.summary;
      if (!this.filterOptionsLoaded && !this.semester && !this.academicYear && !this.search) {
        this.semesterOptions = [...new Set(
          result.data.map(section => section.semester).filter((value): value is string => !!value)
        )].sort();
        this.academicYearOptions = [...new Set(
          result.data.map(section => section.academic_year).filter((value): value is string => !!value)
        )].sort((a, b) => b.localeCompare(a));
        this.filterOptionsLoaded = true;
      }
    } catch {
      this.error = 'Sections could not be loaded. Check your connection and try again.';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async open(section: SectionOverview): Promise<void> {
    const request = ++this.studentRequest;
    this.selected = section;
    this.students = [];
    this.studentsLoading = true;
    this.studentsError = '';
    try {
      const result = await this.d.loadSectionStudents(this.role, section, this.studentSearch);
      if (request !== this.studentRequest) return;
      this.students = result.data;
    } catch {
      this.studentsError = 'Students could not be loaded. Check your connection and try again.';
    } finally {
      this.studentsLoading = false;
      this.cdr.markForCheck();
    }
  }

  async searchStudents(): Promise<void> {
    if (this.selected) await this.open(this.selected);
  }

  searchChanged(): void {
    if (this.sectionSearchTimer) clearTimeout(this.sectionSearchTimer);
    this.sectionSearchTimer = setTimeout(() => void this.load(), 250);
  }

  studentSearchChanged(): void {
    if (this.studentSearchTimer) clearTimeout(this.studentSearchTimer);
    this.studentSearchTimer = setTimeout(() => void this.searchStudents(), 250);
  }

  ngOnDestroy(): void {
    if (this.sectionSearchTimer) clearTimeout(this.sectionSearchTimer);
    if (this.studentSearchTimer) clearTimeout(this.studentSearchTimer);
  }
}
