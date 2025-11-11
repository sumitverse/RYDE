import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonBadge,
  IonChip,
  IonLabel,
  IonItem,
  IonList,
  IonAvatar,
  IonSpinner,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  wallet,
  addOutline,
  checkmarkCircleOutline,
  timeOutline,
  flashOutline,
  bicycleOutline,
  qrCodeOutline,
  refreshOutline,
  trendingUpOutline,
  trendingDownOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  icon: string;
}

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
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
    IonBadge,
    IonChip,
    IonLabel,
    IonItem,
    IonList,
    IonAvatar,
    IonSpinner
  ]
})
export class Tab4Page implements OnInit, ViewWillEnter {
  // Wallet data
  walletBalance: number = 0;
  upiId: string = '';
  showBalance: boolean = true;
  isLoading: boolean = true;
  transactions: Transaction[] = [];
  qrImageError: boolean = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      walletOutline,
      wallet,
      addOutline,
      checkmarkCircleOutline,
      timeOutline,
      flashOutline,
      bicycleOutline,
      qrCodeOutline,
      refreshOutline,
      trendingUpOutline,
      trendingDownOutline,
      eyeOutline,
      eyeOffOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    this.loadWalletData();
  }

  ionViewWillEnter() {
    this.loadWalletData();
  }

  loadWalletData() {
    // Load UPI ID from storage or generate from user data
    const savedUpiId = localStorage.getItem('upiId');
    const savedTransactions = localStorage.getItem('walletTransactions');

    if (savedUpiId) {
      this.upiId = savedUpiId;
    } else {
      // Generate UPI ID from user data
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const name = user.name || 'user';
          const email = user.email || 'user@ryde.com';
          this.upiId = `${name.toLowerCase().replace(/\s+/g, '')}@ryde`;
        } catch (e) {
          this.upiId = 'user@ryde';
        }
      } else {
        this.upiId = 'user@ryde';
      }
      localStorage.setItem('upiId', this.upiId);
    }

    // Load transactions from storage
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        this.transactions = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      } catch (e) {
        this.transactions = this.getDefaultTransactions();
        localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
      }
    } else {
      this.transactions = this.getDefaultTransactions();
      localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
    }

    this.calculateWalletBalance();

    this.isLoading = false;
  }

  calculateWalletBalance() {
    // Calculate wallet balance from initial balance and transactions
    const savedInitialBalance = localStorage.getItem('initialWalletBalance');
    let balance = savedInitialBalance ? parseFloat(savedInitialBalance) : 250.50;

    if (!savedInitialBalance) {
      localStorage.setItem('initialWalletBalance', balance.toString());
    }

    // Process all completed transactions
    this.transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        if (transaction.type === 'credit') {
          balance += transaction.amount;
        } else if (transaction.type === 'debit') {
          balance -= transaction.amount;
        }
      }
    });

    // Ensure balance doesn't go negative
    this.walletBalance = Math.max(0, balance);
  }

  getDefaultTransactions(): Transaction[] {
    return [
      {
        id: '1',
        type: 'debit',
        amount: 12.50,
        description: 'Cycle Rental - Hercules Storm',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        icon: 'bicycle-outline'
      },
      {
        id: '2',
        type: 'credit',
        amount: 500.00,
        description: 'Added via UPI',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: 'add-outline'
      },
      {
        id: '3',
        type: 'debit',
        amount: 8.00,
        description: 'Cycle Rental - Atlas L',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: 'bicycle-outline'
      },
      {
        id: '4',
        type: 'debit',
        amount: 15.75,
        description: 'Cycle Rental - Hero Sprint',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: 'bicycle-outline'
      },
      {
        id: '5',
        type: 'credit',
        amount: 200.00,
        description: 'Added via UPI',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: 'add-outline'
      }
    ];
  }

  toggleBalanceVisibility() {
    this.showBalance = !this.showBalance;
  }

  async copyUpiId() {
    try {
      await navigator.clipboard.writeText(this.upiId);
      const toast = await this.toastController.create({
        message: 'UPI ID copied to clipboard!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to copy UPI ID',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async shareUpiId() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My UPI ID',
          text: `My RYDE UPI ID: ${this.upiId}`,
        });
      } catch (error) {
      }
    } else {
      await this.copyUpiId();
    }
  }

  async addMoney() {
    const alert = await this.alertController.create({
      header: 'Add Money',
      message: 'Enter amount to add to wallet',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount (₹)',
          min: 1,
          max: 10000
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            const amount = parseFloat(data.amount);
            if (amount && amount > 0 && amount <= 10000) {
              const transaction: Transaction = {
                id: Date.now().toString(),
                type: 'credit',
                amount: amount,
                description: 'Added via UPI',
                date: new Date(),
                status: 'completed',
                icon: 'add-outline'
              };
              this.transactions.unshift(transaction);
              localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));

              this.calculateWalletBalance();

              this.showToast(`₹${amount} added successfully!`, 'success');
            } else {
              this.showToast('Please enter a valid amount', 'warning');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editUpiId() {
    const alert = await this.alertController.create({
      header: 'Edit UPI ID',
      message: 'Enter your UPI ID',
      inputs: [
        {
          name: 'upiId',
          type: 'text',
          placeholder: 'yourname@paytm',
          value: this.upiId
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.upiId && data.upiId.includes('@')) {
              this.upiId = data.upiId;
              localStorage.setItem('upiId', this.upiId);
              this.showToast('UPI ID updated successfully!', 'success');
            } else {
              this.showToast('Please enter a valid UPI ID', 'warning');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onQrImageError(event: any) {
    this.qrImageError = true;
    console.error('Failed to load QR code image:', event);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getTransactionIcon(transaction: Transaction): string {
    return transaction.icon;
  }

  getTransactionColor(transaction: Transaction): string {
    if (transaction.type === 'credit') {
      return 'success';
    }
    return 'medium';
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

  async refreshWallet() {
    this.isLoading = true;
    setTimeout(() => {
      this.loadWalletData();
      this.showToast('Wallet refreshed!', 'success');
    }, 1000);
  }

  getTotalCredits(): number {
    return this.transactions
      .filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalDebits(): number {
    return this.transactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getRecentTransactions(): Transaction[] {
    return this.transactions.filter(t => {
      if (t.type === 'debit' && t.status === 'completed') {
        return false;
      }
      return true;
    });
  }
}
