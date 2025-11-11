import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonProgressBar,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  bicycleOutline,
  locationOutline,
  flashOutline,
  timeOutline,
  walletOutline,
  arrowBackOutline,
  starOutline,
  star
} from 'ionicons/icons';

interface Cycle {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  battery?: number;
  distance?: number;
  condition?: string;
  location?: string;
}

@Component({
  selector: 'app-booked',
  templateUrl: './booked.page.html',
  styleUrls: ['./booked.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonProgressBar,
    IonBadge
  ]
})
export class BookedPage implements OnInit, AfterViewInit {
  // Cycle and confetti data
  cycle: Cycle | null = null;
  showConfetti: boolean = false;
  confettiItems: Array<{ delay: number; left: number; color: string }> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    const colors = ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0'];
    for (let i = 0; i < 40; i++) {
      this.confettiItems.push({
        delay: Math.random() * 2,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    addIcons({
      checkmarkCircleOutline,
      bicycleOutline,
      locationOutline,
      flashOutline,
      timeOutline,
      walletOutline,
      arrowBackOutline,
      starOutline,
      star
    });
  }

  ngOnInit() {
    // Try to load cycle from navigation state first
    const navigation = this.router.getCurrentNavigation();
    let cycleData = null;

    if (navigation?.extras?.state?.['cycle']) {
      cycleData = navigation.extras.state['cycle'];
    } else if ((window.history.state && window.history.state.cycle)) {
      cycleData = window.history.state.cycle;
    }

    if (cycleData) {
      this.cycle = cycleData;
    } else {
      // Fallback to localStorage
      const savedCycle = localStorage.getItem('bookedCycle');
      if (savedCycle) {
        try {
          this.cycle = JSON.parse(savedCycle);
        } catch (e) {
          console.error('Error parsing cycle data:', e);
          this.loadCycleFromActiveRide();
        }
      } else {
        this.loadCycleFromActiveRide();
      }
    }
  }

  loadCycleFromActiveRide() {
    // Load cycle from active ride as last resort
    const activeRide = localStorage.getItem('activeRide');
    if (activeRide) {
      try {
        const rideData = JSON.parse(activeRide);
        if (rideData.cycle) {
          this.cycle = rideData.cycle;
        }
      } catch (e) {
        console.error('Error loading cycle from active ride:', e);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showConfetti = true;
    }, 600);
  }

  loadCycleFromStorage(cycleId: number) {
    const savedCycles = localStorage.getItem('cycles');
    if (savedCycles) {
      try {
        const cycles: Cycle[] = JSON.parse(savedCycles);
        this.cycle = cycles.find(c => c.id === cycleId) || null;
      } catch (e) {
        console.error('Error loading cycle from storage:', e);
      }
    }
  }

  goToTab1() {
    this.router.navigate(['/tabs/tab1']);
  }

  getBatteryColor(battery: number | undefined): string {
    if (!battery) return 'medium';
    if (battery >= 80) return 'success';
    if (battery >= 50) return 'warning';
    return 'danger';
  }

}
