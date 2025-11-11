import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonListHeader,
  IonBadge,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  settingsOutline,
  walletOutline,
  bicycleOutline,
  timeOutline,
  logOutOutline,
  helpCircleOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  cardOutline,
  trophyOutline,
  speedometerOutline,
  flashOutline,
  informationCircleOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  cameraOutline,
  peopleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonAvatar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonListHeader,
    IonBadge
  ]
})
export class Tab5Page implements OnInit, ViewWillEnter {
  // User data
  userName: string = 'User';
  userEmail: string = 'user@ryde.com';
  userPhone: string = '+91 98765 43210';
  userAvatar: string = '';
  loggedInUserName: string = '';

  // Statistics
  totalRides: number = 0;
  totalDistance: number = 0;
  totalSaved: number = 0;
  carbonSaved: number = 0;
  memberSince: string = '2024';

  menuItems = [
    { icon: 'bicycle-outline', label: 'My Rides', route: '/totalrides', badge: null },
    { icon: 'wallet-outline', label: 'Wallet', route: '/tabs/tab4', badge: null },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notification', badge: null },
    { icon: 'settings-outline', label: 'Settings', route: '/setting', badge: null },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-and-support', badge: null },
    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', route: '/privacy', badge: null },
    { icon: 'information-circle-outline', label: 'About Us', route: '/about', badge: null },
    { icon: 'people-outline', label: 'About Developers', route: '', badge: null }
  ];

  achievements = [
    { icon: 'trophy-outline', title: 'First Ride', description: 'Completed your first ride', unlocked: true },
    { icon: 'flash-outline', title: 'Speed Demon', description: 'Reached 20+ km/h', unlocked: true },
    { icon: 'bicycle-outline', title: 'Ride Master', description: '100+ rides completed', unlocked: false }
  ];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      personOutline,
      settingsOutline,
      walletOutline,
      bicycleOutline,
      timeOutline,
      logOutOutline,
      helpCircleOutline,
      notificationsOutline,
      shieldCheckmarkOutline,
      cardOutline,
      trophyOutline,
      speedometerOutline,
      flashOutline,
      informationCircleOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      cameraOutline,
      peopleOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  ionViewWillEnter() {
    this.loadUserData();
    this.loadStats();
  }

  loadUserData() {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.loggedInUserName = userData.name || 'User';
        this.userName = this.loggedInUserName;
        this.userEmail = userData.email || 'user@ryde.com';
        this.userPhone = userData.phone || '+91 98765 43210';
        if (userData.photo || userData.avatar) {
          this.userAvatar = userData.photo || userData.avatar;
        } else if (this.loggedInUserName && this.loggedInUserName !== 'User') {
          this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.loggedInUserName) + '&background=10B981&color=fff';
        } else {
          this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
      }
    } else {
      this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
    }
  }

  loadStats() {
    // Get current user email to load user-specific stats
    const userData = localStorage.getItem('userData');
    let userEmail = 'default';

    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email || 'default';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Load user-specific stats
    const statsKey = `userStats_${userEmail}`;
    const savedStats = localStorage.getItem(statsKey) || localStorage.getItem('userStats');

    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        this.totalRides = stats.totalRides || 24;
        this.totalDistance = stats.totalDistance || 156.8;
        this.totalSaved = stats.totalSaved || 45.50;
        this.carbonSaved = stats.carbonSaved || 12.3;
      } catch (e) {
        console.error('Error loading stats:', e);
        this.totalRides = 24;
        this.totalDistance = 156.8;
        this.totalSaved = 45.50;
        this.carbonSaved = 12.3;
      }
    } else {
      // Default stats if none found
      this.totalRides = 24;
      this.totalDistance = 156.8;
      this.totalSaved = 45.50;
      this.carbonSaved = 12.3;
    }

    // Calculate member since date (3 months ago)
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 3);
    this.memberSince = joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  navigateTo(route: string, label?: string) {
    if (route) {
      this.router.navigate([route]);
    } else {
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            localStorage.removeItem('userData');
            localStorage.removeItem('activeRide');
            localStorage.removeItem('favorites');
            this.router.navigate(['/login']);
            this.showToast('Logged out successfully', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  @ViewChild('fileInput') fileInput!: any;

  selectPhoto() {
    this.fileInput.nativeElement.click();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Image size should be less than 5MB', 'danger');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result;
        this.userAvatar = imageData;

        const savedUser = localStorage.getItem('userData');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            userData.photo = imageData;
            userData.avatar = imageData;
            localStorage.setItem('userData', JSON.stringify(userData));
            this.showToast('Profile photo updated!', 'success');
          } catch (error) {
            console.error('Error updating photo:', error);
            this.showToast('Error updating photo', 'danger');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async editProfile() {
    this.selectPhoto();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
