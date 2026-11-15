import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { DataService } from '../../../../core/data.service';
import { UiService } from '../../../../core/ui.service';
import { RiskTableComponent } from './risk-table.component';

describe('RiskTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskTableComponent],
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
    const fixture = TestBed.createComponent(RiskTableComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('sends an advising reminder for incomplete subjects', async () => {
    const data = TestBed.inject(DataService);
    const ui = TestBed.inject(UiService);
    const sendAlert = vi.spyOn(data, 'sendAlert').mockResolvedValue({
      sent: true,
      duplicate: false,
      email_sent: true,
    });
    const toast = vi.spyOn(ui, 'toast');
    const fixture = TestBed.createComponent(RiskTableComponent);
    const student = {
      id: 5,
      name: 'Student Example',
      prog: 'BSIT',
      yr: 1,
      sec: 'A',
      g: { IT101: [65, null, null] },
    };
    fixture.componentInstance.openStudent(student);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Send Reminder');
    await fixture.componentInstance.remind();
    await fixture.whenStable();

    expect(sendAlert).toHaveBeenCalledWith(
      student.id,
      'At-Risk Advising Reminder',
      'Your instructor asked you to meet for academic advising.',
      ['IT101'],
    );
    expect(toast).toHaveBeenCalledWith('Reminder sent to Student Example.');
    expect(fixture.componentInstance.sel).toBeNull();
    expect(fixture.componentInstance.busy).toBe(false);
  });

  it('keeps the modal open and resets busy after an error so the reminder can be retried', async () => {
    const data = TestBed.inject(DataService);
    const ui = TestBed.inject(UiService);
    const sendAlert = vi
      .spyOn(data, 'sendAlert')
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({ sent: true, duplicate: false, email_sent: true });
    const toast = vi.spyOn(ui, 'toast');
    const fixture = TestBed.createComponent(RiskTableComponent);
    const student = {
      id: 5,
      name: 'Student Example',
      prog: 'BSIT',
      yr: 1,
      sec: 'A',
      g: { IT101: [65, null, null] },
    };
    fixture.componentInstance.openStudent(student);

    await fixture.componentInstance.remind();

    expect(fixture.componentInstance.sel).toBe(student);
    expect(fixture.componentInstance.busy).toBe(false);
    expect(toast).toHaveBeenCalledWith('Network unavailable', 'er');

    await fixture.componentInstance.remind();

    expect(sendAlert).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.sel).toBeNull();
    expect(fixture.componentInstance.busy).toBe(false);
  });

  it('prevents duplicate submissions while a reminder is sending', async () => {
    const data = TestBed.inject(DataService);
    let finish!: (result: { sent: boolean; duplicate: boolean; email_sent: boolean }) => void;
    const sendAlert = vi.spyOn(data, 'sendAlert').mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const fixture = TestBed.createComponent(RiskTableComponent);
    fixture.componentInstance.openStudent({
      id: 5,
      name: 'Student Example',
      prog: 'BSIT',
      yr: 1,
      sec: 'A',
      g: { IT101: [65, null, null] },
    });

    const sending = fixture.componentInstance.remind();
    expect(fixture.componentInstance.busy).toBe(true);
    await fixture.componentInstance.remind();
    expect(sendAlert).toHaveBeenCalledTimes(1);

    finish({ sent: true, duplicate: false, email_sent: true });
    await sending;
    expect(fixture.componentInstance.sel).toBeNull();
    expect(fixture.componentInstance.busy).toBe(false);
  });

  it('keeps the modal open when the portal reminder is saved but email delivery fails', async () => {
    const data = TestBed.inject(DataService);
    const ui = TestBed.inject(UiService);
    const toast = vi.spyOn(ui, 'toast');
    vi.spyOn(data, 'sendAlert').mockResolvedValue({
      sent: true,
      duplicate: false,
      email_sent: false,
    });
    const fixture = TestBed.createComponent(RiskTableComponent);
    const student = {
      id: 5,
      name: 'Student Example',
      prog: 'BSIT',
      yr: 1,
      sec: 'A',
      g: { IT101: [65, null, null] },
    };
    fixture.componentInstance.openStudent(student);

    await fixture.componentInstance.remind();

    expect(fixture.componentInstance.sel).toBe(student);
    expect(fixture.componentInstance.busy).toBe(false);
    expect(toast).toHaveBeenCalledWith(
      'Portal reminder sent, but the e-mail could not be delivered.',
      'er',
    );
  });
});
