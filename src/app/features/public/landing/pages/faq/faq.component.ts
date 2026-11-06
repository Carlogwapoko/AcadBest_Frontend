import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturePageShellComponent } from '../../features/feature-page-shell/feature-page-shell.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FeaturePageShellComponent, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  questions = [
    ['Who creates my portal account?', 'Only the system administrator creates and issues accounts for students, faculty, staff, and administrators.'],
    ['How do I enroll?', 'Use Enroll Now to submit the application. The registrar will review your information and follow up about your application.'],
    ['How are my grades computed?', 'Each instructor records component scores for the selected term. Your standing is based on thresholds set by the school.'],
    ['Can I request documents online?', 'Yes. Enrolled students can request certificates, transcripts, and clearance from the portal and track each status.'],
  ];
}
