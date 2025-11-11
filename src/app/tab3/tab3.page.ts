import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/header/header.component';

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
    IonTitle
  ]
})
export class Tab3Page implements OnInit, ViewWillEnter {
  // User data
  userName: string = 'User';
  userAvatar: string = '';
  notificationCount: number = 0;

  constructor() {}

  ngOnInit() {
    this.loadUserFromStorage();
    this.updateNotificationCount();
  }

  ionViewWillEnter() {
    this.loadUserFromStorage();
    this.updateNotificationCount();
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
}