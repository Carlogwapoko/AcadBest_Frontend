export type FeatureSlug =
  | 'grades-schedule'
  | 'service-requests'
  | 'announcements'
  | 'early-warning';

export interface FeatureData {
  slug: FeatureSlug;
  title: string;
  icon: string;
  summary: string;
  description: string;
  bullets: string[];
}

export const FEATURES: Record<FeatureSlug, FeatureData> = {
  'grades-schedule': {
    slug: 'grades-schedule',
    title: 'Grades & Schedule',
    icon: 'book',
    summary: 'View weighted grades, class schedules, and enrollment any time.',
    description:
      'Students see only their own records. Instructors record component scores separately for each selected term.',
    bullets: [
      'View weighted grades for each selected term.',
      'Check class schedules and enrollment information any time.',
      'Keep academic records private to each student.',
    ],
  },
  'service-requests': {
    slug: 'service-requests',
    title: 'Service Requests',
    icon: 'mail',
    summary: 'Request certificates, transcripts, and clearance online and track every status.',
    description:
      'Submit once, then follow each step of the approval trail without queuing at the registrar.',
    bullets: [
      'Request certificates, transcripts, and clearance online.',
      'Follow each step of the approval trail.',
      'Track request status without queuing at the registrar.',
    ],
  },
  announcements: {
    slug: 'announcements',
    title: 'Targeted Announcements',
    icon: 'mega',
    summary: 'Notices reach the right program, year level, and section.',
    description:
      'Registrar staff choose the audience; students see matching notices in their account.',
    bullets: [
      'Choose a notice audience by program, year level, and section.',
      'Reach the students who need each announcement.',
      'See matching notices in each student account.',
    ],
  },
  'early-warning': {
    slug: 'early-warning',
    title: 'Academic Early Warning',
    icon: 'alert',
    summary: 'Rule-based standing alerts help faculty support at-risk advisees early.',
    description:
      'Administrators configure grade thresholds; faculty see who needs help.',
    bullets: [
      'Configure grade thresholds for academic standing alerts.',
      'Identify advisees who may need support early.',
      'Help faculty focus on students who need help.',
    ],
  },
};
