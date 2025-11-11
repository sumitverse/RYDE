import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonProgressBar,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  bicycleOutline,
  locationOutline,
  flashOutline,
  checkmarkCircleOutline,
  constructOutline,
  warningOutline,
  starOutline,
  star,
  navigateOutline
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

interface ActiveRide {
  cycle: Cycle;
  startTime: Date;
  duration: number;
  fare: number;
  originalFare?: number;
  discount?: number;
  discountPercent?: number;
  couponId?: string;
  couponTitle?: string;
}

@Component({
  selector: 'app-cycle-details',
  templateUrl: './cycle-details.page.html',
  styleUrls: ['./cycle-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonProgressBar
  ]
})
export class CycleDetailsPage implements OnInit {
  // Cycle and ride data
  cycle: Cycle | null = null;
  activeRide: ActiveRide | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBackOutline,
      bicycleOutline,
      locationOutline,
      flashOutline,
      checkmarkCircleOutline,
      constructOutline,
      warningOutline,
      starOutline,
      star,
      navigateOutline
    });
  }

  ngOnInit() {
    const cycleId = this.route.snapshot.paramMap.get('id');
    if (cycleId) {
      this.loadCycleDetails(parseInt(cycleId, 10));
    }
    this.loadActiveRide();
  }

  loadCycleDetails(cycleId: number) {
    // Try to load cycle from localStorage first
    const savedCycles = localStorage.getItem('cycles');
    if (savedCycles) {
      try {
        const cycles: Cycle[] = JSON.parse(savedCycles);
        const foundCycle = cycles.find(c => c.id === cycleId);
        if (foundCycle) {
          this.cycle = foundCycle;
          return;
        }
      } catch (e) {
        console.error('Error parsing saved cycles:', e);
      }
    }

    // Try to get cycle from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['cycle']) {
      this.cycle = navigation.extras.state['cycle'];
      return;
    }

    // Fallback cycle data if not found
    this.cycle = {
      id: cycleId,
      title: 'Cycle ' + cycleId,
      price: Math.floor(Math.random() * 4) + 1,
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      battery: 85,
      distance: 0.5,
      condition: 'Excellent',
      location: 'Main Campus - Building A'
    };
  }

  loadActiveRide() {
    // Load active ride to check if user already has a ride in progress
    const savedRide = localStorage.getItem('activeRide');
    if (savedRide) {
      try {
        const rideData = JSON.parse(savedRide);
        this.activeRide = {
          cycle: rideData.cycle,
          startTime: new Date(rideData.startTime),
          duration: rideData.duration || 0,
          fare: rideData.fare || 0
        };
      } catch (error) {
        console.error('Error loading active ride:', error);
      }
    }
  }

  getConditionColor(condition: string | undefined): string {
    if (!condition) return 'medium';
    const cond = condition.toLowerCase();
    if (cond.includes('excellent') || cond.includes('good')) return 'success';
    if (cond.includes('fair') || cond.includes('average')) return 'warning';
    return 'danger';
  }

  getConditionIcon(condition: string | undefined): string {
    if (!condition) return 'construct-outline';
    const cond = condition.toLowerCase();
    if (cond.includes('excellent') || cond.includes('good')) return 'checkmark-circle-outline';
    if (cond.includes('fair') || cond.includes('average')) return 'warning-outline';
    return 'construct-outline';
  }

  getBatteryColor(battery: number | undefined): string {
    if (!battery) return 'medium';
    if (battery >= 80) return 'success';
    if (battery >= 50) return 'warning';
    return 'danger';
  }

  async bookCycle() {
    if (!this.cycle) return;

    // Check if user already has an active ride
    if (this.activeRide) {
      const toast = await this.toastController.create({
        message: 'You already have an active ride!',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    // Check for applied coupon
    const appliedCoupon = this.getAppliedCoupon();

    const startTime = new Date();
    const activeRide: ActiveRide = {
      cycle: this.cycle,
      startTime,
      duration: 0,
      fare: 0,
      originalFare: 0,
      discount: 0,
      discountPercent: appliedCoupon?.discountPercent || 0,
      couponId: appliedCoupon?.id,
      couponTitle: appliedCoupon?.title
    };

    // Calculate initial fare (will be updated in real-time on tab1)
    const diffMs = new Date().getTime() - startTime.getTime();
    const durationInSeconds = Math.floor(diffMs / 1000);
    const durationInMinutes = durationInSeconds / 60;
    const originalFare = Math.round(durationInMinutes * this.cycle.price * 100) / 100;

    // Apply coupon discount if available
    let fare = originalFare;
    let discount = 0;
    if (appliedCoupon?.discountPercent && appliedCoupon.discountPercent > 0) {
      discount = Math.round((originalFare * appliedCoupon.discountPercent / 100) * 100) / 100;
      fare = Math.round((originalFare - discount) * 100) / 100;
    }

    activeRide.fare = fare;
    activeRide.originalFare = originalFare;
    activeRide.discount = discount;
    activeRide.duration = Math.floor(durationInSeconds / 60);

    // Save active ride to localStorage
    const rideToSave = {
      cycle: activeRide.cycle,
      startTime: startTime.toISOString(),
      duration: activeRide.duration,
      fare: activeRide.fare,
      originalFare: activeRide.originalFare || 0,
      discount: activeRide.discount || 0,
      discountPercent: activeRide.discountPercent || 0,
      couponId: activeRide.couponId,
      couponTitle: activeRide.couponTitle
    };
    localStorage.setItem('activeRide', JSON.stringify(rideToSave));
    localStorage.setItem('bookedCycle', JSON.stringify(this.cycle));

    let toastMessage = 'Ride started! Enjoy your journey 🚴';
    if (appliedCoupon) {
      toastMessage = `Ride started! ${appliedCoupon.discountPercent}% discount applied 🎉`;
      localStorage.removeItem('appliedCoupon');
    }

    const toast = await this.toastController.create({
      message: toastMessage,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    // Navigate to tab1 to show active ride
    setTimeout(() => {
      this.router.navigate(['/tabs/tab1']).then(() => {
        console.log('Navigated to tab1 with active ride');
      });
    }, 1000);
  }

  getAppliedCoupon(): any {
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (appliedCoupon) {
      try {
        return JSON.parse(appliedCoupon);
      } catch (e) {
        console.error('Error parsing applied coupon:', e);
        return null;
      }
    }
    return null;
  }
}
