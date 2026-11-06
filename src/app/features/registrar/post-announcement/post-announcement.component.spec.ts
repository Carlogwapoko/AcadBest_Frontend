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

  it('updates student targeting fields and keeps meeting details in the message',()=>{
    const fixture=TestBed.createComponent(PostAnnouncementComponent);
    const component=fixture.componentInstance;
    fixture.detectChanges();

    const labels=()=>Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'))
      .map(label=>label.textContent?.trim());
    const selectAudience=(audience:string)=>{
      const audienceLabel=Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'))
        .find(label=>label.textContent?.trim()==='Audience');
      (audienceLabel?.closest('app-field')?.querySelector('.select-trigger') as HTMLButtonElement).click();
      fixture.detectChanges();
      Array.from(document.querySelectorAll('.select-option'))
        .find(option=>option.textContent?.trim()===audience)?.dispatchEvent(
          new MouseEvent('click',{bubbles:true}),
        );
      fixture.detectChanges();
    };
    const audienceLabel=Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'))
      .find(label=>label.textContent?.trim()==='Audience');
    (audienceLabel?.closest('app-field')?.querySelector('.select-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    const audienceOptions=Array.from(document.querySelectorAll('.select-option'))
      .map(option=>option.textContent?.trim());
    expect(audienceOptions).toEqual(expect.arrayContaining(['All Users','Students Only','Faculty Only']));
    expect(audienceOptions).not.toContain('Staff Only');
    expect(audienceOptions).not.toContain('Faculty & Staff Only');
    Array.from(document.querySelectorAll('.select-option'))
      .find(option=>option.textContent?.trim()==='Students Only')?.dispatchEvent(
        new MouseEvent('click',{bubbles:true}),
      );
    fixture.detectChanges();
    expect(labels()).toEqual(expect.arrayContaining(['Program','Year level','Section']));
    component.f.prog='BSIT';
    component.f.yr='2';
    component.f.sec='A';
    selectAudience('Faculty Only');
    expect(labels()).not.toContain('Program');
    expect(labels()).not.toContain('Year level');
    expect(labels()).not.toContain('Section');
    expect(component.build()).toEqual(expect.objectContaining({prog:'All',yr:'All',sec:'All'}));
    selectAudience('All Users');
    expect(labels()).toEqual(expect.arrayContaining(['Program','Year level','Section']));
    expect(component.build()).toEqual(expect.objectContaining({prog:'BSIT',yr:2,sec:'A'}));

    const categoryLabel=Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.field-label'))
      .find(label=>label.textContent?.trim()==='Category');
    (categoryLabel?.closest('app-field')?.querySelector('.select-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    Array.from(document.querySelectorAll('.select-option'))
      .find(option=>option.textContent?.trim()==='Meeting')?.dispatchEvent(
        new MouseEvent('click',{bubbles:true}),
      );
    fixture.detectChanges();
    expect(labels()).toEqual(expect.arrayContaining(['Message','Publish date']));
    expect(labels()).not.toContain('Meeting Time');
    expect(labels()).not.toContain('Venue');
    expect(labels()).not.toContain('Agenda');
    expect(labels()).not.toContain('Meeting Date');
    component.f.t='Faculty meeting';
    component.f.m='Discuss upcoming academic activities, meeting date, time, venue, and agenda.';
    expect(component.valid()).toBe(true);
    expect(component.build().dt).toBe(component.f.dt);
  });
});
