import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { DataService } from './data.service';

describe('DataService list loading',()=>{
  let data:DataService;
  let http:HttpTestingController;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      providers:[provideHttpClient(),provideHttpClientTesting()],
    });
    data=TestBed.inject(DataService);
    http=TestBed.inject(HttpTestingController);
  });

  afterEach(()=>http.verify());

  it('coalesces concurrent requests for the same request-queue page',async()=>{
    const first=data.loadRequests();
    const second=data.loadRequests();
    expect(second).toBe(first);
    const request=http.expectOne(`${API_BASE_URL}/requests?page=1&per_page=25&search=&status=All&type=All`);
    request.flush({data:[],current_page:1,last_page:1,per_page:25,total:0});
    await Promise.all([first,second]);
  });

  it('coalesces concurrent requests for the same enrollment page',async()=>{
    const first=data.loadEnrollments();
    const second=data.loadEnrollments();
    expect(second).toBe(first);
    const request=http.expectOne(`${API_BASE_URL}/enrollments?page=1&per_page=25&search=&status=All`);
    request.flush({data:[],current_page:1,last_page:1,per_page:25,total:0});
    await Promise.all([first,second]);
  });

  it('marks all unread notifications locally and sends only one batch request',async()=>{
    data.notifications=[
      {id:1,sid:7,type:'alert',t:'One',m:'First',d:'Oct 19',read:false},
      {id:2,sid:7,type:'grade',t:'Two',m:'Second',d:'Oct 19',read:false},
      {id:3,sid:8,type:'alert',t:'Other student',m:'Third',d:'Oct 19',read:false},
    ];
    const first=data.markAllRead(7);
    const second=data.markAllRead(7);
    expect(data.unread(7)).toBe(0);
    expect(data.notifications.find(item=>item.id===3)?.read).toBe(false);
    const request=http.expectOne(`${API_BASE_URL}/notifications/read-all`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
    await Promise.all([first,second]);
    expect(data.unread(7)).toBe(0);
  });
});
