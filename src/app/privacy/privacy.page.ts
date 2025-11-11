import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  eyeOutline,
  documentTextOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  lockOpenOutline,
  serverOutline,
  peopleOutline,
  keyOutline,
  globeOutline,
  timeOutline,
  mailOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel
  ]
})
export class PrivacyPage implements OnInit {
  lastUpdated: string = 'January 2024';

  privacySections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: 'informationCircleOutline',
      content: `Welcome to CampusCycle! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.`
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: 'documentTextOutline',
      content: `We collect information that you provide directly to us, including:
• Account Information: Name, email address, phone number, and profile photo
• Ride Information: Ride history, locations, duration, and payment details
• Device Information: Device type, operating system, and unique device identifiers
• Location Data: Current location and ride start/end locations
• Payment Information: Wallet balance and transaction history`
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: 'eyeOutline',
      content: `We use the collected information for various purposes:
• To provide and maintain our services
• To process your ride bookings and payments
• To send you notifications and updates
• To improve our services and user experience
• To detect and prevent fraud or abuse
• To comply with legal obligations`
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      icon: 'peopleOutline',
      content: `We do not sell your personal information. We may share your information only in the following circumstances:
• With service providers who assist us in operating our platform
• When required by law or to protect our rights
• In case of a business transfer or merger
• With your explicit consent`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: 'lockClosedOutline',
      content: `We implement appropriate technical and organizational measures to protect your personal information:
• Encryption of data in transit and at rest
• Secure authentication and access controls
• Regular security audits and updates
• Limited access to personal data on a need-to-know basis`
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: 'checkmarkCircleOutline',
      content: `You have the following rights regarding your personal information:
• Access: Request access to your personal data
• Correction: Request correction of inaccurate data
• Deletion: Request deletion of your personal data
• Portability: Request transfer of your data
• Objection: Object to processing of your data
• Withdrawal: Withdraw consent at any time`
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: 'globeOutline',
      content: `We use cookies and similar tracking technologies to track activity on our app and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.`
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: 'timeOutline',
      content: `We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.`
    },
    {
      id: 'children',
      title: 'Children\'s Privacy',
      icon: 'shieldCheckmarkOutline',
      content: `Our service is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.`
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      icon: 'documentTextOutline',
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.`
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: 'informationCircleOutline',
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:
• Email: privacy@campuscycle.com
• Phone: +1 (555) 123-4567
• Address: 123 Campus Street, University City, State 12345`
    }
  ];

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline,
      shieldCheckmarkOutline,
      lockClosedOutline,
      eyeOutline,
      documentTextOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
      lockOpenOutline,
      serverOutline,
      peopleOutline,
      keyOutline,
      globeOutline,
      timeOutline,
      mailOutline
    });
  }

  ngOnInit() {
    const updateDate = new Date();
    this.lastUpdated = updateDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  contactUs() {
    this.router.navigate(['/help-and-support']);
  }

}
