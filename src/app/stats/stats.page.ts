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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonBadge,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  statsChartOutline,
  bicycleOutline,
  speedometerOutline,
  walletOutline,
  trophyOutline,
  trendingUpOutline,
  trendingDownOutline,
  flameOutline,
  leafOutline,
  timeOutline,
  calendarOutline,
  medalOutline,
  starOutline,
  checkmarkCircleOutline,
  flashOutline,
  pulseOutline
} from 'ionicons/icons';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendValue?: string;
  progress?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
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
    IonButtons,
    IonBadge,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner
  ]
})
export class StatsPage implements OnInit {
  Math = Math; // Expose Math to template
  selectedPeriod: 'week' | 'month' | 'all' = 'all';
  isLoading: boolean = false;

  // Statistics data
  totalRides: number = 0;
  totalDistance: number = 0;
  totalSaved: number = 0;
  carbonSaved: number = 0;
  totalTime: number = 0;
  averageSpeed: number = 0;
  averageDistance: number = 0;

  // Period-specific statistics
  weekStats = {
    rides: 0,
    distance: 0,
    saved: 0,
    carbon: 0
  };

  monthStats = {
    rides: 0,
    distance: 0,
    saved: 0,
    carbon: 0
  };

  statCards: StatCard[] = [];

  achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Ride',
      description: 'Complete your first ride',
      icon: 'bicycle-outline',
      unlocked: true,
      progress: 100,
      target: 1
    },
    {
      id: '2',
      title: 'Century Club',
      description: 'Complete 100 rides',
      icon: 'trophy-outline',
      unlocked: false,
      progress: 0,
      target: 100
    },
    {
      id: '3',
      title: 'Distance Master',
      description: 'Ride 500 km total',
      icon: 'speedometer-outline',
      unlocked: false,
      progress: 0,
      target: 500
    },
    {
      id: '4',
      title: 'Eco Warrior',
      description: 'Save 50 kg of CO₂',
      icon: 'leaf-outline',
      unlocked: false,
      progress: 0,
      target: 50
    },
    {
      id: '5',
      title: 'Speed Demon',
      description: 'Average speed above 20 km/h',
      icon: 'flash-outline',
      unlocked: false,
      progress: 0,
      target: 20
    },
    {
      id: '6',
      title: 'Week Warrior',
      description: 'Complete 7 rides in a week',
      icon: 'calendar-outline',
      unlocked: false,
      progress: 0,
      target: 7
    }
  ];

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline,
      statsChartOutline,
      bicycleOutline,
      speedometerOutline,
      walletOutline,
      trophyOutline,
      trendingUpOutline,
      trendingDownOutline,
      flameOutline,
      leafOutline,
      timeOutline,
      calendarOutline,
      medalOutline,
      starOutline,
      checkmarkCircleOutline,
      flashOutline,
      pulseOutline
    });
  }

  ngOnInit() {
    this.loadStats();
    this.updateStatCards();
    this.updateAchievements();
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
    const saved = localStorage.getItem(statsKey) || localStorage.getItem('userStats');

    if (saved) {
      try {
        const stats = JSON.parse(saved);
        this.totalRides = stats.totalRides || 0;
        this.totalDistance = stats.totalDistance || 0;
        this.totalSaved = stats.totalSaved || 0;
        this.carbonSaved = stats.carbonSaved || 0;
      } catch (e) {
        console.error('Error loading stats:', e);
        this.initializeDefaultStats();
      }
    } else {
      this.initializeDefaultStats();
    }

    this.calculateDerivedStats();
    this.calculatePeriodStats();
  }

  initializeDefaultStats() {
    this.totalRides = 24;
    this.totalDistance = 156.8;
    this.totalSaved = 45.50;
    this.carbonSaved = 12.3;
  }

  calculateDerivedStats() {
    this.averageDistance = this.totalRides > 0 ? this.totalDistance / this.totalRides : 0;

    this.totalTime = this.totalDistance > 0 ? Math.round((this.totalDistance / 15) * 60) : 0;

    this.averageSpeed = 15.2;
  }

  calculatePeriodStats() {
    this.weekStats = {
      rides: Math.floor(this.totalRides * 0.15),
      distance: Math.round((this.totalDistance * 0.15) * 10) / 10,
      saved: Math.round((this.totalSaved * 0.15) * 100) / 100,
      carbon: Math.round((this.carbonSaved * 0.15) * 10) / 10
    };

    this.monthStats = {
      rides: Math.floor(this.totalRides * 0.4),
      distance: Math.round((this.totalDistance * 0.4) * 10) / 10,
      saved: Math.round((this.totalSaved * 0.4) * 100) / 100,
      carbon: Math.round((this.carbonSaved * 0.4) * 10) / 10
    };
  }

  updateStatCards() {
    const currentStats = this.getCurrentPeriodStats();

    this.statCards = [
      {
        title: 'Total Rides',
        value: currentStats.rides,
        icon: 'bicycle-outline',
        color: 'primary',
        trend: 'up',
        trendValue: '+12%',
        progress: Math.min((currentStats.rides / 100) * 100, 100)
      },
      {
        title: 'Distance Covered',
        value: `${currentStats.distance.toFixed(1)} km`,
        icon: 'speedometer-outline',
        color: 'success',
        trend: 'up',
        trendValue: '+8%',
        progress: Math.min((currentStats.distance / 500) * 100, 100)
      },
      {
        title: 'Money Saved',
        value: `₹${currentStats.saved.toFixed(2)}`,
        icon: 'wallet-outline',
        color: 'warning',
        trend: 'up',
        trendValue: '+5%',
        progress: Math.min((currentStats.saved / 200) * 100, 100)
      },
      {
        title: 'CO₂ Saved',
        value: `${currentStats.carbon.toFixed(1)} kg`,
        icon: 'leaf-outline',
        color: 'tertiary',
        trend: 'up',
        trendValue: '+15%',
        progress: Math.min((currentStats.carbon / 50) * 100, 100)
      },
      {
        title: 'Total Time',
        value: `${Math.floor(this.totalTime / 60)}h ${this.totalTime % 60}m`,
        icon: 'time-outline',
        color: 'medium',
        progress: Math.min((this.totalTime / 1000) * 100, 100)
      },
      {
        title: 'Avg Speed',
        value: `${this.averageSpeed.toFixed(1)} km/h`,
        icon: 'flash-outline',
        color: 'danger',
        progress: Math.min((this.averageSpeed / 30) * 100, 100)
      }
    ];
  }

  getCurrentPeriodStats() {
    switch (this.selectedPeriod) {
      case 'week':
        return this.weekStats;
      case 'month':
        return this.monthStats;
      default:
        return {
          rides: this.totalRides,
          distance: this.totalDistance,
          saved: this.totalSaved,
          carbon: this.carbonSaved
        };
    }
  }

  updateAchievements() {
    this.achievements[0].unlocked = this.totalRides >= 1;
    this.achievements[0].progress = Math.min((this.totalRides / 1) * 100, 100);

    this.achievements[1].unlocked = this.totalRides >= 100;
    this.achievements[1].progress = Math.min((this.totalRides / 100) * 100, 100);

    this.achievements[2].unlocked = this.totalDistance >= 500;
    this.achievements[2].progress = Math.min((this.totalDistance / 500) * 100, 100);

    this.achievements[3].unlocked = this.carbonSaved >= 50;
    this.achievements[3].progress = Math.min((this.carbonSaved / 50) * 100, 100);

    this.achievements[4].unlocked = this.averageSpeed >= 20;
    this.achievements[4].progress = Math.min((this.averageSpeed / 20) * 100, 100);

    this.achievements[5].unlocked = this.weekStats.rides >= 7;
    this.achievements[5].progress = Math.min((this.weekStats.rides / 7) * 100, 100);
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.detail.value;
    this.updateStatCards();
  }

  getUnlockedAchievementsCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}
