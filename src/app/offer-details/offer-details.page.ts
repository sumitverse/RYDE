import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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
  IonCardHeader,
  IonCardTitle,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  flashOutline,
  checkmarkCircleOutline,
  ticketOutline,
  giftOutline,
  calendarOutline,
  timeOutline,
  informationCircleOutline,
  closeOutline
} from 'ionicons/icons';

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discount?: string;
  discountPercent?: number;
  discountAmount?: number;
  code?: string;
  validUntil?: string;
  terms?: string;
}

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.page.html',
  styleUrls: ['./offer-details.page.scss'],
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
    IonCardHeader,
    IonCardTitle
  ]
})
export class OfferDetailsPage implements OnInit, ViewWillEnter {
  offer: Offer | null = null;
  isApplied: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBackOutline,
      flashOutline,
      checkmarkCircleOutline,
      ticketOutline,
      giftOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.loadOffer();
  }

  ionViewWillEnter() {
    this.loadOffer();
  }

  loadOffer() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['offer']) {
      this.offer = navigation.extras.state['offer'];
      this.processOffer();
    } else {
      const state = (this.router.getCurrentNavigation()?.extras?.state || 
                    (window.history.state && window.history.state.offer)) as any;
      if (state?.offer) {
        this.offer = state.offer;
        this.processOffer();
      } else {
        const offerId = this.route.snapshot.paramMap.get('id');
        if (offerId) {
          this.loadOfferFromStorage(offerId);
        }
      }
    }

    this.checkAppliedCoupon();
  }

  loadOfferFromStorage(offerId: string) {
    const savedOffers = localStorage.getItem('offers');
    if (savedOffers) {
      try {
        const offers: Offer[] = JSON.parse(savedOffers);
        const foundOffer = offers.find(o => o.id === offerId);
        if (foundOffer) {
          this.offer = foundOffer;
          this.processOffer();
          return;
        }
      } catch (e) {
        console.error('Error parsing saved offers:', e);
      }
    }
  }

  processOffer() {
    if (!this.offer) return;

    if (this.offer.discount && !this.offer.discountPercent) {
      const match = this.offer.discount.match(/(\d+)%/);
      if (match) {
        this.offer.discountPercent = parseInt(match[1], 10);
      } else {
        const titleMatch = this.offer.title.match(/(\d+)%/);
        const descMatch = this.offer.description.match(/(\d+)%/);
        if (titleMatch) {
          this.offer.discountPercent = parseInt(titleMatch[1], 10);
        } else if (descMatch) {
          this.offer.discountPercent = parseInt(descMatch[1], 10);
        }
      }
    }

    if (!this.offer.discountPercent) {
      if (this.offer.discount && this.offer.discount.includes('100%')) {
        this.offer.discountPercent = 100;
      } else if (this.offer.discount && this.offer.discount.includes('FREE')) {
        this.offer.discountPercent = 100;
      } else {
        this.offer.discountPercent = 20;
      }
    }

    if (!this.offer.code) {
      this.offer.code = this.generateCouponCode(this.offer.title);
    }

    if (!this.offer.validUntil) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      this.offer.validUntil = date.toISOString().split('T')[0];
    }

    if (!this.offer.terms) {
      this.offer.terms = 'This offer is valid for all cycle rentals. Discount will be applied at the end of your ride.';
    }
  }

  generateCouponCode(title: string): string {
    const words = title.split(' ');
    const code = words.map(w => w.charAt(0).toUpperCase()).join('') + Math.floor(Math.random() * 1000);
    return code;
  }

  checkAppliedCoupon() {
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (appliedCoupon && this.offer) {
      try {
        const coupon = JSON.parse(appliedCoupon);
        if (coupon.id === this.offer.id) {
          this.isApplied = true;
        }
      } catch (e) {
        console.error('Error parsing applied coupon:', e);
      }
    }
  }

  async applyCoupon() {
    if (!this.offer) return;

    if (this.isApplied) {
      await this.showToast('Coupon already applied!', 'success');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Apply Coupon?',
      message: `Apply "${this.offer.title}" coupon with ${this.offer.discount || this.offer.discountPercent + '%'} discount?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: () => {
            this.confirmApplyCoupon();
          }
        }
      ]
    });

    await alert.present();
  }

  confirmApplyCoupon() {
    if (!this.offer) return;

    const couponData = {
      id: this.offer.id,
      title: this.offer.title,
      discount: this.offer.discount,
      discountPercent: this.offer.discountPercent || 0,
      code: this.offer.code,
      appliedAt: new Date().toISOString(),
      validUntil: this.offer.validUntil
    };

    localStorage.setItem('appliedCoupon', JSON.stringify(couponData));
    this.isApplied = true;

    this.showToast('Coupon applied successfully! 🎉', 'success');
  }

  async removeCoupon() {
    if (!this.isApplied) return;

    const alert = await this.alertController.create({
      header: 'Remove Coupon?',
      message: 'Are you sure you want to remove this coupon?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            localStorage.removeItem('appliedCoupon');
            this.isApplied = false;
            this.showToast('Coupon removed', 'warning');
          }
        }
      ]
    });

    await alert.present();
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
