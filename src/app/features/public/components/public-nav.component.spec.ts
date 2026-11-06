import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicNavComponent } from './public-nav.component';

describe('PublicNavComponent', () => {
  let originalBodyOverflow: string;

  beforeEach(async () => {
    originalBodyOverflow = document.body.style.overflow;
    await TestBed.configureTestingModule({
      imports: [PublicNavComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyOverflow;
  });

  it('opens the mobile menu and locks background scrolling', () => {
    const fixture = TestBed.createComponent(PublicNavComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Close navigation menu');
    expect(document.body.style.overflow).toBe('hidden');
    expect(fixture.nativeElement.querySelectorAll('#public-nav-links > a')).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.mobile-actions .btn')).toHaveLength(2);
    fixture.destroy();
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
  });

  it('closes on outside click and Escape', () => {
    const fixture = TestBed.createComponent(PublicNavComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.menuOpen).toBe(false);
    expect(document.body.style.overflow).toBe(originalBodyOverflow);

    toggle.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.menuOpen).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fixture.destroy();
  });

  it('closes after selecting a navigation link', () => {
    const fixture = TestBed.createComponent(PublicNavComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#public-nav-links a') as HTMLAnchorElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.menuOpen).toBe(false);
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
    fixture.destroy();
  });
});
