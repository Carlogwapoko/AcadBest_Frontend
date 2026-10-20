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
});
