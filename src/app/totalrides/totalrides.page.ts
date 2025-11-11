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
  IonChip,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  bicycleOutline,
  calendarOutline,
  timeOutline,
  speedometerOutline,
  flashOutline,
  locationOutline,
  checkmarkCircleOutline,
  trendingUpOutline
} from 'ionicons/icons';

interface Ride {
  id: string;
  cycleName: string;
  date: string;
  distance: number;
  duration: number;
  fare: number;
  status: 'completed' | 'cancelled';
}

@Component({
  selector: 'app-totalrides',
  templateUrl: './totalrides.page.html',
  styleUrls: ['./totalrides.page.scss'],
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
    IonChip,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ]
})
export class TotalridesPage implements OnInit, ViewWillEnter {
  selectedFilter: 'today' | 'all' = 'all';
  totalRides: number = 0;
  filteredRides: Ride[] = [];
  allRides: Ride[] = [];
  allTimeTotalRides: number = 0;
  allTimeTotalDistance: number = 0;
  allTimeTotalDuration: number = 0;
  allTimeTotalSpent: number = 0;

  Math = Math;

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline,
      bicycleOutline,
      calendarOutline,
      timeOutline,
      speedometerOutline,
      flashOutline,
      locationOutline,
      checkmarkCircleOutline,
      trendingUpOutline
    });
  }

  ngOnInit() {
    this.loadRides();
  }

  ionViewWillEnter() {
    this.loadRides();
  }

  loadRides() {
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

    const individualRidesKey = `individualRides_${userEmail}`;
    const savedIndividualRides = localStorage.getItem(individualRidesKey);

    this.allRides = [];

    if (savedIndividualRides) {
      try {
        const individualRides = JSON.parse(savedIndividualRides);

        const sortedIndividualRides = [...individualRides].sort((a: any, b: any) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeB - timeA;
        });

        sortedIndividualRides.forEach((rideData: any) => {
          const ride: Ride = {
            id: rideData.id || `${rideData.date}-${Date.now()}`,
            cycleName: rideData.cycleName || 'Cycle',
            date: rideData.date,
            distance: rideData.distance || 0,
            duration: rideData.duration || 0,
            fare: rideData.fare || 0,
            status: 'completed'
          };

          this.allRides.push(ride);
        });
      } catch (e) {
        console.error('Error parsing individual rides:', e);
      }
    }

    if (this.allRides.length === 0) {
      const historyKey = `rideHistory_${userEmail}`;
      const rideHistory = localStorage.getItem(historyKey) || localStorage.getItem('rideHistory');

      const savedTransactions = localStorage.getItem('walletTransactions');
      let transactions: any[] = [];

      if (savedTransactions) {
        try {
          transactions = JSON.parse(savedTransactions);
          transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (e) {
          console.error('Error parsing transactions:', e);
        }
      }

      if (rideHistory) {
        try {
          const history = JSON.parse(rideHistory);
          const sortedHistory = [...history].sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          sortedHistory.forEach((day: any, dayIndex: number) => {
            const dayTransactions = transactions.filter(t => 
              t.description.includes('Cycle Rental') && 
              t.type === 'debit' &&
              new Date(t.date).toISOString().split('T')[0] === day.date
            );

            for (let i = 0; i < day.rides; i++) {
              const transaction = dayTransactions[i] || null;

              let cycleName = 'Cycle';
              if (transaction?.description) {
                const desc = transaction.description;
                if (desc.includes('Cycle Rental - ')) {
                  cycleName = desc.replace('Cycle Rental - ', '').split(' (')[0].trim();
                }
              }

              const ride: Ride = {
                id: `${day.date}-${i}`,
                cycleName: cycleName,
                date: day.date,
                distance: day.rides > 0 ? day.distance / day.rides : 0,
                duration: day.rides > 0 ? Math.floor(day.duration / day.rides) : 0,
                fare: transaction?.amount || 0,
                status: 'completed'
              };

              this.allRides.push(ride);
            }
          });
        } catch (e) {
          console.error('Error parsing ride history:', e);
          this.allRides = [];
        }
      }
    }

    this.allRides.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });

    this.loadTotalRidesFromStats(userEmail);

    this.applyFilter();
  }

  loadTotalRidesFromStats(userEmail: string) {
    const statsKey = `userStats_${userEmail}`;
    const savedStats = localStorage.getItem(statsKey) || localStorage.getItem('userStats');

    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        this.allTimeTotalRides = stats.totalRides || this.allRides.length;
        this.allTimeTotalDistance = stats.totalDistance || 0;
      } catch (e) {
        console.error('Error loading stats:', e);
        this.allTimeTotalRides = this.allRides.length;
        this.allTimeTotalDistance = 0;
      }
    } else {
      this.allTimeTotalRides = this.allRides.length;
      this.allTimeTotalDistance = 0;
    }

    const historyKey = `rideHistory_${userEmail}`;
    const rideHistory = localStorage.getItem(historyKey) || localStorage.getItem('rideHistory');
    if (rideHistory) {
      try {
        const history = JSON.parse(rideHistory);
        this.allTimeTotalDuration = history.reduce((sum: number, day: any) => sum + (day.duration || 0), 0);
      } catch (e) {
        console.error('Error calculating total duration:', e);
        this.allTimeTotalDuration = 0;
      }
    }

    const savedTransactions = localStorage.getItem('walletTransactions');
    if (savedTransactions) {
      try {
        const transactions = JSON.parse(savedTransactions);
        this.allTimeTotalSpent = transactions
          .filter((t: any) => t.description.includes('Cycle Rental') && t.type === 'debit')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      } catch (e) {
        console.error('Error calculating total spent:', e);
        this.allTimeTotalSpent = 0;
      }
    }
  }

  applyFilter() {
    const today = new Date().toISOString().split('T')[0];

    if (this.selectedFilter === 'today') {
      this.filteredRides = this.allRides.filter(ride => ride.date === today);
      this.totalRides = this.filteredRides.length;
    } else {
      this.filteredRides = this.allRides;
      this.totalRides = this.allTimeTotalRides;
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getTotalDistance(): number {
    if (this.selectedFilter === 'all') {
      return this.allTimeTotalDistance;
    } else {
      return this.filteredRides.reduce((sum, ride) => sum + ride.distance, 0);
    }
  }

  getTotalFare(): number {
    if (this.selectedFilter === 'all') {
      return this.allTimeTotalSpent;
    } else {
      return this.filteredRides.reduce((sum, ride) => sum + ride.fare, 0);
    }
  }

  getTotalDuration(): number {
    if (this.selectedFilter === 'all') {
      return this.allTimeTotalDuration;
    } else {
      return this.filteredRides.reduce((sum, ride) => sum + ride.duration, 0);
    }
  }
}
