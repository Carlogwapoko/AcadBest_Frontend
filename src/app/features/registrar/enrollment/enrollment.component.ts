import { ChangeDetectorRef, Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { DataService, Enr } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

// ------------------------------------------------------------ Enrollment applications
@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [COMMON],
  styleUrl: './enrollment.component.css',
  templateUrl: './enrollment.component.html',
})
export class EnrollmentComponent {
  q = '';
  st = 'All';
  sel: Enr | null = null;
  rejecting = false;
  reason = '';
  err = '';
  page = 1;
  lastPage = 1;
  total = 0;
  loading = false;
  loadError = '';
  busy = false;
  accountApplicant: Enr | null = null;
  accountSection = '';
  accountBusy = false;
  resendingCredentials = false;
  accountError = '';
  editingParents = false;
  parentBusy = false;
  parentError = '';
  parentForm = {
    mother_first_name: '',
    mother_middle_name: '',
    mother_last_name: '',
    father_first_name: '',
    father_middle_name: '',
    father_last_name: '',
  };
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    public d: DataService,
    private ui: UiService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    void this.loadPage();
  }
  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }
  async loadPage(page = 1) {
    if (this.loading && page > this.page) return;
    this.loading = true;
    this.loadError = '';
    try {
      const result = await this.d.loadEnrollments(page, this.q, this.st, 10);
      this.page = result.current_page;
      this.lastPage = result.last_page;
      this.total = result.total;
    } catch (error) {
      this.loadError = this.message(error);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
  searchChanged() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.loadPage(1), 300);
  }
  filtersChanged() {
    void this.loadPage(1);
  }
  chip(s: string) {
    return ({ Pending: 'wn', Enrolled: 'ok', Rejected: 'er' } as any)[s] || '';
  }
  statusIcon(s: string) {
    return s === 'Rejected' ? 'alert' : s === 'Pending' || s === 'Under Review' ? 'clock' : 'check';
  }
  parentName(first?: string | null, middle?: string | null, last?: string | null) {
    return [first, middle, last].filter((part): part is string => !!part?.trim()).join(' ') || '—';
  }
  editParents() {
    if (!this.sel) return;
    this.parentForm = {
      mother_first_name: this.sel.mother_first_name || '',
      mother_middle_name: this.sel.mother_middle_name || '',
      mother_last_name: this.sel.mother_last_name || '',
      father_first_name: this.sel.father_first_name || '',
      father_middle_name: this.sel.father_middle_name || '',
      father_last_name: this.sel.father_last_name || '',
    };
    this.parentError = '';
    this.editingParents = true;
  }
  async saveParents() {
    if (this.parentBusy || !this.sel) return;
    this.parentBusy = true;
    this.parentError = '';
    try {
      await this.d.updateEnrollmentParents(this.sel.ref, {
        mother_first_name: this.parentForm.mother_first_name.trim() || null,
        mother_middle_name: this.parentForm.mother_middle_name.trim() || null,
        mother_last_name: this.parentForm.mother_last_name.trim() || null,
        father_first_name: this.parentForm.father_first_name.trim() || null,
        father_middle_name: this.parentForm.father_middle_name.trim() || null,
        father_last_name: this.parentForm.father_last_name.trim() || null,
      });
      Object.assign(this.sel, this.parentForm, {
        mother_first_name: this.parentForm.mother_first_name.trim() || null,
        mother_middle_name: this.parentForm.mother_middle_name.trim() || null,
        mother_last_name: this.parentForm.mother_last_name.trim() || null,
        father_first_name: this.parentForm.father_first_name.trim() || null,
        father_middle_name: this.parentForm.father_middle_name.trim() || null,
        father_last_name: this.parentForm.father_last_name.trim() || null,
      });
      this.editingParents = false;
      this.ui.toast('Parent names updated.');
    } catch (error) {
      this.parentError = this.message(error);
    } finally {
      this.parentBusy = false;
      this.cdr.markForCheck();
    }
  }
  get list() {
    return this.d.enrollments;
  }
  async set(s: string, note?: string, application: Enr | null = this.sel) {
    if (this.busy || !application) return;
    const e = application;
    this.busy = true;
    if (
      !(await this.ui.confirm(
        s == 'Enrolled' ? 'Approve enrollment?' : 'Update application?',
        `${e.name} will be marked “${s}”.`,
        'Confirm',
        s == 'Rejected',
      ))
    ) {
      this.busy = false;
      this.cdr.markForCheck();
      return;
    }
    try {
      await this.d.updateEnrollment(e.ref, s, note);
      await this.loadPage(this.page);
      this.ui.toast(`${e.ref} is now ${s}.`);
      if (this.sel?.ref === e.ref) this.sel = null;
      this.rejecting = false;
      this.reason = '';
      this.err = '';
    } catch (error) {
      this.ui.toast(this.message(error), 'er');
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
  approveEnrollment(application: Enr) {
    void this.set('Enrolled', undefined, application);
  }
  openAccount(application: Enr) {
    if (application.st !== 'Enrolled' || application.acct) {
      this.ui.toast(
        'Approve the enrollment before creating a student account.',
        'er',
      );
      return;
    }
    this.accountApplicant = application;
    this.accountSection = application.sec || '';
    this.accountError = '';
    this.sel = null;
  }
  async createStudentAccount() {
    const application = this.accountApplicant;
    if (this.accountBusy || !application) return;
    this.accountError = !this.accountSection ? 'Choose an available section.' : '';
    if (this.accountError) return;
    this.accountBusy = true;
    try {
      const result = await this.d.completeEnrollment(application.ref, this.accountSection);
      Object.assign(application, {
        st: result.status,
        acct: result.account_issued,
        sec: result.section,
        school_id: result.school_id,
        student_status: 'New Student',
      });
      this.ui.toast(
        `Student account created. Credentials are being sent to ${application.email}; resend them from the application details if they do not arrive.`,
      );
      this.accountApplicant = null;
    } catch (error) {
      this.accountError = this.message(error);
    } finally {
      this.accountBusy = false;
      this.cdr.markForCheck();
    }
  }
  async resendCredentials(application: Enr) {
    if (this.resendingCredentials || !application.acct) return;
    this.resendingCredentials = true;
    try {
      const result = await this.d.resendEnrollmentCredentials(application.ref);
      this.ui.toast(`Login credentials sent to ${result.email}.`);
    } catch (error) {
      this.ui.toast(this.message(error), 'er');
    } finally {
      this.resendingCredentials = false;
      this.cdr.markForCheck();
    }
  }
  reject() {
    this.err = this.reason.trim().length < 5 ? 'Please give a reason (at least 5 characters).' : '';
    if (!this.err) this.set('Rejected', this.reason.trim());
  }
  private message(error: unknown) {
    const value = (error as { error?: { message?: string; errors?: Record<string, string[]> } })
      ?.error;
    return value?.errors
      ? Object.values(value.errors).flat()[0]
      : value?.message ||
          (error instanceof Error ? error.message : 'Application status could not be updated.');
  }
}
