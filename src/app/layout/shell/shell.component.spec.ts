import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ShellComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
    const notificationLink:HTMLAnchorElement|null=fixture.nativeElement.querySelector('.notification-link');
    expect(notificationLink?.getAttribute('href')).toBe('/app/student/notifications');
    expect(fixture.nativeElement.querySelector('#sidebar a[href="/app/student/notifications"]')).toBeNull();
    const mobileNav:HTMLElement|null=fixture.nativeElement.querySelector('.mobile-nav');
    expect(mobileNav?.getAttribute('aria-label')).toBe('Primary navigation');
    expect(mobileNav?.querySelectorAll('.mobile-nav-item').length).toBe(4);
    expect(mobileNav?.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.querySelector('#sidebar .hb')).toBeNull();
    expect(fixture.nativeElement.querySelector('#sidebar .desktop-logout')?.textContent).toContain('Log Out');
    const profileTrigger:HTMLButtonElement=fixture.nativeElement.querySelector('.profile-menu .av');
    profileTrigger.click();
    fixture.detectChanges();
    expect(profileTrigger.getAttribute('aria-expanded')).toBe('true');
    const profileMenu:HTMLElement=fixture.nativeElement.querySelector('#profile-actions');
    expect(profileMenu.querySelector('.profile-user')?.textContent).toContain('Test User');
    expect(profileMenu.querySelector('.profile-user')?.textContent).toContain('test@example.com');
    expect(profileMenu.querySelector('.profile-user')?.textContent).toContain('Student');
    expect(profileMenu.querySelector('.profile-logout')?.textContent).toContain('Log Out');
    expect(profileMenu.querySelector('a[role="menuitem"]')?.textContent).toContain('My Profile');
    expect(profileMenu.lastElementChild).toBe(profileMenu.querySelector('.profile-logout'));
  });
});
