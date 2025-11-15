import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
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
  IonItem,
  IonLabel,
  IonBadge,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bicycleOutline,
  walletOutline,
  flashOutline,
  trophyOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  notificationsOutline,
  notifications,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkDoneOutline,
  trashOutline
} from 'ionicons/icons';

interface Notification {
  id: string;
  type: 'ride' | 'payment' | 'offer' | 'achievement' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  color: string;
  action?: string;
  timestamp?: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
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
    IonItem,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonBackButton,
    IonButtons
  ]
})
export class NotificationPage implements OnInit, ViewWillEnter {
  notifications: Notification[] = [];
  unreadCount: number = 0;

  constructor(private router: Router) {
    addIcons({
      bicycleOutline,
      walletOutline,
      flashOutline,
      trophyOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      notificationsOutline,
      notifications,
      chevronBackOutline,
      chevronForwardOutline,
      checkmarkDoneOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  ionViewWillEnter() {
    this.loadNotifications();
  }

  loadNotifications() {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notifications = parsed.map((notif: any) => {
            if (notif.timestamp && !notif.time) {
              notif.time = this.getTimeAgo(new Date(notif.timestamp));
            }
            return notif;
          });
        } else {
          this.notifications = this.getMockNotifications();
          this.saveNotifications();
        }
      } catch (e) {
        console.error('Error parsing notifications:', e);
        this.notifications = this.getMockNotifications();
        this.saveNotifications();
      }
    } else {
      this.notifications = this.getMockNotifications();
      this.saveNotifications();
    }
    this.updateUnreadCount();
    console.log('Loaded notifications:', this.notifications.length);
  }

  getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: 'ride',
        title: 'Ride Completed Successfully',
        message: 'Your ride from Library Block to Cafeteria has been completed. Total distance: 2.5 km.',
        time: '5 minutes ago',
        isRead: false,
        icon: 'bicycle-outline',
        color: 'primary',
        action: 'View Details'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received ₹25.50 for your recent ride completion. Amount credited to your wallet.',
        time: '1 hour ago',
        isRead: false,
        icon: 'wallet-outline',
        color: 'success',
        action: 'View Wallet'
      },
      {
        id: '3',
        type: 'offer',
        title: 'Weekend Special Offer',
        message: 'Get 20% off on all rides this weekend! Use code WEEKEND20 at checkout.',
        time: '3 hours ago',
        isRead: false,
        icon: 'flash-outline',
        color: 'warning',
        action: 'View Offer'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked! 🎉',
        message: 'Congratulations! You\'ve completed 25 rides. You\'re now a RYDE Champion!',
        time: '1 day ago',
        isRead: true,
        icon: 'trophy-outline',
        color: 'tertiary',
        action: 'View Achievement'
      },
      {
        id: '5',
        type: 'ride',
        title: 'Ride Started',
        message: 'Your ride has started. Enjoy your journey! Remember to end the ride when you reach your destination.',
        time: '2 days ago',
        isRead: true,
        icon: 'bicycle-outline',
        color: 'primary',
        action: 'View Ride'
      },
      {
        id: '6',
        type: 'system',
        title: 'Welcome to RYDE!',
        message: 'Thank you for joining RYDE! Explore our features and start your first ride today.',
        time: '3 days ago',
        isRead: true,
        icon: 'notifications-outline',
        color: 'medium',
        action: 'Get Started'
      }
    ];
  }

  markAsRead(notification: Notification) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.updateUnreadCount();
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notif => {
      notif.isRead = true;
    });
    this.updateUnreadCount();
    this.saveNotifications();
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.updateUnreadCount();
    this.saveNotifications();
  }

  onNotificationClick(notification: Notification) {
    this.markAsRead(notification);

    if (notification.action === 'Get Started') {
      this.router.navigate(['/tabs/tab1']);
      return;
    }

    switch (notification.type) {
      case 'ride':
        if (notification.title === 'Booking Confirmed' || notification.id?.startsWith('booking-')) {
          this.router.navigate(['/tabs/tab1']);
        } else {
          this.router.navigate(['/totalrides']);
        }
        break;
      case 'payment':
        this.router.navigate(['/tabs/tab4']);
        break;
      case 'offer':
        if (notification.title === 'Weekend Special Offer' || notification.id === '3') {
          this.navigateToWeekendOffer();
        } else {
          this.router.navigate(['/tabs/tab1']);
        }
        break;
      case 'achievement':
        this.router.navigate(['/tabs/tab5']);
        break;
      case 'system':
        if (notification.action === 'Get Started' || notification.title === 'Welcome to RYDE!') {
          this.router.navigate(['/tabs/tab1']);
        }
        break;
      default:
        break;
    }
  }

  navigateToWeekendOffer() {
    const weekendOffer = {
      id: '1',
      title: 'Weekend Special',
      description: 'Get 20% off on weekend rides',
      image: 'https://via.placeholder.com/300x200?text=Weekend+Special',
      discount: '20% OFF',
      discountPercent: 20,
      code: 'WEEKEND20',
      validUntil: this.getWeekendEndDate(),
      terms: 'This offer is valid for all cycle rentals on weekends (Saturday and Sunday). Discount will be applied at the end of your ride. Use code WEEKEND20 at checkout.'
    };

    const savedOffers = localStorage.getItem('offers');
    let offers = [];
    if (savedOffers) {
      try {
        offers = JSON.parse(savedOffers);
        const existingIndex = offers.findIndex((o: any) => o.id === '1');
        if (existingIndex >= 0) {
          offers[existingIndex] = weekendOffer;
        } else {
          offers.unshift(weekendOffer);
        }
      } catch (e) {
        console.error('Error parsing saved offers:', e);
        offers = [weekendOffer];
      }
    } else {
      offers = [weekendOffer];
    }

    localStorage.setItem('offers', JSON.stringify(offers));

    this.router.navigate(['/offer-details', '1'], {
      state: { offer: weekendOffer }
    }).then(
      (success) => console.log('Navigation to weekend offer successful:', success),
      (error) => console.error('Navigation error:', error)
    );
  }

  getWeekendEndDate(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString().split('T')[0];
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}
