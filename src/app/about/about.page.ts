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
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  bicycleOutline,
  mailOutline,
  callOutline,
  flashOutline,
  shieldCheckmarkOutline,
  walletOutline,
  leafOutline,
  locationOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
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
    IonCard,
    IonCardContent
  ]
})
export class AboutPage implements OnInit {
  features = [
    {
      icon: 'bicycle-outline',
      title: 'Easy Booking'
    },
    {
      icon: 'location-outline',
      title: 'Find Nearby'
    },
    {
      icon: 'wallet-outline',
      title: 'Affordable'
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Secure'
    },
    {
      icon: 'leaf-outline',
      title: 'Eco-Friendly'
    },
    {
      icon: 'flash-outline',
      title: 'Fast & Convenient'
    }
  ];

  constructor(
    private router: Router
  ) {
    addIcons({
      chevronBackOutline,
      bicycleOutline,
      mailOutline,
      callOutline,
      flashOutline,
      shieldCheckmarkOutline,
      walletOutline,
      leafOutline,
      locationOutline
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/tabs/tab5']);
  }
}
