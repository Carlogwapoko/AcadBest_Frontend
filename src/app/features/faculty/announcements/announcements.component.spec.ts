import { TestBed } from '@angular/core/testing';
import { DataService } from '../../../core/data.service';
import { FacultyAnnouncementsComponent } from './announcements.component';

describe('FacultyAnnouncementsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({imports:[FacultyAnnouncementsComponent]}).compileComponents();
  });

  it('renders the calendar and filters announcements by selected date',()=>{
    const data=TestBed.inject(DataService);
    data.today='2026-10-10';
    data.anns=[
      {id:1,t:'Current news',m:'Current message',aud:'All programs',pr:'Normal',by:'Registrar',
        d:'Oct 10',dt:'2026-10-10',prog:'All',yr:'All',sec:'All'},
      {id:2,t:'Future news',m:'Future message',aud:'All programs',pr:'Normal',by:'Registrar',
        d:'Oct 12',dt:'2026-10-12',prog:'All',yr:'All',sec:'All'},
    ];
    const fixture=TestBed.createComponent(FacultyAnnouncementsComponent);
    const component=fixture.componentInstance;
    fixture.detectChanges();

    expect(component.label).toBe('October 2026');
    expect(component.list.map(item=>item.id)).toEqual([1]);
    expect(component.days.find(day=>day.k==='2026-10-12')?.has).toBe(true);

    const futureDate=fixture.nativeElement.querySelector(
      'button[aria-label="2026-10-12, announcements available"]',
    ) as HTMLButtonElement;
    futureDate.click();
    fixture.detectChanges();
    expect(component.list.map(item=>item.id)).toEqual([2]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Future news');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-ann-list')).toBeTruthy();
  });
});
