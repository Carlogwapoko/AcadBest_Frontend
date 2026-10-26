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

  it('computes an equal-weight overall grade only when all three periods are valid',()=>{
    expect(data.avg([85,90,95])).toBe(90);
    expect(data.avg([85,90,null])).toBeNull();
    expect(data.avg([85,101,95])).toBeNull();
    expect(data.overallGrade(null)).toBe('Incomplete');
    expect(data.overallGrade(data.avg([85,90,95]))).toBe('90.00');
  });

  it('creates an ordered weekly schedule with each subject day and assigned sections',()=>{
    data.subjects={
      IT101:{n:'Programming',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
        r:'Room 1',p:'BSIT',y:1,f:7,session:'Afternoon'},
      IT102:{n:'Databases',u:3,d:'Mon',tm:'10:00–11:30',start:'10:00',end:'11:30',
        r:'Room 2',p:'BSIT',y:1,f:7,session:'Evening'},
      IT103:{n:'Capstone',u:3,d:'Sun',tm:'13:00–14:30',start:'13:00',end:'14:30',
        r:'Room 3',p:'BSIT',y:1,f:7,session:'Weekends'},
    };
    data.students=[
      {id:1,name:'Student A',prog:'BSIT',yr:1,sec:'A',g:{},subject_codes:['IT101','IT102']},
      {id:2,name:'Student B',prog:'BSIT',yr:1,sec:'B',g:{},subject_codes:['IT101']},
    ];

    expect(data.facultySchedule(7).map(item=>[item.day,item.code,item.section])).toEqual([
      ['Monday','IT101','A, B'],
      ['Monday','IT102','A'],
      ['Wednesday','IT101','A, B'],
      ['Sunday','IT103','—'],
    ]);
  });

  it('coalesces and caches portal loading until an explicit refresh',async()=>{
    const first=data.load();
    const concurrent=data.load();
    const request=http.expectOne(`${API_BASE_URL}/portal`);
    request.flush({today:'2026-10-21'});
    await Promise.all([first,concurrent]);

    await data.load();
    http.expectNone(`${API_BASE_URL}/portal`);

    const refresh=data.reload();
    http.expectOne(`${API_BASE_URL}/portal`).flush({today:'2026-10-22'});
    await refresh;
    expect(data.today).toBe('2026-10-22');
  });

  it('does not let a portal response for a signed-out user repopulate cleared state',async()=>{
    const oldLoad=data.load();
    data.reset();
    const request=http.expectOne(`${API_BASE_URL}/portal`);
    request.flush({today:'2026-10-21',students:[{
      id:1,name:'Old user',prog:'BSIT',yr:1,sec:'A',g:{},school_id:'2026000001',
    }]});
    await oldLoad;
    expect(data.students).toEqual([]);

    const freshLoad=data.load();
    http.expectOne(`${API_BASE_URL}/portal`).flush({today:'2026-10-22'});
    await freshLoad;
    expect(data.today).toBe('2026-10-22');
  });

  it('coalesces concurrent requests for the same request-queue page',async()=>{
    const first=data.loadRequests();
    const second=data.loadRequests();
    expect(second).toBe(first);
    const request=http.expectOne(`${API_BASE_URL}/requests?page=1&per_page=25&search=&status=All&type=All`);
    request.flush({data:[],current_page:1,last_page:1,per_page:25,total:0});
    await Promise.all([first,second]);
  });

  it('does not let an in-flight stale request replace data refreshed after a mutation',async()=>{
    const url=`${API_BASE_URL}/requests?page=1&per_page=25&search=&status=All&type=All`;
    const stale=data.loadRequests();
    const save=data.saveRequest({type:'Transcript',purpose:'Transfer',copies:1,date_needed:'2026-10-20'});
    http.expectOne(`${API_BASE_URL}/requests`).flush({reference:'REQ-NEW'});
    await save;

    const refresh=data.loadRequests();
    const [staleRequest,freshRequest]=http.match(url);
    expect(staleRequest).toBeTruthy();
    expect(freshRequest).toBeTruthy();
    staleRequest.flush({data:[],current_page:1,last_page:1,per_page:25,total:0});
    await stale;
    expect(data.requests).toEqual([]);

    freshRequest.flush({
      data:[{id:'REQ-NEW',sid:1,by:'Student',type:'Transcript',purpose:'Transfer',copies:1,
        need:'2026-10-20',rem:'',st:'Pending',log:[]}],
      current_page:1,last_page:1,per_page:25,total:1,
    });
    await refresh;
    expect(data.requests.map(item=>item.id)).toEqual(['REQ-NEW']);
  });

  it('coalesces concurrent requests for the same enrollment page',async()=>{
    const first=data.loadEnrollments();
    const second=data.loadEnrollments();
    expect(second).toBe(first);
    const request=http.expectOne(`${API_BASE_URL}/enrollments?page=1&per_page=25&search=&status=All`);
    request.flush({data:[],current_page:1,last_page:1,per_page:25,total:0});
    await Promise.all([first,second]);
  });

  it('maps all populated user name fields from the API response',async()=>{
    const load=data.usersList();
    http.expectOne(`${API_BASE_URL}/users?page=1&per_page=25&search=`)
      .flush({
        data:[{
          id:1,name:'First Middle Last',first_name:'First',middle_name:'Middle',last_name:'Last',
          email:'user@example.com',role:'Faculty',active:true,phone:'',
        }],
        current_page:1,last_page:1,per_page:25,total:1,
      });

    const result=await load;
    expect(result.data[0]).toMatchObject({
      first_name:'First',
      middle_name:'Middle',
      last_name:'Last',
    });
    expect(data.users[0].first_name).toBe('First');
    expect(data.users[0].last_name).toBe('Last');
  });

  it('maps enrollment API name columns without splitting or rearranging them',async()=>{
    const load=data.loadEnrollments();
    http.expectOne(`${API_BASE_URL}/enrollments?page=1&per_page=25&search=&status=All`)
      .flush({
        data:[{
          ref:'ENR-2026-ABC123',name:'Asthon Lloyd Barbante Quisquisol',
          first_name:'Asthon Lloyd',middle_name:'Barbante',last_name:'Quisquisol',
          email:'student@example.com',phone:'',dob:'2007-01-01',sex:'Female',addr:'Address',
          prog:'BSIT',yr:1,type:'New',student_status:'Applicant',school:'School',
          gname:'Guardian',gph:'',st:'Pending',date:'Oct 19',note:'',acct:false,log:[],
        }],
        current_page:1,last_page:1,per_page:25,total:1,
      });

    await load;
    expect(data.enrollments[0]).toMatchObject({
      first_name:'Asthon Lloyd',
      middle_name:'Barbante',
      last_name:'Quisquisol',
    });
  });

  it('removes a school ID from an enrollment when the backend returns null',async()=>{
    data.enrollments=[{
      ref:'ENR-2026-ABC123',name:'Student',email:'student@example.com',phone:'',dob:'2007-01-01',
      middle_name:'',student_status:'New Student',sex:'Female',addr:'Address',prog:'BSIT',yr:1,
      type:'New',school:'School',gname:'Guardian',gph:'',st:'Enrolled',date:'Oct 19',note:'',
      acct:false,school_id:'2026001460',subs:[],log:[],
    }];

    const operation=data.updateEnrollment('ENR-2026-ABC123','Rejected','Incomplete documents');
    const request=http.expectOne(`${API_BASE_URL}/enrollments/ENR-2026-ABC123`);
    request.flush({status:'Rejected',note:'Incomplete documents',school_id:null});
    await operation;

    expect(data.enrollments[0].school_id).toBeNull();
    expect(data.enrollments[0].st).toBe('Rejected');
  });

  it('marks notifications read only after the batch request succeeds',async()=>{
    data.notifications=[
      {id:1,sid:7,type:'alert',t:'One',m:'First',d:'Oct 19',read:false},
      {id:2,sid:7,type:'grade',t:'Two',m:'Second',d:'Oct 19',read:false},
      {id:3,sid:8,type:'alert',t:'Other student',m:'Third',d:'Oct 19',read:false},
    ];
    const first=data.markAllRead(7);
    const second=data.markAllRead(7);
    expect(data.unread(7)).toBe(2);
    expect(data.notifications.find(item=>item.id===3)?.read).toBe(false);
    const request=http.expectOne(`${API_BASE_URL}/notifications/read-all`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
    await Promise.all([first,second]);
    expect(data.unread(7)).toBe(0);
  });

  it('preserves unread notifications when marking all read fails',async()=>{
    data.notifications=[
      {id:1,sid:7,type:'alert',t:'One',m:'First',d:'Oct 19',read:false},
    ];
    const operation=data.markAllRead(7);
    const request=http.expectOne(`${API_BASE_URL}/notifications/read-all`);
    request.flush({message:'Unavailable'},{status:500,statusText:'Server Error'});

    await expect(operation).rejects.toBeTruthy();
    expect(data.unread(7)).toBe(1);
  });

  it('updates saved grades and standing from the backend response without reloading the portal',async()=>{
    data.subjects['IT301']={
      n:'Programming',u:3,d:'Mon/Wed',tm:'08:00–09:30',start:'08:00',end:'09:30',
      r:'Lab 1',p:'BSIT',y:1,f:2,
    };
    data.students=[{
      id:4,name:'Student',prog:'BSIT',yr:1,sec:'A',g:{IT301:[80,null,null]},
      gwa:80,st:'for_monitoring',declining:[],
    }];

    const operation=data.saveGrades('IT301','Midterm',[{
      student_id:4,score:86,
    }]);
    const request=http.expectOne(`${API_BASE_URL}/grades`);
    expect(request.request.method).toBe('PUT');
    request.flush({students:{'4':{gwa:84,status:'good_standing',declining:[]} }});
    await operation;

    expect(data.students[0].g['IT301']).toEqual([80,86,null]);
    expect(request.request.body.grades).toEqual([{student_id:4,score:86}]);
    expect(data.students[0].gwa).toBe(84);
    expect(data.students[0].st).toBe('good_standing');
    http.expectNone(`${API_BASE_URL}/portal`);
  });

  it('updates local standing rules only after the backend confirms the change',async()=>{
    data.rules={pass:75,safe:80};
    data.students=[{
      id:4,name:'Student',prog:'BSIT',yr:1,sec:'A',g:{IT301:[80,null,null]},
      gwa:80,st:'good_standing',declining:[],
    }];

    const operation=data.saveRules(85,90);
    const request=http.expectOne(`${API_BASE_URL}/settings/rules`);
    request.flush({pass:85,safe:90});
    await operation;

    expect(data.rules).toEqual({pass:85,safe:90});
    expect(data.students[0].st).toBe('at_risk');
  });
});
