import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bicycleOutline,
  personCircleOutline,
  searchOutline,
  notificationsOutline,
  notifications
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonBadge
  ]
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() userName: string = 'User';
  @Input() userAvatar: string = '';
  @Input() notificationCount: number = 0;

  constructor(private router: Router) {
    addIcons({
      bicycleOutline,
      personCircleOutline,
      searchOutline,
      notificationsOutline,
      notifications
    });
  }

  ngOnInit() {
    if (!this.userName || this.userName === 'User') {
      this.loadUserFromStorage();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // When userName or userAvatar input changes, update the component
    if (changes['userName'] || changes['userAvatar']) {
      // Input properties are already updated by Angular, just ensure avatar is set
      if (this.userName && this.userName !== 'User' && !this.userAvatar) {
        this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
      }
    }
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
    }
  }

  onNotificationClick() {
    this.router.navigate(['/notification']);
  }

  onProfileClick() {
    this.router.navigate(['/tabs/tab5']);
  }

  onSearchClick() {
    const searchBar = document.querySelector('ion-searchbar');
    if (searchBar) {
      (searchBar as any).setFocus();
    }
  }
}
