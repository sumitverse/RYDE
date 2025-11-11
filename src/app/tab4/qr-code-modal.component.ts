import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-qr-code-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>UPI QR Code</ion-title>
        <ion-button slot="end" fill="clear" (click)="dismiss()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content class="qr-modal-content">
      <div class="qr-container">
        <img
          [src]="qrImageUrl"
          alt="QR Code"
          class="qr-image"
          [class.hidden]="imageError"
          (load)="onImageLoad()"
          (error)="onImageError($event)" />
        <div *ngIf="!imageLoaded && !imageError" class="loading-overlay">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading QR code...</p>
        </div>
        <div *ngIf="imageError" class="error-overlay">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>Failed to load QR code image</p>
          <p class="error-detail">Please check your internet connection</p>
          <ion-button fill="outline" size="small" (click)="retryLoad()" class="retry-btn">
            Retry
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .qr-modal-content {
      --background: #ffffff;
    }

    .qr-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      min-height: 100%;
      position: relative;
    }

    .qr-image {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: block;
      opacity: 1;
      transition: opacity 0.3s ease;

      &.hidden {
        opacity: 0;
        position: absolute;
        visibility: hidden;
      }
    }

    .loading-overlay,
    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
    }

    .loading-overlay {
      color: #6B7280;

      ion-spinner {
        --color: #10B981;
      }
    }

    .error-overlay {
      color: #EF4444;
      text-align: center;

      ion-icon {
        font-size: 3rem;
      }

      .error-detail {
        font-size: 0.875rem;
        color: #6B7280;
        margin-top: 0.5rem;
      }

      .retry-btn {
        margin-top: 1rem;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class QrCodeModalComponent implements OnInit {
  imageLoaded: boolean = false;
  imageError: boolean = false;
  qrImageUrl: string = '';

  constructor(private modalController: ModalController) {
    addIcons({ closeOutline, alertCircleOutline });
    this.qrImageUrl = 'assets/WhatsApp Image 2025-11-09 at 00.18.45_1ac31441.jpg';
  }

  ngOnInit() {
    this.loadImage();
  }

  loadImage() {
    const img = new Image();
    img.onload = () => {
      this.imageLoaded = true;
      this.imageError = false;
      console.log('QR code image loaded successfully from:', this.qrImageUrl);
    };
    img.onerror = () => {
      if (this.qrImageUrl.includes('assets/')) {
        console.warn('Local assets failed, trying GitHub URL...');
        this.qrImageUrl = 'https:
        const githubImg = new Image();
        githubImg.onload = () => {
          this.imageLoaded = true;
          this.imageError = false;
          console.log('QR code image loaded from GitHub');
        };
        githubImg.onerror = () => {
          this.imageError = true;
          this.imageLoaded = false;
          console.error('Both local and GitHub image failed to load');
        };
        githubImg.src = this.qrImageUrl;
      } else {
        this.imageError = true;
        this.imageLoaded = false;
        console.error('Failed to load QR code image from:', this.qrImageUrl);
      }
    };
    img.src = this.qrImageUrl;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  onImageError(event: any) {
    this.imageError = true;
    this.imageLoaded = false;
    console.error('Failed to load QR code image:', event);
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
  }

  retryLoad() {
    this.imageError = false;
    this.imageLoaded = false;
    this.qrImageUrl = 'assets/WhatsApp Image 2025-11-09 at 00.18.45_1ac31441.jpg';
    this.loadImage();
  }
}
