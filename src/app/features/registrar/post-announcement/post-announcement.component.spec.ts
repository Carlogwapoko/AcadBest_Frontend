import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { PostAnnouncementComponent } from './post-announcement.component';

describe('PostAnnouncementComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostAnnouncementComponent],
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
    const fixture = TestBed.createComponent(PostAnnouncementComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps Publish available without a Clear action', () => {
    const fixture = TestBed.createComponent(PostAnnouncementComponent);
    fixture.detectChanges();
    const buttons = [...fixture.nativeElement.querySelectorAll('button')].map(
      (button: HTMLButtonElement) => button.textContent,
    );
    expect(buttons.some((label: string) => label?.includes('Publish'))).toBe(true);
    expect(buttons.some((label: string) => label?.trim() === 'Clear')).toBe(false);
  });

  it('shows an optional Valid until date field', () => {
    const fixture = TestBed.createComponent(PostAnnouncementComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const validUntilField = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-field'),
    ).find(
      (field) =>
        field.querySelector('.field-label')?.textContent?.trim() === 'Valid until (optional)',
    );

    expect(validUntilField?.querySelector('input[type="date"]')).toBeTruthy();
    component.f.t = 'Announcement title';
    component.f.m = 'Announcement message with enough characters.';
    component.f.end = '';
    expect(component.valid()).toBe(true);
    expect(component.build().end).toBe('');
  });

  it('supports multiple audiences, Staff targeting, and student-only filters', () => {
    const fixture = TestBed.createComponent(PostAnnouncementComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const labels = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.field-label')).map(
        (label) => label.textContent?.trim(),
      );
    const audienceControl = () => {
      const audienceLabel = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'),
      ).find((label) => label.textContent?.trim() === 'Audience');
      return audienceLabel?.closest('app-field') as HTMLElement;
    };
    const audienceList = () => {
      const trigger = audienceControl().querySelector('.select-trigger') as HTMLButtonElement;
      return document.getElementById(trigger.getAttribute('aria-controls')!)!;
    };
    const selectAudience = (audience: string) => {
      const control = audienceControl();
      const trigger = control.querySelector('.select-trigger') as HTMLButtonElement;
      if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
      fixture.detectChanges();
      Array.from(audienceList().querySelectorAll('.select-option'))
        .find((option) => option.textContent?.trim() === audience)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
    };
    selectAudience('Students');
    const audienceOptions = Array.from(audienceList().querySelectorAll('.select-option')).map(
      (option) => option.textContent?.trim(),
    );
    expect(audienceOptions).toEqual(
      expect.arrayContaining(['All Users', 'Students', 'Faculty', 'Staff']),
    );
    expect(labels()).toEqual(expect.arrayContaining(['Program', 'Year level', 'Section']));
    component.f.prog = 'BSIT';
    component.f.yr = '2';
    component.f.sec = 'A';
    selectAudience('Faculty');
    expect(component.build()).toEqual(
      expect.objectContaining({
        audience: ['students', 'faculty'],
        audienceCode: 'students_faculty',
        aud: 'Students & Faculty',
        prog: 'BSIT',
        yr: 2,
        sec: 'A',
      }),
    );
    selectAudience('Students');
    expect(labels()).not.toContain('Program');
    expect(labels()).not.toContain('Year level');
    expect(labels()).not.toContain('Section');
    expect(component.build()).toEqual(
      expect.objectContaining({
        audience: ['faculty'],
        audienceCode: 'faculty',
        prog: 'All',
        yr: 'All',
        sec: 'All',
      }),
    );
    selectAudience('Staff');
    expect(component.build().audienceCode).toBe('faculty_staff');
    selectAudience('All Users');
    expect(labels()).toEqual(expect.arrayContaining(['Program', 'Year level', 'Section']));
    expect(component.build()).toEqual(expect.objectContaining({ prog: 'BSIT', yr: 2, sec: 'A' }));

    const categoryLabel = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'),
    ).find((label) => label.textContent?.trim() === 'Category');
    (
      categoryLabel?.closest('app-field')?.querySelector('.select-trigger') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    Array.from(document.querySelectorAll('.select-option'))
      .find((option) => option.textContent?.trim() === 'Meeting')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(labels()).toEqual(expect.arrayContaining(['Message', 'Publish date']));
    expect(labels()).not.toContain('Meeting Time');
    expect(labels()).not.toContain('Venue');
    expect(labels()).not.toContain('Agenda');
    expect(labels()).not.toContain('Meeting Date');
    component.f.t = 'Faculty meeting';
    component.f.m = 'Discuss upcoming academic activities, meeting date, time, venue, and agenda.';
    expect(component.valid()).toBe(true);
    expect(component.build().dt).toBe(component.f.dt);
  });
});
