import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  arrowBackOutline,
  searchOutline,
  timeOutline,
  logInOutline,
  logOutOutline,
  personCircleOutline,
  mailOutline,
  phonePortraitOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  walletOutline,
  sendOutline
} from 'ionicons/icons';
import { AdminService, UserLogin } from '../../services/admin.service';
import { EmailService } from '../../services/email.service';

interface UserWithLogins {
  userId: string;
  userName: string;
  userEmail: string;
  totalLogins: number;
  lastLogin?: Date;
  totalSessionTime: number; // in minutes
  logins: UserLogin[];
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonChip,
    IonSearchbar,
    IonSegment,
    IonSegmentButton
  ]
})
export class AdminUsersPage implements OnInit {
  loginHistory: UserLogin[] = [];
  usersWithLogins: UserWithLogins[] = [];
  filteredUsers: UserWithLogins[] = [];
  searchQuery: string = '';
  selectedView: 'users' | 'logins' = 'users';
  isLoading: boolean = true;
  activeSessionsCount: number = 0;
  
  // Expose encodeURIComponent to template
  encodeURIComponent = encodeURIComponent;

  constructor(
    private adminService: AdminService,
    private emailService: EmailService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      peopleOutline,
      arrowBackOutline,
      searchOutline,
      timeOutline,
      logInOutline,
      logOutOutline,
      personCircleOutline,
      mailOutline,
      phonePortraitOutline,
      calendarOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      walletOutline,
      sendOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    setTimeout(() => {
      this.loginHistory = this.adminService.getLoginHistory();
      this.processUserData();
      this.isLoading = false;
    }, 500);
  }

  processUserData() {
    const userMap = new Map<string, UserWithLogins>();

    // Group logins by user
    this.loginHistory.forEach(login => {
      if (!userMap.has(login.userId)) {
        userMap.set(login.userId, {
          userId: login.userId,
          userName: login.userName,
          userEmail: login.userEmail,
          totalLogins: 0,
          totalSessionTime: 0,
          logins: []
        });
      }

      const user = userMap.get(login.userId)!;
      user.totalLogins++;
      user.logins.push(login);
      
      if (login.sessionDuration) {
        user.totalSessionTime += login.sessionDuration;
      }

      // Update last login
      if (!user.lastLogin || new Date(login.loginTime) > new Date(user.lastLogin)) {
        user.lastLogin = new Date(login.loginTime);
      }
    });

    this.usersWithLogins = Array.from(userMap.values())
      .sort((a, b) => {
        if (b.lastLogin && a.lastLogin) {
          return b.lastLogin.getTime() - a.lastLogin.getTime();
        }
        return b.totalLogins - a.totalLogins;
      });

    this.filteredUsers = [...this.usersWithLogins];
    this.activeSessionsCount = this.loginHistory.filter(l => !l.logoutTime).length;
  }

  onViewChange(event: any) {
    this.selectedView = event.detail.value;
    this.searchQuery = '';
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    if (this.selectedView === 'users') {
      this.filteredUsers = this.usersWithLogins.filter(user =>
        user.userName.toLowerCase().includes(this.searchQuery) ||
        user.userEmail.toLowerCase().includes(this.searchQuery)
      );
    } else {
      // Filter login history
      this.loginHistory = this.loginHistory.filter(login =>
        login.userName.toLowerCase().includes(this.searchQuery) ||
        login.userEmail.toLowerCase().includes(this.searchQuery)
      );
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  isActiveSession(login: UserLogin): boolean {
    return !login.logoutTime;
  }

  /**
   * Send wallet empty email to a user
   */
  async sendWalletEmptyEmail(user: UserWithLogins): Promise<void> {
    try {
      // Show loading toast
      const loadingToast = await this.toastController.create({
        message: 'Sending email...',
        duration: 2000,
        color: 'primary',
        position: 'bottom'
      });
      await loadingToast.present();

      // Send email
      const emailSent = await this.emailService.sendWalletEmptyEmail(
        user.userEmail,
        user.userName
      );

      await loadingToast.dismiss();

      if (emailSent) {
        await this.showToast(`Email sent to ${user.userName} successfully!`, 'success');
      } else {
        await this.showToast(`Failed to send email to ${user.userName}`, 'danger');
      }
    } catch (error) {
      console.error('Error sending wallet empty email:', error);
      await this.showToast('Error sending email. Please try again.', 'danger');
    }
  }

  /**
   * Get wallet balance for a user
   */
  getUserWalletBalance(user: UserWithLogins): number {
    return this.adminService.getUserWalletBalanceByEmail(user.userEmail);
  }

  /**
   * Check if user has empty wallet
   */
  hasEmptyWallet(user: UserWithLogins): boolean {
    return this.getUserWalletBalance(user) === 0;
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

