import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ProfileComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('renders read-only profile information for every role',()=>{
    const auth=TestBed.inject(AuthService);
    for(const role of ['Student','Faculty','Registrar Staff','Admin']){
      auth.user={id:1,name:`Test ${role}`,email:'test@example.com',phone:'',role,act:true};
      const fixture=TestBed.createComponent(ProfileComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(auth.user?.name);
      expect(fixture.nativeElement.querySelector('.profile-heading .chip')?.textContent).toBe(role);
      expect(fixture.nativeElement.querySelector('.edit-button')).toBeNull();
      expect(fixture.nativeElement.querySelector('#profile-picture')).toBeNull();
      expect(fixture.nativeElement.querySelector('input')).toBeNull();

      fixture.destroy();
    }
  });

  it('displays a profile picture managed by an administrator',()=>{
    const auth=TestBed.inject(AuthService);
    const avatar='data:image/webp;base64,dGVzdA==';
    auth.user={id:1,name:'Test Student',email:'student@example.com',phone:'',role:'Student',act:true,avatar};

    const fixture=TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.profile-avatar img')?.getAttribute('src')).toBe(avatar);
    expect(fixture.nativeElement.querySelector('.profile-details')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile-note')?.textContent)
      .toContain('managed by the school administrator');
  });
});
