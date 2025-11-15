import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  peopleOutline,
  personOutline,
  schoolOutline,
  ribbonOutline,
  heartOutline,
  heart
} from 'ionicons/icons';

interface Developer {
  name: string;
  role: string;
  university: string;
  degree: string;
  avatar: string;
}

@Component({
  selector: 'app-aboutdev',
  templateUrl: './aboutdev.page.html',
  styleUrls: ['./aboutdev.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonButtons,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonBackButton
  ]
})
export class AboutdevPage implements OnInit {
  developers: Developer[] = [
    {
      name: 'Sumit',
      role: 'BCA Student',
      university: 'Lovely Professional University',
      degree: 'Bachelor of Computer Applications',
      avatar: 'https://media.licdn.com/dms/image/v2/D5603AQGAtaSBOULJig/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722612535586?e=1764806400&v=beta&t=z5i5pMsGZlWPjalRBtXeq1Eb1Y93jjjvrhNsqKbT2OQ'
    },
    {
      name: 'Kunal',
      role: 'BCA Student',
      university: 'Lovely Professional University',
      degree: 'Bachelor of Computer Applications',
      avatar: 'https://media.licdn.com/dms/image/v2/D5603AQHNn_w_J7QFZg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729791949999?e=1764806400&v=beta&t=YuP8TFUcKyvzG-ciXZYjQESuJiVfwzIF7GQac3u3jik'
    },
    {
      name: 'Tejasvi',
      role: 'BCA Student',
      university: 'Lovely Professional University',
      degree: 'Bachelor of Computer Applications',
      avatar: 'https://ui-avatars.com/api/?name=Tejasvi&background=34D399&color=fff&size=200&bold=true'
    }
  ];

  constructor(private router: Router) {
    addIcons({
      chevronBackOutline,
      peopleOutline,
      personOutline,
      schoolOutline,
      ribbonOutline,
      heartOutline,
      heart
    });
  }

  ngOnInit() {
    // Trigger animations on load with Intersection Observer for better performance
    setTimeout(() => {
      const cards = document.querySelectorAll('.developer-card-wrapper');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-in');
        }, index * 200);
      });
    }, 400);
  }

  goBack() {
    this.router.navigate(['/tabs/tab5']);
  }
}
