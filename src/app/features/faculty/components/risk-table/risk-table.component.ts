import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { COMMON } from '../../../../shared/common';
import { DataService, Student } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';

@Component({
  selector: 'app-risk-table',
  standalone: true,
  imports: [COMMON],
  styleUrl: './risk-table.component.css',
  templateUrl: './risk-table.component.html',
})
export class RiskTableComponent {
  @Input() items: Student[] = [];
  @Input() loading = false;
  sel: Student | null = null;
  page = 1;
  subjectPage = 1;
  busy = false;
  constructor(
    public d: DataService,
    private ui: UiService,
    private cdr: ChangeDetectorRef,
  ) {}
  incompleteSubjects(student: Student): string[] {
    return this.d.codes(student).filter((code) => this.d.avg(student.g[code] || []) === null);
  }
  openStudent(student: Student) {
    this.sel = student;
    this.subjectPage = 1;
  }
  async remind() {
    if (this.busy || !this.sel) return;
    const student = this.sel;
    const subjectCodes = this.incompleteSubjects(student);
    if (!subjectCodes.length) {
      this.ui.toast('No incomplete subject was found for this student.', 'er');
      return;
    }
    this.busy = true;
    try {
      const result = await this.d.sendAlert(
        student.id,
        'At-Risk Advising Reminder',
        'Your instructor asked you to meet for academic advising.',
        subjectCodes,
      );
      if (result.duplicate && !result.email_sent) {
        this.ui.toast('This reminder was already sent.', 'er');
        return;
      }
      if (!result.email_sent) {
        this.ui.toast('Portal reminder sent, but the e-mail could not be delivered.', 'er');
        return;
      }
      this.ui.toast(
        result.duplicate
          ? 'Reminder e-mail sent to ' + student.name + '.'
          : 'Reminder sent to ' + student.name + '.',
      );
      this.sel = null;
    } catch (error) {
      this.ui.toast(
        (error as { error?: { message?: string } })?.error?.message ||
          (error instanceof Error ? error.message : 'Reminder could not be sent.'),
        'er',
      );
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
}
