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
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  statsChartOutline,
  bicycleOutline,
  peopleOutline,
  walletOutline,
  calendarOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  timeOutline,
  cashOutline,
  arrowForwardOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  logInOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
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
    IonBackButton
  ]
})
export class AdminDashboardPage implements OnInit {
  stats: any = {};
  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    addIcons({
      statsChartOutline,
      bicycleOutline,
      peopleOutline,
      walletOutline,
      calendarOutline,
      trendingUpOutline,
      checkmarkCircleOutline,
      timeOutline,
      cashOutline,
      arrowForwardOutline,
      refreshOutline,
      shieldCheckmarkOutline,
      logInOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    setTimeout(() => {
      this.stats = this.adminService.getDashboardStats();
      this.isLoading = false;
    }, 500);
  }

  navigateTo(page: string) {
    this.router.navigate([`/admin/${page}`]);
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toFixed(2);
  }
}

