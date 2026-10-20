import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { PostAnnouncementComponent } from './post-announcement.component';

describe('PostAnnouncementComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[PostAnnouncementComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(PostAnnouncementComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps Publish available without a Clear action',()=>{
    const fixture=TestBed.createComponent(PostAnnouncementComponent);
    fixture.detectChanges();
    const buttons=[...fixture.nativeElement.querySelectorAll('button')].map((button:HTMLButtonElement)=>button.textContent);
    expect(buttons.some((label:string)=>label?.includes('Publish'))).toBe(true);
    expect(buttons.some((label:string)=>label?.trim()==='Clear')).toBe(false);
  });
});
