import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { ENROLLMENT_PROGRAMS, majorsForProgram } from '../../../shared/program-catalog';
import { EnrollmentSelectComponent, EnrollmentSelectOption } from './enrollment-select.component';

@Component({
  selector: 'app-enroll',
  standalone: true,
  imports: [COMMON, RouterLink, EnrollmentSelectComponent],
  styleUrl: './enroll.component.css',
  templateUrl: './enroll.component.html',
})
export class EnrollComponent {
  @ViewChild('card') card?: ElementRef<HTMLElement>;

  f: any = {
    fn: '', mn: '', ln: '', dob: '', sex: 'Select…', em: '', ph: '', ad: '',
    pr: 'Select…', yr: 'Select…', academic_year: '', major: '', semester: 'Select…',
    session: 'Select…', ty: 'Select…', sc: '', mother_fn: '', mother_mn: '',
    mother_ln: '', father_fn: '', father_mn: '', father_ln: '', gn: '', gp: '', ok: false,
  };
  e: Record<string, string> = {};
  step = 1;
  busy = false;
  yearLoading = true;
  ref = '';
  submitError = '';

  private readonly stepFields: Record<number, string[]> = {
    1: ['fn', 'ln', 'dob', 'sex', 'em', 'ph', 'ad'],
    2: ['academic_year', 'pr', 'yr', 'major', 'semester', 'session', 'ty', 'sc'],
    3: ['gn', 'gp', 'ok'],
  };

  constructor(private d: DataService, private ui: UiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.loadAcademicYear();
  }

  blank() {
    return {
      fn: '', mn: '', ln: '', dob: '', sex: 'Select…', em: '', ph: '', ad: '',
      pr: 'Select…', yr: 'Select…', academic_year: this.d.currentAcademicYear, major: '',
      semester: 'Select…', session: 'Select…', ty: 'Select…', sc: '', mother_fn: '',
      mother_mn: '', mother_ln: '', father_fn: '', father_mn: '', father_ln: '',
      gn: '', gp: '', ok: false,
    };
  }

  get programs(): readonly string[] {
    return ENROLLMENT_PROGRAMS;
  }

  get genderOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select gender', value: 'Select…' },
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
      { label: 'Others', value: 'Others' },
    ];
  }

  get programOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select a program', value: 'Select…' },
      ...this.programs.map(program => ({ label: program, value: program })),
    ];
  }

  get yearLevelOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select a year level', value: 'Select…' },
      { label: '1st Year', value: '1' },
      { label: '2nd Year', value: '2' },
      { label: '3rd Year', value: '3' },
      { label: '4th Year', value: '4' },
      { label: 'Grade 11', value: '11' },
      { label: 'Grade 12', value: '12' },
    ];
  }

  get majorOptions(): EnrollmentSelectOption[] {
    return [{ label: 'Select a major', value: '' }, ...this.majors.map(major => ({ label: major, value: major }))];
  }

  get semesterOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select a semester', value: 'Select…' },
      { label: '1st Semester', value: '1st Semester' },
      { label: '2nd Semester', value: '2nd Semester' },
    ];
  }

  get sessionOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select a session', value: 'Select…' },
      { label: 'Afternoon', value: 'Afternoon' },
      { label: 'Evening', value: 'Evening' },
      { label: 'Weekends', value: 'Weekends' },
    ];
  }

  get studentTypeOptions(): EnrollmentSelectOption[] {
    return [
      { label: 'Select a student type', value: 'Select…' },
      { label: 'New Student', value: 'New Student' },
      { label: 'Transferee', value: 'Transferee' },
      { label: 'Returning', value: 'Returning' },
    ];
  }

  get majors(): string[] {
    return majorsForProgram(this.f.pr);
  }

  get stepTitle(): string {
    return ['Personal Information', 'Academic Information', 'Parent/Guardian Information', 'Review & Submit'][this.step - 1];
  }

  programChanged(): void {
    this.f.major = '';
  }

  nextStep(): void {
    if (this.step >= 4 || (this.step === 2 && this.yearLoading) || !this.validateStep(this.step)) return;
    this.step++;
    this.cdr.markForCheck();
    this.scrollToCard();
  }

  previousStep(): void {
    if (this.step <= 1) return;
    this.step--;
    this.cdr.markForCheck();
    this.scrollToCard();
  }

  handleEnter(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') return;
    event.preventDefault();
    if (this.step === 4) void this.submit();
    else this.nextStep();
  }

  async submit(): Promise<void> {
    if (this.busy || this.yearLoading) return;
    const errors = this.validationErrors();
    this.e = errors;
    const firstInvalidStep = [1, 2, 3].find(step =>
      this.stepFields[step].some(field => errors[field]),
    );
    if (firstInvalidStep) {
      this.step = firstInvalidStep;
      this.scrollToCard();
      this.ui.toast('Please fix the highlighted fields.', 'er');
      return;
    }

    this.busy = true;
    this.submitError = '';
    this.ref = '';
    this.cdr.markForCheck();

    try {
      const f = this.f;
      this.ref = await this.d.submitEnrollment({
        first_name: f.fn.trim(),
        last_name: f.ln.trim(),
        middle_name: f.mn.trim() || null,
        academic_year: f.academic_year.trim(),
        mother_first_name: f.mother_fn.trim() || null,
        mother_middle_name: f.mother_mn.trim() || null,
        mother_last_name: f.mother_ln.trim() || null,
        father_first_name: f.father_fn.trim() || null,
        father_middle_name: f.father_mn.trim() || null,
        father_last_name: f.father_ln.trim() || null,
        email: f.em.trim().toLowerCase(),
        phone: f.ph,
        date_of_birth: f.dob,
        sex: f.sex,
        address: f.ad.trim(),
        program: f.pr,
        major: this.majors.length ? f.major : null,
        year_level: +f.yr,
        semester: f.semester,
        session: f.session,
        application_type: f.ty,
        previous_school: f.sc.trim(),
        guardian_name: f.gn.trim(),
        guardian_phone: f.gp,
        certified: f.ok,
      });
      this.f = this.blank();
      this.e = {};
      this.step = 1;
      this.ui.toast(`Application submitted. Reference number: ${this.ref}`);
      this.scrollToCard();
    } catch (error) {
      this.submitError = this.message(error);
      this.ui.toast(this.submitError, 'er');
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  private validateStep(step: number): boolean {
    const errors = this.validationErrors();
    const fields = this.stepFields[step];
    this.e = Object.fromEntries(fields.map(field => [field, errors[field] ?? '']));
    if (fields.some(field => errors[field])) {
      this.ui.toast('Please fix the highlighted fields.', 'er');
      return false;
    }
    return true;
  }

  private validationErrors(): Record<string, string> {
    const f = this.f;
    const phonePattern = /^[0-9 +]{10,15}$/;
    const selectError = (value: string) => value === 'Select…' ? 'Please select an option.' : '';
    return {
      fn: f.fn.trim().length < 2 ? 'First name is required.' : '',
      ln: f.ln.trim().length < 2 ? 'Last name is required.' : '',
      academic_year: /^\d{4}-\d{4}$/.test(f.academic_year)
        && Number(f.academic_year.slice(5)) === Number(f.academic_year.slice(0, 4)) + 1
        ? '' : 'Enter a valid academic year, such as 2026-2027.',
      dob: !f.dob ? 'Date of birth is required.' : f.dob >= this.d.today ? 'Enter a valid date of birth.' : '',
      sex: selectError(f.sex),
      em: /^\S+@\S+\.\S+$/.test(f.em) ? '' : 'Enter a valid e-mail address.',
      ph: phonePattern.test(f.ph) ? '' : 'Enter a valid mobile number.',
      ad: f.ad.trim().length < 5 ? 'Home address is required.' : '',
      pr: selectError(f.pr),
      yr: selectError(f.yr),
      major: this.majors.length && !this.majors.includes(f.major)
        ? 'Please select a major for the selected program.' : '',
      semester: selectError(f.semester),
      session: selectError(f.session),
      ty: selectError(f.ty),
      sc: f.sc.trim().length < 3 ? 'Last school attended is required.' : '',
      gn: f.gn.trim().length < 3 ? 'Guardian name is required.' : '',
      gp: phonePattern.test(f.gp) ? '' : 'Enter a valid contact number.',
      ok: f.ok ? '' : 'You must certify your information.',
    };
  }

  private async loadAcademicYear(): Promise<void> {
    try {
      this.f.academic_year = await this.d.loadAcademicYear();
    } catch (error) {
      this.ui.toast(this.message(error), 'er');
    } finally {
      this.yearLoading = false;
      this.cdr.markForCheck();
    }
  }

  private scrollToCard(): void {
    requestAnimationFrame(() => {
      const card = this.card?.nativeElement;
      if (card && typeof card.scrollIntoView === 'function') {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  private message(error: unknown): string {
    const value = (error as { error?: { message?: string } })?.error?.message;
    return value || (error instanceof Error ? error.message : 'The application could not be submitted.');
  }
}
