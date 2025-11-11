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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonProgressBar,
  IonChip,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  speedometerOutline,
  calendarOutline,
  trendingUpOutline,
  trendingDownOutline,
  trophyOutline,
  flameOutline,
  timeOutline,
  locationOutline,
  statsChartOutline,
  bicycleOutline,
  pulseOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

interface DistanceStat {
  date: string;
  distance: number;
  rides: number;
  duration: number;
}

interface PeriodStats {
  totalDistance: number;
  totalRides: number;
  averageDistance: number;
  averageSpeed: number;
  totalDuration: number;
  carbonSaved: number;
  moneySaved: number;
}

@Component({
  selector: 'app-distance',
  templateUrl: './distance.page.html',
  styleUrls: ['./distance.page.scss'],
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
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonProgressBar,
    IonChip,
    IonBadge
  ]
})
export class DistancePage implements OnInit, ViewWillEnter {
  // Filter period
  selectedPeriod: 'today' | 'week' | 'month' | 'all' = 'all';

  // Current period statistics
  currentStats: PeriodStats = {
    totalDistance: 0,
    totalRides: 0,
    averageDistance: 0,
    averageSpeed: 0,
    totalDuration: 0,
    carbonSaved: 0,
    moneySaved: 0
  };

  // All-time statistics
  allTimeStats: PeriodStats = {
    totalDistance: 0,
    totalRides: 0,
    averageDistance: 0,
    averageSpeed: 0,
    totalDuration: 0,
    carbonSaved: 0,
    moneySaved: 0
  };

  // Breakdown data
  weeklyBreakdown: { day: string; distance: number; rides: number }[] = [];
  monthlyBreakdown: { month: string; distance: number; rides: number }[] = [];

  // Milestones and trends
  milestones: { label: string; target: number; current: number; percentage: number }[] = [];
  recentRides: DistanceStat[] = [];
  trendPercentage: number = 0;
  trendDirection: 'up' | 'down' = 'up';

  Math = Math; // Expose Math to template

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline,
      speedometerOutline,
      calendarOutline,
      trendingUpOutline,
      trendingDownOutline,
      trophyOutline,
      flameOutline,
      timeOutline,
      locationOutline,
      statsChartOutline,
      bicycleOutline,
      pulseOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.loadDistanceData();
    this.calculateStats();
    this.generateBreakdowns();
    this.generateMilestones();
    this.loadRecentRides();
    this.calculateTrends();
  }

  ionViewWillEnter() {
    this.loadDistanceData();
    this.calculateStats();
    this.generateBreakdowns();
    this.generateMilestones();
    this.loadRecentRides();
    this.calculateTrends();
  }

  loadDistanceData() {
    // Get current user email to load user-specific data
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
        this.allTimeStats.totalDistance = stats.totalDistance || 0;
        this.allTimeStats.totalRides = stats.totalRides || 0;
        this.allTimeStats.carbonSaved = stats.carbonSaved || 0;
        this.allTimeStats.moneySaved = stats.totalSaved || 0;
      } catch (e) {
        console.error('Error loading stats:', e);
        this.initializeDefaultStats(userEmail);
      }
    } else {
      this.initializeDefaultStats(userEmail);
    }

    const historyKey = `rideHistory_${userEmail}`;
    const rideHistory = localStorage.getItem(historyKey) || localStorage.getItem('rideHistory');

    if (rideHistory) {
      try {
        const history = JSON.parse(rideHistory);
        this.recentRides = history.map((day: any) => ({
          date: day.date,
          distance: day.distance || 0,
          rides: day.rides || 0,
          duration: day.duration || 0
        }));
        this.recentRides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (e) {
        console.error('Error loading ride history:', e);
        this.recentRides = [];
      }
    } else {
      this.recentRides = [];
    }
  }

  initializeDefaultStats(userEmail: string) {
    this.allTimeStats.totalDistance = 156.8;
    this.allTimeStats.totalRides = 24;
    this.allTimeStats.carbonSaved = 12.3;
    this.allTimeStats.moneySaved = 45.50;

    const statsKey = `userStats_${userEmail}`;
    const defaultStats = {
      totalDistance: 156.8,
      totalRides: 24,
      carbonSaved: 12.3,
      totalSaved: 45.50
    };
    localStorage.setItem(statsKey, JSON.stringify(defaultStats));
    localStorage.setItem('userStats', JSON.stringify(defaultStats));
  }

  calculateStats() {
    const now = new Date();
    let filteredRides: DistanceStat[] = [];

    switch (this.selectedPeriod) {
      case 'today':
        filteredRides = this.recentRides.filter(ride => {
          const rideDate = new Date(ride.date);
          return rideDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredRides = this.recentRides.filter(ride => {
          const rideDate = new Date(ride.date);
          return rideDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredRides = this.recentRides.filter(ride => {
          const rideDate = new Date(ride.date);
          return rideDate >= monthAgo;
        });
        break;
      case 'all':
        filteredRides = this.recentRides;
        break;
    }

    this.currentStats.totalDistance = filteredRides.reduce((sum, ride) => sum + ride.distance, 0);
    this.currentStats.totalRides = filteredRides.reduce((sum, ride) => sum + ride.rides, 0);
    this.currentStats.totalDuration = filteredRides.reduce((sum, ride) => sum + ride.duration, 0);
    this.currentStats.averageDistance = this.currentStats.totalRides > 0 
      ? this.currentStats.totalDistance / this.currentStats.totalRides 
      : 0;
    this.currentStats.averageSpeed = this.currentStats.totalDuration > 0
      ? parseFloat((this.currentStats.totalDistance / (this.currentStats.totalDuration / 60)).toFixed(1))
      : 0;

    this.currentStats.carbonSaved = this.currentStats.totalDistance * 0.2;

    this.currentStats.moneySaved = this.currentStats.totalDistance * 0.3;
  }

  generateBreakdowns() {
    const now = new Date();

    this.weeklyBreakdown = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRides = this.recentRides.filter(ride => ride.date === dateStr);
      const distance = dayRides.reduce((sum, ride) => sum + ride.distance, 0);
      const rides = dayRides.reduce((sum, ride) => sum + ride.rides, 0);

      this.weeklyBreakdown.push({
        day: days[date.getDay()],
        distance: parseFloat(distance.toFixed(2)),
        rides: rides
      });
    }

    this.monthlyBreakdown = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthRides = this.recentRides.filter(ride => {
        const rideDate = new Date(ride.date);
        return `${rideDate.getFullYear()}-${String(rideDate.getMonth() + 1).padStart(2, '0')}` === monthStr;
      });

      const distance = monthRides.reduce((sum, ride) => sum + ride.distance, 0);
      const rides = monthRides.reduce((sum, ride) => sum + ride.rides, 0);

      this.monthlyBreakdown.push({
        month: months[date.getMonth()],
        distance: parseFloat(distance.toFixed(2)),
        rides: rides
      });
    }
  }

  generateMilestones() {
    const total = this.allTimeStats.totalDistance;

    this.milestones = [
      { label: '100 km', target: 100, current: total, percentage: Math.min((total / 100) * 100, 100) },
      { label: '500 km', target: 500, current: total, percentage: Math.min((total / 500) * 100, 100) },
      { label: '1000 km', target: 1000, current: total, percentage: Math.min((total / 1000) * 100, 100) },
      { label: '5000 km', target: 5000, current: total, percentage: Math.min((total / 5000) * 100, 100) }
    ];
  }

  loadRecentRides() {
    this.recentRides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  calculateTrends() {
    if (this.weeklyBreakdown.length < 2) return;

    const thisWeek = this.weeklyBreakdown.slice(-1)[0].distance;
    const lastWeek = this.weeklyBreakdown[0].distance;

    if (lastWeek > 0) {
      this.trendPercentage = ((thisWeek - lastWeek) / lastWeek) * 100;
      this.trendDirection = this.trendPercentage >= 0 ? 'up' : 'down';
    }
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.detail.value;
    this.calculateStats();
  }

  getMaxDistance(): number {
    if (this.selectedPeriod === 'week') {
      return Math.max(...this.weeklyBreakdown.map(d => d.distance), 1);
    } else if (this.selectedPeriod === 'month') {
      return Math.max(...this.monthlyBreakdown.map(d => d.distance), 1);
    }
    return this.currentStats.totalDistance || 1;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}
