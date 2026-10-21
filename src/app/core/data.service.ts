
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export type Role = 'student' | 'faculty' | 'registrar' | 'admin';

export const ROLE_NAME: Record<Role, string> = {
  student: 'Student',
  faculty: 'Faculty',
  registrar: 'Registrar Staff',
  admin: 'Admin',
};

export const ROLE_KEY: Record<string, Role> = {
  Student: 'student',
  Faculty: 'faculty',
  'Registrar Staff': 'registrar',
  Admin: 'admin',
};

export interface Subject {
  n: string;
  u: number;
  d: string;
  tm: string;
  start: string | null;
  end: string | null;
  r: string;
  p: string;
  y: string | number;
  w: number[];
  cw: number[];
  f: number | null;
}

export interface GradeComponents {
  written_works: number;
  performance_tasks: number;
  exams: number;
}

export interface Student {
  id: number;
  name: string;
  middle_name?: string;
  school_id?: string | null;
  status?: string | null;
  prog: string;
  yr: number;
  sec: string;
  g: Record<string, (number | null)[]>;
  gc?: Record<string, (GradeComponents | null)[]>;

  // Values calculated by Laravel
  gwa?: number | null;
  st?: string;
  declining?: string[];
}

export interface User {
  id: number;
  name: string;
  middle_name?: string;
  email: string;
  role: string;
  roleKey?: Role;
  act: boolean;
  phone: string;
  sid?: number;
  schoolId?: string;
  avatar?: string;
  prog?: string;
  yr?: number;
}

export interface Req {
  id: string;
  sid: number;
  by: string;
  type: string;
  purpose: string;
  copies: number;
  need: string;
  rem: string;
  st: string;
  log: string[][];
}

export interface Ann {
  id: number;
  t: string;
  m: string;
  aud: string;
  pr: string;
  by: string;
  d: string;
  dt: string;
  end?: string;
  prog: string;
  yr: string | number;
  sec: string;
}

export interface Enr {
  ref: string;
  name: string;
  middle_name: string;
  email: string;
  phone: string;
  dob: string;
  sex: string;
  addr: string;
  prog: string;
  yr: number;
  session?: string | null;
  type: string;
  student_status: string;
  school: string;
  gname: string;
  gph: string;
  st: string;
  date: string;
  note: string;
  acct: boolean;
  school_id?: string | null;
  subs?: string[];
  log: string[][];
}

export interface Notif {
  id: number;
  sid: number;
  type: 'grade' | 'alert';
  t: string;
  m: string;
  d: string;
  read: boolean;
}

export interface Page<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  today = new Date().toISOString().slice(0, 10);

  rules = { pass: 75, safe: 80 };
  reqTypes = [
    'Certificate of Enrollment',
    'Transcript of Records',
    'Good Moral Certificate',
    'Clearance',
    'Copy of Grades',
  ];

  subjects: Record<string, Subject> = {};
  students: Student[] = [];
  users: User[] = [];
  requests: Req[] = [];
  anns: Ann[] = [];
  enrollments: Enr[] = [];
  notifications: Notif[] = [];

  disabled = new Set<string>();
  loading = false;
  loadError = '';
  pendingOperations = 0;
  openRequestCount = 0;

  private loadPromise: Promise<void> | null = null;
  private loaded = false;
  private loadVersion = 0;
  private enrollmentLoads = new Map<string, Promise<Page<Enr>>>();
  private enrollmentVersion = 0;
  private requestLoads = new Map<string, Promise<Page<Req>>>();
  private requestVersion = 0;
  private notificationVersion = 0;

  private enrollmentPage = 1;
  private enrollmentSearch = '';
  private enrollmentStatus = 'All';

  private requestPage = 1;
  private requestSearch = '';
  private requestStatus = 'All';
  private requestType = 'All';

  private userPage = 1;
  private userSearch = '';

  private readOperations = new Map<number, Promise<void>>();
  private markAllPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private async mutate<T>(request: Observable<T>): Promise<T> {
    this.pendingOperations++;

    try {
      return await firstValueFrom(request);
    } finally {
      this.pendingOperations--;
    }
  }

  // Load the main portal data from Laravel.
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) {
      return this.loadPromise;
    }

    const version = this.loadVersion;
    this.loading = true;
    this.loadError = '';

    const request = (async () => {
      try {
        const data = await firstValueFrom(
          this.http.get<Record<string, unknown>>(
            `${API_BASE_URL}/portal`
          )
        );
        if (version !== this.loadVersion) return;

        this.today = String(data['today']);

        this.rules = {
          pass: Number(
            (data['rules'] as Record<string, unknown>)?.['pass'] ?? 75
          ),
          safe: Number(
            (data['rules'] as Record<string, unknown>)?.['safe'] ?? 80
          ),
        };

        this.disabled = new Set(
          (data['disabled'] as string[] | undefined) ?? []
        );

        this.subjects =
          (data['subjects'] as Record<string, Subject>) ?? {};

        this.students = (
          (data['students'] as Student[] | undefined) ?? []
        ).map(student => ({
          ...student,
          g: student.g ?? {},
          gc: student.gc ?? {},
          gwa: student.gwa ?? null,
          declining: student.declining ?? [],
        }));

        this.users = (
          (data['users'] as Array<Record<string, unknown>> | undefined) ?? []
        ).map(user => this.mapUser(user));

        this.anns =
          (data['announcements'] as Ann[] | undefined) ?? [];

        this.openRequestCount = Number(
          data['open_request_count'] || 0
        );

        this.notifications =
          (data['notifications'] as Notif[] | undefined) ?? [];

        this.reqTypes =
          (data['requestTypes'] as string[] | undefined) ?? this.reqTypes;
        this.loaded = true;
      } catch (error) {
        if (version !== this.loadVersion) return;
        this.loadError =
          'Portal data could not be loaded. Check your connection and try again.';
        throw error;
      } finally {
        if (version === this.loadVersion) {
          this.loading = false;
          this.loadPromise = null;
        }
      }
    })();

    this.loadPromise = request;
    return request;
  }

  async reload(): Promise<void> {
    const inFlight = this.loadPromise;
    if (inFlight) await inFlight;
    this.loaded = false;
    return this.load();
  }

  reset(): void {
    this.loadVersion++;
    this.loadPromise = null;
    this.loaded = false;
    this.loading = false;
    this.loadError = '';
    this.rules = { pass: 75, safe: 80 };
    this.subjects = {};
    this.students = [];
    this.users = [];
    this.requests = [];
    this.anns = [];
    this.enrollments = [];
    this.notifications = [];
    this.disabled = new Set<string>();
    this.openRequestCount = 0;
    this.enrollmentVersion++;
    this.enrollmentLoads.clear();
    this.requestVersion++;
    this.requestLoads.clear();
    this.readOperations.clear();
    this.markAllPromise = null;
    this.notificationVersion++;
  }

  // USERS
  async usersList(
    page = this.userPage,
    search = this.userSearch,
    append = false
  ): Promise<Page<User>> {
    this.userPage = page;
    this.userSearch = search;

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', 25)
      .set('search', search);

    const result = await firstValueFrom(
      this.http.get<Page<Record<string, unknown>>>(
        `${API_BASE_URL}/users`,
        { params }
      )
    );

    const mapped = {
      ...result,
      data: result.data.map(user => this.mapUser(user)),
    };

    this.users = append
      ? [...this.users, ...mapped.data]
      : mapped.data;

    return mapped;
  }

  // ENROLLMENTS
  loadEnrollments(
    page = 1,
    search = '',
    status = 'All',
    perPage = 25,
    append = false
  ): Promise<Page<Enr>> {
    this.enrollmentPage = page;
    this.enrollmentSearch = search;
    this.enrollmentStatus = status;

    const key = JSON.stringify([
      page, search, status, perPage, append,
    ]);

    const inFlight = this.enrollmentLoads.get(key);
    if (inFlight) return inFlight;

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      .set('search', search)
      .set('status', status);

    const version = this.enrollmentVersion;
    let request: Promise<Page<Enr>>;
    request = firstValueFrom(
      this.http.get<Page<Enr>>(
        `${API_BASE_URL}/enrollments`,
        { params }
      )
    )
      .then(result => {
        if (version === this.enrollmentVersion) {
          this.enrollments = append
            ? [...this.enrollments, ...result.data]
            : result.data;
        }

        return result;
      })
      .finally(() => {
        if (this.enrollmentLoads.get(key) === request) {
          this.enrollmentLoads.delete(key);
        }
      });

    this.enrollmentLoads.set(key, request);
    return request;
  }

  async submitEnrollment(
    form: Record<string, unknown>
  ): Promise<string> {
    const result = await this.mutate(
      this.http.post<{ reference: string }>(
        `${API_BASE_URL}/enrollments`,
        form
      )
    );

    return result.reference;
  }

  async trackEnrollment(
    reference: string,
    email: string
  ): Promise<Enr> {
    return firstValueFrom(
      this.http.post<Enr>(
        `${API_BASE_URL}/enrollments/track`,
        { reference, email }
      )
    );
  }

  async updateEnrollment(
    ref: string,
    status: string,
    note?: string
  ): Promise<void> {
    const result = await this.mutate(
      this.http.put<{ status: string; note?: string; school_id?: string | null }>(
        `${API_BASE_URL}/enrollments/${encodeURIComponent(ref)}`,
        { status, note }
      )
    );

    this.enrollmentVersion++;
    this.enrollmentLoads.clear();
    this.enrollments = this.enrollments.map(item =>
      item.ref === ref
        ? {
            ...item,
            st: result.status,
            student_status:
              result.status === 'Enrolled'
                ? 'New Student'
                : 'Applicant',
            note: result.note ?? item.note,
            school_id:
              result.school_id === undefined
                ? item.school_id
                : result.school_id,
            log: [...item.log, [this.today, status]],
          }
        : item
    );
  }

  async saveApplicantSubjects(
    ref: string,
    codes: string[]
  ): Promise<void> {
    await this.mutate(
      this.http.put(
        `${API_BASE_URL}/enrollments/${encodeURIComponent(ref)}`,
        { subjects: codes }
      )
    );

    this.enrollmentVersion++;
    this.enrollmentLoads.clear();
    this.enrollments = this.enrollments.map(item =>
      item.ref === ref ? { ...item, subs: [...codes] } : item
    );
  }

  markEnrollmentAccountIssued(ref: string): void {
    this.enrollmentVersion++;
    this.enrollmentLoads.clear();
    this.enrollments = this.enrollments.map(item =>
      item.ref === ref ? { ...item, acct: true } : item
    );
  }

  // SERVICE REQUESTS
  loadRequests(
    page = 1,
    search = '',
    status = 'All',
    type = 'All',
    perPage = 25,
    append = false
  ): Promise<Page<Req>> {
    this.requestPage = page;
    this.requestSearch = search;
    this.requestStatus = status;
    this.requestType = type;

    const key = JSON.stringify([
      page, search, status, type, perPage, append,
    ]);

    const inFlight = this.requestLoads.get(key);
    if (inFlight) return inFlight;

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      .set('search', search)
      .set('status', status)
      .set('type', type);

    const version = this.requestVersion;
    let request: Promise<Page<Req>>;
    request = firstValueFrom(
      this.http.get<Page<Req>>(
        `${API_BASE_URL}/requests`,
        { params }
      )
    )
      .then(result => {
        if (version === this.requestVersion) {
          this.requests = append
            ? [...this.requests, ...result.data]
            : result.data;
        }

        return result;
      })
      .finally(() => {
        if (this.requestLoads.get(key) === request) {
          this.requestLoads.delete(key);
        }
      });

    this.requestLoads.set(key, request);
    return request;
  }

  async saveRequest(
    data: Record<string, unknown>
  ): Promise<string> {
    const result = await this.mutate(
      this.http.post<{ reference: string }>(
        `${API_BASE_URL}/requests`,
        data
      )
    );

    this.requestVersion++;
    this.requestLoads.clear();
    this.openRequestCount++;
    return result.reference;
  }

  async updateRequest(
    ref: string,
    status: string,
    remarks?: string
  ): Promise<void> {
    await this.mutate(
      this.http.put(
        `${API_BASE_URL}/requests/${encodeURIComponent(ref)}`,
        { status, remarks }
      )
    );

    this.requestVersion++;
    this.requestLoads.clear();
    this.requests = this.requests.map(item =>
      item.id === ref
        ? {
            ...item,
            st: status,
            rem: remarks ?? item.rem,
            log: [...item.log, [this.today, status]],
          }
        : item
    );
  }

  // USERS: CREATE, UPDATE, DELETE
  async saveUser(
    id: number | undefined,
    data: Record<string, unknown>
  ): Promise<User> {
    const saved = await this.mutate(
      id
        ? this.http.put<Record<string, unknown>>(
            `${API_BASE_URL}/users/${id}`,
            data
          )
        : this.http.post<Record<string, unknown>>(
            `${API_BASE_URL}/users`,
            data
          )
    );

    const user = this.mapUser(saved);
    const index = this.users.findIndex(item => item.id === user.id);

    if (index < 0) {
      this.users.unshift(user);
    } else {
      this.users[index] = user;
    }

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await this.mutate(
      this.http.delete<void>(`${API_BASE_URL}/users/${id}`)
    );

    const sid = this.users.find(user => user.id === id)?.sid;

    this.users = this.users.filter(user => user.id !== id);

    if (sid) {
      this.students = this.students.filter(
        student => student.id !== sid
      );
    }
  }

  // GRADES
  async saveGrades(
    code: string,
    term: string,
    grades: Array<{
      student_id: number;
      written_works: number;
      performance_tasks: number;
      exams: number;
    }>
  ): Promise<void> {
    const termIndex = ['Prelim', 'Midterm', 'Final'].indexOf(term);
    if (termIndex < 0) {
      throw new Error(`Invalid grading term: ${term}`);
    }

    const result = await this.mutate(
      this.http.put<{
        students: Record<string, {
          gwa: number | null;
          status: string;
          declining: string[];
        }>;
      }>(`${API_BASE_URL}/grades`, {
        subject_code: code,
        term,
        grades,
      })
    );

    const weights = this.subjects[code]?.cw || [30, 50, 20];

    const changed = new Map(
      grades.map(grade => [
        grade.student_id,
        {
          score: Number(
            (
              (
                grade.written_works * weights[0] +
                grade.performance_tasks * weights[1] +
                grade.exams * weights[2]
              ) / 100
            ).toFixed(2)
          ),
          components: {
            written_works: grade.written_works,
            performance_tasks: grade.performance_tasks,
            exams: grade.exams,
          },
        },
      ])
    );

    this.students = this.students.map(student => {
      const grade = changed.get(student.id);
      if (grade === undefined) return student;

      const courseGrades = { ...student.g };
      const terms = [
        ...(courseGrades[code] ?? [null, null, null]),
      ];

      terms[termIndex] = grade.score;
      courseGrades[code] = terms;

      const components = { ...(student.gc || {}) };
      const componentTerms = [
        ...(components[code] ?? [null, null, null]),
      ];

      componentTerms[termIndex] = grade.components;
      components[code] = componentTerms;

      const standing = result.students[String(student.id)];
      return {
        ...student,
        g: courseGrades,
        gc: components,
        gwa: standing ? standing.gwa : student.gwa,
        st: standing?.status ?? student.st,
        declining: standing?.declining ?? student.declining,
      };
    });
  }

  // ANNOUNCEMENTS
  async saveAnnouncement(
    data: Record<string, unknown>,
    authorName = 'Registrar'
  ): Promise<void> {
    const result = await this.mutate(
      this.http.post<{ id: number }>(
        `${API_BASE_URL}/announcements`,
        data
      )
    );

    const publishDate = String(data['publish_date']);
    const yearLevel = String(data['year_level'] ?? 'All');
    const program = String(data['program'] ?? 'All');

    this.anns = [
      {
        id: result.id,
        t: String(data['title']),
        m: String(data['message']),
        aud: program === 'All' ? 'All programs' : program,
        pr: String(data['priority']),
        by: authorName,
        d: new Date(`${publishDate}T00:00:00`).toLocaleDateString(
          'en',
          { month: 'short', day: '2-digit' }
        ),
        dt: publishDate,
        end:
          typeof data['valid_until'] === 'string'
            ? data['valid_until']
            : undefined,
        prog: program,
        yr: yearLevel === 'All' ? 'All' : Number(yearLevel),
        sec: String(data['section'] ?? 'All'),
      },
      ...this.anns,
    ];
  }

  // SUBJECTS
  async saveSubject(
    code: string,
    data: Subject
  ): Promise<void> {
    const isUpdate = code in this.subjects;

    const payload = {
      code,
      name: data.n,
      units: data.u,
      days: data.d,
      start_time: data.start,
      end_time: data.end,
      room: data.r,
      program: data.p,
      year_level: String(data.y),
      grade_weights: data.w,
      component_weights: data.cw || [30, 50, 20],
    };

    const result = await this.mutate(
      this.http.request<{
        students?: Record<string, {
          gwa: number | null;
          status: string;
          declining: string[];
        }>;
      }>(
        isUpdate ? 'put' : 'post',
        `${API_BASE_URL}/subjects${
          isUpdate ? '/' + encodeURIComponent(code) : ''
        }`,
        { body: payload }
      )
    );

    this.subjects = {
      ...this.subjects,
      [code]: data,
    };

    if (isUpdate) {
      this.students = this.students.map(student => {
        const components = student.gc?.[code];
        if (!components) return student;

        const grades = [
          ...(student.g[code] ?? [null, null, null]),
        ];

        components.forEach((value, index) => {
          if (value) {
            grades[index] = Number(
              (
                (
                  value.written_works * payload.component_weights[0] +
                  value.performance_tasks * payload.component_weights[1] +
                  value.exams * payload.component_weights[2]
                ) / 100
              ).toFixed(2)
            );
          }
        });

        const standing = result.students?.[String(student.id)];
        return {
          ...student,
          g: { ...student.g, [code]: grades },
          gwa: standing ? standing.gwa : student.gwa,
          st: standing?.status ?? student.st,
          declining: standing?.declining ?? student.declining,
        };
      });
    }
  }

  async deleteSubject(code: string): Promise<void> {
    await this.mutate(
      this.http.delete(
        `${API_BASE_URL}/subjects/${encodeURIComponent(code)}`
      )
    );

    const subjects = { ...this.subjects };
    delete subjects[code];
    this.subjects = subjects;
  }

  async assignFaculty(
    id: number,
    codes: string[]
  ): Promise<void> {
    await this.mutate(
      this.http.put(`${API_BASE_URL}/faculty/${id}/subjects`, {
        codes,
      })
    );

    const selected = new Set(codes);

    this.subjects = Object.fromEntries(
      Object.entries(this.subjects).map(([code, subject]) => [
        code,
        {
          ...subject,
          f: selected.has(code)
            ? id
            : subject.f === id
              ? null
              : subject.f,
        },
      ])
    );
  }

  async assignStudent(
    id: number,
    codes: string[]
  ): Promise<void> {
    await this.mutate(
      this.http.put(`${API_BASE_URL}/students/${id}/subjects`, {
        codes,
      })
    );

    const selected = new Set(codes);

    this.students = this.students.map(student => {
      if (student.id !== id) return student;

      const g: Student['g'] = {};

      for (const code of selected) {
        g[code] = student.g[code] ?? [null, null, null];
      }

      const gc: Student['gc'] = {};

      for (const code of selected) {
        if (student.gc?.[code]) {
          gc[code] = student.gc[code];
        }
      }

      return { ...student, g, gc };
    });
  }

  // RULES AND MODULE SETTINGS
  async saveRules(pass: number, safe: number): Promise<void> {
    this.rules = await this.mutate(
      this.http.put<{ pass: number; safe: number }>(
        `${API_BASE_URL}/settings/rules`,
        { pass, safe }
      )
    );
    this.students = this.students.map(student => ({
      ...student,
      st: this.calculatedStanding(student),
    }));
  }

  async setModule(
    role: string,
    module: string,
    enabled: boolean
  ): Promise<void> {
    await this.mutate(
      this.http.put(`${API_BASE_URL}/settings/modules`, {
        role,
        module,
        enabled,
      })
    );

    const key = `${role}:${module}`;

    if (enabled) {
      this.disabled.delete(key);
    } else {
      this.disabled.add(key);
    }
  }

  // NOTIFICATIONS
  async markRead(id: number): Promise<void> {
    if (this.markAllPromise) {
      await this.markAllPromise;
    }

    const inFlight = this.readOperations.get(id);
    if (inFlight) return inFlight;

    const version = this.notificationVersion;
    const operation = (async () => {
      await this.mutate(
        this.http.put(
          `${API_BASE_URL}/notifications/${id}/read`,
          {}
        )
      );

      if (version === this.notificationVersion) {
        this.notifications = this.notifications.map(item =>
          item.id === id ? { ...item, read: true } : item
        );
      }
    })().finally(() => {
      if (this.readOperations.get(id) === operation) {
        this.readOperations.delete(id);
      }
    });

    this.readOperations.set(id, operation);
    return operation;
  }

  async markAllRead(sid: number): Promise<void> {
    if (this.markAllPromise) {
      return this.markAllPromise;
    }

    const unreadIds = this.notifications
      .filter(item => item.sid === sid && !item.read)
      .map(item => item.id);

    if (!unreadIds.length) return;

    const version = this.notificationVersion;
    let operation: Promise<void>;
    operation = (async () => {
      try {
        await this.mutate(this.http.put(`${API_BASE_URL}/notifications/read-all`, {}));
        if (version === this.notificationVersion) {
          const unread = new Set(unreadIds);
          this.notifications = this.notifications.map(item =>
            unread.has(item.id) ? { ...item, read: true } : item
          );
        }
      } finally {
        if (version === this.notificationVersion) {
          this.markAllPromise = null;
        }
      }
    })();

    this.markAllPromise = operation;
    return operation;
  }

  async sendAlert(
    studentId: number,
    title: string,
    message: string
  ): Promise<void> {
    await this.mutate(
      this.http.post(`${API_BASE_URL}/notifications`, {
        student_id: studentId,
        title,
        message,
      })
    );
  }

  // GWA AND ACADEMIC STANDING
  gwa(s: Student): number | null {
    // Prefer the unit-weighted GWA calculated by Laravel.
    if (s.gwa != null) {
      return Number(s.gwa);
    }

    // Fallback if the backend did not return a GWA.
    const values = Object.entries(s.g)
      .map(([code, grades]) => this.avg(grades, code))
      .filter((value): value is number => value != null);

    return values.length
      ? values.reduce((total, value) => total + value, 0) /
          values.length
      : null;
  }

  standingOf(s: Student): [string, string] {
    const map: Record<string, [string, string]> = {
      good_standing: ['Good Standing', 'ok'],
      for_monitoring: ['At Risk', 'wn'],
      at_risk: ['Failing', 'er'],
      no_data: ['No Data', ''],
    };

    return s.st && map[s.st]
      ? map[s.st]
      : this.standing(this.gwa(s));
  }

  standing(a: number | null): [string, string] {
    if (a == null) {
      return ['No Data', ''];
    }

    if (a >= this.rules.safe) {
      return ['Good Standing', 'ok'];
    }

    if (a >= this.rules.pass) {
      return ['At Risk', 'wn'];
    }

    return ['Failing', 'er'];
  }

  private calculatedStanding(student: Student): string {
    const average = this.gwa(student);
    if (average === null) return 'no_data';

    const hasFailingSubject = Object.entries(student.g).some(([code, grades]) => {
      const subjectAverage = this.avg(grades, code);
      return subjectAverage !== null && subjectAverage < this.rules.pass;
    });

    if (average < this.rules.pass || hasFailingSubject) return 'at_risk';
    if (average < this.rules.safe || (student.declining?.length ?? 0) > 0) {
      return 'for_monitoring';
    }
    return 'good_standing';
  }

  atRisk(uid?: number): Student[] {
    return (uid ? this.myStudents(uid) : this.students)
      .filter(student =>
        student.st
          ? student.st === 'for_monitoring' ||
            student.st === 'at_risk'
          : (this.gwa(student) ?? 100) < this.rules.safe
      )
      .sort(
        (a, b) =>
          (this.gwa(a) ?? 0) - (this.gwa(b) ?? 0)
      );
  }

  // GENERAL HELPERS
  unread(sid: number): number {
    return this.notifications.filter(
      notification => notification.sid === sid && !notification.read
    ).length;
  }

  moduleOn(role: string, key: string): boolean {
    return !this.disabled.has(`${role}:${key}`);
  }

  get subjectList() {
    return Object.entries(this.subjects).map(([code, subject]) => ({
      code,
      ...subject,
    }));
  }

  codes(s: Student): string[] {
    return Object.keys(s.g);
  }

  avg(
    grades: (number | null)[],
    code?: string
  ): number | null {
    const weights =
      (code && this.subjects[code]?.w) || [30, 30, 40];

    let total = 0;
    let weight = 0;

    grades.forEach((value, index) => {
      if (value != null) {
        total += value * (weights[index] ?? 0);
        weight += weights[index] ?? 0;
      }
    });

    return weight ? total / weight : null;
  }

  f1(value: number | null | undefined): string {
    return value == null ? '—' : value.toFixed(1);
  }

  unitsOf(codes: string[]): number {
    return codes.reduce(
      (total, code) => total + (this.subjects[code]?.u || 0),
      0
    );
  }

  facName(id: number | null): string {
    return this.users.find(user => user.id === id)?.name ||
      'Unassigned';
  }

  faculty(): User[] {
    return this.users.filter(user => user.role === 'Faculty');
  }

  mySubjects(uid: number): string[] {
    return Object.keys(this.subjects).filter(
      code => this.subjects[code].f === uid
    );
  }

  myStudents(uid: number): Student[] {
    const mine = this.mySubjects(uid);

    return this.students.filter(student =>
      mine.some(code => code in student.g)
    );
  }

  annsFor(s: Student): Ann[] {
    return this.anns.filter(
      announcement =>
        (announcement.prog === 'All' ||
          announcement.prog === s.prog) &&
        (announcement.yr === 'All' ||
          announcement.yr === s.yr) &&
        (announcement.sec === 'All' ||
          announcement.sec === s.sec)
    );
  }

  clash(codes: string[]): string {
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const a = this.subjects[codes[i]];
        const b = this.subjects[codes[j]];

        const overlaps =
          a?.start && a.end && b?.start && b.end
            ? a.start < b.end && b.start < a.end
            : a?.tm === b?.tm;

        if (
          a &&
          b &&
          overlaps &&
          a.d.split('/').some(day => b.d.split('/').includes(day))
        ) {
          return `Schedule conflict: ${codes[i]} and ${codes[j]} meet at the same time.`;
        }
      }
    }

    return '';
  }

  private mapUser(x: Record<string, unknown>): User {
    return {
      id: Number(x['id']),
      name: String(x['name']),
      middle_name: String(x['middle_name'] ?? ''),
      email: String(x['email']),
      role: String(x['role']),
      schoolId: typeof x['school_id'] === 'string' ? x['school_id'] : undefined,
      act: Boolean(x['active'] ?? x['act']),
      phone: String(x['phone'] ?? ''),
      sid: x['student_id']
        ? Number(x['student_id'])
        : x['sid']
          ? Number(x['sid'])
          : undefined,
      avatar:
        typeof x['avatar'] === 'string'
          ? x['avatar']
          : undefined,
      prog:
        typeof x['program'] === 'string'
          ? x['program']
          : undefined,
      yr: x['year_level']
        ? Number(x['year_level'])
        : undefined,
    };
  }
}
