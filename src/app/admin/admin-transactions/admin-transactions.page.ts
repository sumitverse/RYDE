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
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  arrowBackOutline,
  searchOutline,
  timeOutline,
  cashOutline,
  trendingUpOutline,
  trendingDownOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline,
  personCircleOutline,
  calendarOutline,
  refreshOutline
} from 'ionicons/icons';
import { AdminService, Transaction } from '../../services/admin.service';

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.page.html',
  styleUrls: ['./admin-transactions.page.scss'],
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
export class AdminTransactionsPage implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  searchQuery: string = '';
  selectedFilter: 'all' | 'credit' | 'debit' | 'completed' | 'pending' | 'failed' = 'all';
  isLoading: boolean = true;
  
  // Expose encodeURIComponent to template
  encodeURIComponent = encodeURIComponent;

  stats = {
    totalRevenue: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    addIcons({
      walletOutline,
      arrowBackOutline,
      searchOutline,
      timeOutline,
      cashOutline,
      trendingUpOutline,
      trendingDownOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      alertCircleOutline,
      personCircleOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    setTimeout(() => {
      this.transactions = this.adminService.getAllTransactions()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }

  calculateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.stats.totalRevenue = this.adminService.getTotalRevenue();
    this.stats.todayRevenue = this.adminService.getTodayRevenue();
    this.stats.totalTransactions = this.transactions.length;
    this.stats.completedTransactions = this.transactions.filter(t => t.status === 'completed').length;
    this.stats.pendingTransactions = this.transactions.filter(t => t.status === 'pending').length;
    this.stats.failedTransactions = this.transactions.filter(t => t.status === 'failed').length;
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.transactions];

    // Apply type filter
    if (this.selectedFilter === 'credit' || this.selectedFilter === 'debit') {
      filtered = filtered.filter(t => t.type === this.selectedFilter);
    } else if (this.selectedFilter === 'completed' || this.selectedFilter === 'pending' || this.selectedFilter === 'failed') {
      filtered = filtered.filter(t => t.status === this.selectedFilter);
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.userName.toLowerCase().includes(this.searchQuery) ||
        t.description.toLowerCase().includes(this.searchQuery) ||
        t.id.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredTransactions = filtered;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getTypeIcon(type: string): string {
    return type === 'credit' ? 'trending-up-outline' : 'trending-down-outline';
  }
}

