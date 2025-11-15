import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  walletOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-add-money-modal',
  template: `
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()" class="close-button">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <div class="header-content">
          <div class="gateway-logo">
            <div class="logo-icon">Pay</div>
          </div>
          <ion-title>PaySecure</ion-title>
        </div>
        <div slot="end" class="security-badge">
          <ion-icon name="shield-checkmark-outline"></ion-icon>
          <span>256-bit SSL</span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">
      <div class="amount-input-section">
        <div class="section-header">
          <div class="wallet-icon-wrapper">
            <ion-icon name="wallet-outline"></ion-icon>
          </div>
          <h2>Add Money to Wallet</h2>
          <p>Enter the amount you want to add</p>
        </div>

        <div class="input-container">
          <div class="currency-symbol">₹</div>
          <input
            type="number"
            [(ngModel)]="amount"
            placeholder="0.00"
            class="amount-input"
            (input)="onAmountChange($event)"
            min="1"
            max="10000"
            autofocus>
        </div>

        <div class="quick-amounts">
          <button
            *ngFor="let quickAmount of quickAmounts"
            class="quick-amount-btn"
            [class.active]="amount === quickAmount"
            (click)="selectQuickAmount(quickAmount)">
            ₹{{ quickAmount }}
          </button>
        </div>

        <div class="amount-info">
          <div class="info-item">
            <span class="info-label">Minimum:</span>
            <span class="info-value">₹1</span>
          </div>
          <div class="info-item">
            <span class="info-label">Maximum:</span>
            <span class="info-value">₹10,000</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <ion-button
          expand="block"
          class="proceed-button"
          [disabled]="!isValidAmount()"
          (click)="proceedToPayment()">
          <span>Proceed to Payment</span>
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
        <ion-button
          expand="block"
          fill="clear"
          class="cancel-button"
          (click)="dismiss()">
          Cancel
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-header {
      ion-toolbar {
        --background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        --color: white;
        --border-width: 0;
        
        .close-button {
          --color: white;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          
          .gateway-logo {
            .logo-icon {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 0.875rem;
              color: white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
          }
          
          ion-title {
            font-weight: 600;
            font-size: 1.25rem;
            letter-spacing: -0.02em;
          }
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.7rem;
          padding: 0.375rem 0.75rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          margin-right: 0.5rem;
          color: #10b981;
          font-weight: 500;
          
          ion-icon {
            font-size: 0.875rem;
            color: #10b981;
          }
        }
      }
    }

    .modal-content {
      --background: #f8fafc;
      padding: 1.5rem;
      height: 100%;
      width: 100%;
    }

    .amount-input-section {
      background: white;
      border-radius: 16px;
      padding: 2rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
      
      .wallet-icon-wrapper {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        
        ion-icon {
          font-size: 2rem;
          color: white;
        }
      }
      
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.5rem 0;
      }
      
      p {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0;
      }
    }

    .input-container {
      position: relative;
      margin-bottom: 1.5rem;
      
      .currency-symbol {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
        font-weight: 600;
        color: #1e293b;
        z-index: 1;
      }
      
      .amount-input {
        width: 100%;
        padding: 1.25rem 1rem 1.25rem 3.5rem;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        background: #ffffff;
        transition: all 0.3s ease;
        box-sizing: border-box;
        text-align: left;
        
        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        
        &::placeholder {
          color: #cbd5e1;
          font-weight: 400;
        }
      }
    }

    .quick-amounts {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      
      .quick-amount-btn {
        padding: 0.75rem;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        background: white;
        color: #475569;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
          transform: translateY(-1px);
        }
        
        &.active {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
      }
    }

    .amount-info {
      display: flex;
      justify-content: space-between;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      
      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        
        .info-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
        }
      }
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .proceed-button {
        --background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        --background-activated: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        --color: white;
        --border-radius: 12px;
        height: 52px;
        font-weight: 600;
        font-size: 1rem;
        text-transform: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transition: all 0.3s ease;
        letter-spacing: 0.02em;
        margin: 0;
        
        &:hover:not([disabled]) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        
        &[disabled] {
          opacity: 0.5;
        }
      }
      
      .cancel-button {
        --color: #64748b;
        height: 48px;
        font-weight: 500;
        text-transform: none;
        margin: 0;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel
  ]
})
export class AddMoneyModalComponent {
  amount: number | null = null;
  quickAmounts = [100, 500, 1000, 5000];

  constructor(private modalController: ModalController) {
    addIcons({
      closeOutline,
      walletOutline,
      arrowForwardOutline,
      shieldCheckmarkOutline
    });
  }

  onAmountChange(event: any) {
    const value = event.target.value;
    if (value) {
      this.amount = parseFloat(value);
    } else {
      this.amount = null;
    }
  }

  selectQuickAmount(amount: number) {
    this.amount = amount;
  }

  isValidAmount(): boolean {
    return this.amount !== null && this.amount > 0 && this.amount <= 10000;
  }

  proceedToPayment() {
    if (this.isValidAmount() && this.amount !== null) {
      // Ensure amount is properly passed
      this.modalController.dismiss({ 
        amount: this.amount,
        confirmed: true 
      });
    }
  }

  dismiss() {
    this.modalController.dismiss({ confirmed: false });
  }
}

