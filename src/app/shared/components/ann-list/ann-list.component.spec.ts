import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AnnListComponent } from './ann-list.component';

describe('AnnListComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AnnListComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(AnnListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('renders the supplied empty-state message with an icon',()=>{
    const fixture=TestBed.createComponent(AnnListComponent);
    fixture.componentInstance.emptyMessage='No records found. No announcements are available for your program, year, and section.';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.eic app-icon')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('No records found. No announcements are available for your program, year, and section.');
  });

  it('shows audience and category indicators for announcements',()=>{
    const fixture=TestBed.createComponent(AnnListComponent);
    fixture.componentInstance.items=[{
      id:1,t:'Faculty meeting',m:'Discuss the upcoming academic activities.',
      aud:'Faculty & Staff Only',audience:'faculty_staff',category:'Urgent',pr:'High',
      by:'Registrar',d:'Nov 06',dt:'2026-11-06',prog:'All',yr:'All',sec:'All',
    }];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Faculty & Staff Only');
    expect(fixture.nativeElement.querySelector('.priority-urgent')).toBeTruthy();
  });

  it('keeps the title, wrapped badges, and date in separate list rows',()=>{
    const fixture=TestBed.createComponent(AnnListComponent);
    fixture.componentInstance.items=[{
      id:1,t:'A long announcement title that should wrap without overlapping its badges',
      m:'Announcement message.',aud:'All Users',audience:'all_users',category:'General',pr:'Normal',
      by:'Registrar',d:'Nov 06',dt:'2026-11-06',prog:'All',yr:'All',sec:'All',
    }];
    fixture.detectChanges();

    const item=fixture.nativeElement.querySelector('.announcement-item');
    expect(item.querySelector('.announcement-title')?.textContent).toContain('A long announcement title');
    expect(item.querySelector('.announcement-badges')?.textContent).toContain('All Users');
    expect(item.querySelector('.announcement-badges')?.textContent).toContain('General');
    expect(item.querySelector('.announcement-date')?.textContent).toContain('Nov 06');
    expect(item.querySelector('.announcement-title')?.nextElementSibling)
      .toBe(item.querySelector('.announcement-badges'));
    expect(item.querySelector('.announcement-badges')?.nextElementSibling)
      .toBe(item.querySelector('.announcement-date'));
  });
});
