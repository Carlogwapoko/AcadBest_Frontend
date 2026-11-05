import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AnnouncementsComponent } from './announcements.component';

describe('AnnouncementsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AnnouncementsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates',()=>{
    const fixture=TestBed.createComponent(AnnouncementsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
