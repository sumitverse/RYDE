import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/header/header.component';
import { addIcons } from 'ionicons';
import { qrCodeOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon
  ]
})
export class Tab3Page implements OnInit, ViewWillEnter {
  // User data
  userName: string = 'User';
  userAvatar: string = '';
  notificationCount: number = 0;

  // QR Scanning states: 'idle', 'scanning', 'success'
  scanningState: 'idle' | 'scanning' | 'success' = 'idle';
  isScanning: boolean = false;
  qrImageError: boolean = false;

  constructor() {
    addIcons({ qrCodeOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    this.loadUserFromStorage();
    this.updateNotificationCount();
    // Start scanning animation directly
    this.startScanning();
  }

  ionViewWillEnter() {
    this.loadUserFromStorage();
    this.updateNotificationCount();
    // Start scanning animation directly when entering the page
    this.startScanning();
  }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.userName = userData.name || 'User';
        if (userData.photo || userData.avatar) {
          this.userAvatar = userData.photo || userData.avatar;
        } else if (this.userName && this.userName !== 'User') {
          this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.userName = 'User';
      }
    } else {
      this.userName = 'User';
    }
  }

  updateNotificationCount() {
    // Load and count unread notifications
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications);
        this.notificationCount = notifications.filter((n: any) => !n.isRead).length;
      } catch (e) {
        this.notificationCount = 0;
      }
    } else {
      this.notificationCount = 0;
    }
  }

  startScanning() {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.scanningState = 'scanning';
    
    // Simulate QR scanning process (2-3 seconds)
    setTimeout(() => {
      this.scanningState = 'success';
      this.isScanning = false;
      
      // Keep showing success and QR image (don't auto-reset)
      // User can manually refresh or navigate away
    }, 2500);
  }

  onQrImageError(event: any) {
    this.qrImageError = true;
    console.error('QR image failed to load:', event);
  }
}