import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { EmailService } from '../services/email.service';
import { Subscription } from 'rxjs';
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
  AlertController,
  ModalController
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
import { AddMoneyModalComponent } from './add-money-modal.component';

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
export class Tab4Page implements OnInit, ViewWillEnter, OnDestroy {
  // Wallet data
  walletBalance: number = 0;
  upiId: string = '';
  showBalance: boolean = true;
  isLoading: boolean = true;
  transactions: Transaction[] = [];
  qrImageError: boolean = false;
  private walletBalanceSubscription?: Subscription;
  private balanceCheckInterval?: any;
  private lastEmailSentBalance: number = -1; // Track last balance when email was sent

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private modalController: ModalController,
    private walletService: WalletService,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
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
    // Subscribe FIRST to get reactive updates
    this.subscribeToWalletBalance();
    // Then load wallet data (transactions, UPI, etc.)
    this.loadWalletData();
    
    // Listen for storage changes (when Tab1 updates balance)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Also check for balance updates periodically (fallback)
    this.balanceCheckInterval = setInterval(() => {
      this.checkWalletBalanceUpdate();
    }, 500);
  }

  ionViewWillEnter() {
    // Reload wallet data every time the tab is entered
    // This ensures transactions list is updated after ending a ride
    this.loadWalletData();
    // Refresh wallet service to get latest balance - this will trigger subscription update
    this.walletService.refreshBalance();
    // Also check for direct balance update
    this.checkWalletBalanceUpdate();
    // Check and send email if balance is 0 when entering the page
    const currentBalance = this.walletService.getWalletBalanceValue();
    this.checkAndSendWalletEmptyEmail(currentBalance);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.walletBalanceSubscription) {
      this.walletBalanceSubscription.unsubscribe();
    }
    // Clear interval
    if (this.balanceCheckInterval) {
      clearInterval(this.balanceCheckInterval);
    }
    // Remove storage event listener
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  /**
   * Handle storage changes (when balance is updated in Tab1)
   */
  handleStorageChange(event: StorageEvent): void {
    if (event.key === 'currentWalletBalance') {
      const newBalance = event.newValue ? parseFloat(event.newValue) : 0;
      if (!isNaN(newBalance)) {
        this.walletBalance = newBalance;
        this.walletService.setBalanceDirectly(newBalance);
        this.cdr.detectChanges();
        console.log('Tab4: Balance updated from storage event:', newBalance);
      }
    }
  }

  /**
   * Check for wallet balance updates (for same-tab updates)
   */
  checkWalletBalanceUpdate(): void {
    const savedBalance = localStorage.getItem('currentWalletBalance');
    if (savedBalance) {
      const balance = parseFloat(savedBalance);
      if (!isNaN(balance) && balance !== this.walletBalance) {
        this.walletBalance = balance;
        this.walletService.setBalanceDirectly(balance);
        this.cdr.detectChanges();
        console.log('Tab4: Balance updated from check:', balance);
      }
    }
  }

  /**
   * Subscribe to wallet balance updates from WalletService
   * This ensures the balance updates instantly when a ride is completed in Tab1
   */
  subscribeToWalletBalance() {
    // Unsubscribe existing subscription if any
    if (this.walletBalanceSubscription) {
      this.walletBalanceSubscription.unsubscribe();
    }
    
    this.walletBalanceSubscription = this.walletService.getWalletBalance().subscribe(
      (balance: number) => {
        this.walletBalance = balance;
        console.log('Tab4: Wallet balance updated to ₹' + balance.toFixed(2));
        // Check if balance is 0 and send email if needed
        this.checkAndSendWalletEmptyEmail(balance);
        // Force change detection to update UI immediately
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error subscribing to wallet balance:', error);
      }
    );
    
    // Get initial value immediately
    const initialBalance = this.walletService.getWalletBalanceValue();
    this.walletBalance = initialBalance;
    // Check and send email if balance is 0 on initial load
    this.checkAndSendWalletEmptyEmail(initialBalance);
    this.cdr.detectChanges();
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
        let needsFix = false;
        
        this.transactions = parsed.map((t: any) => {
          // Ensure amount is a number
          const amount = typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount)) || 0;
          
          // Fix cycle rentals that are incorrectly saved as 'credit'
          let transactionType = String(t.type || 'debit').toLowerCase().trim();
          if (t.description?.includes('Cycle Rental')) {
            if (transactionType === 'credit') {
              transactionType = 'debit';
              needsFix = true;
            } else if (!transactionType || transactionType !== 'debit') {
              transactionType = 'debit';
              needsFix = true;
            }
          }
          
          return {
            ...t,
            date: new Date(t.date),
            amount: amount,
            type: transactionType,
            status: t.status || 'completed'
          };
        });
        
        // Save fixed transactions if needed
        if (needsFix) {
          localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
        }
      } catch (e) {
        this.transactions = this.getDefaultTransactions();
        localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
      }
    } else {
      this.transactions = this.getDefaultTransactions();
      localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
    }

    // First try to get balance from direct storage (set by Tab1)
    const directBalance = localStorage.getItem('currentWalletBalance');
    if (directBalance) {
      const balance = parseFloat(directBalance);
      if (!isNaN(balance) && balance >= 0) {
        this.walletBalance = balance;
        this.walletService.setBalanceDirectly(balance);
        console.log('Tab4: Using direct balance from storage:', balance);
      } else {
        // Fallback: calculate from transactions
        this.calculateWalletBalance();
        this.walletService.refreshBalance();
      }
    } else {
      // No direct balance, calculate from transactions
      this.calculateWalletBalance();
      // Save calculated balance to direct storage for future use
      localStorage.setItem('currentWalletBalance', this.walletBalance.toString());
      this.walletService.refreshBalance();
    }

    this.isLoading = false;
    
    // Check and send email if balance is 0 after loading wallet data
    this.checkAndSendWalletEmptyEmail(this.walletBalance);
  }

  calculateWalletBalance() {
    // Calculate wallet balance from initial balance and transactions
    const savedInitialBalance = localStorage.getItem('initialWalletBalance');
    let balance = savedInitialBalance ? parseFloat(savedInitialBalance) : 250.50;

    if (!savedInitialBalance) {
      localStorage.setItem('initialWalletBalance', balance.toString());
    }

    console.log('=== CALCULATING WALLET BALANCE ===');
    console.log('Starting balance:', balance);
    console.log('Total transactions:', this.transactions.length);

    // Process all completed transactions
    this.transactions.forEach((transaction, index) => {
      if (transaction.status === 'completed') {
        // Ensure amount is a number
        let amount = typeof transaction.amount === 'number' 
          ? transaction.amount 
          : parseFloat(String(transaction.amount)) || 0;
        
        const roundedAmount = Math.round(amount * 100) / 100;
        
        if (isNaN(roundedAmount) || !isFinite(roundedAmount) || roundedAmount <= 0) {
          console.warn(`Transaction ${index + 1}: Invalid amount (${transaction.amount}), skipping`);
          return;
        }
        
        // Get transaction type - ensure it's a string and lowercase
        let transactionType = String(transaction.type || 'debit').toLowerCase().trim();
        
        // CRITICAL: Fix cycle rentals that are incorrectly saved as 'credit'
        if (transaction.description?.includes('Cycle Rental')) {
          if (transactionType === 'credit') {
            console.warn(`⚠️ FIXING: Cycle rental transaction ${index + 1} was 'credit', changing to 'debit'`);
            transactionType = 'debit';
            transaction.type = 'debit';
          } else if (!transactionType || transactionType !== 'debit') {
            console.warn(`⚠️ FIXING: Cycle rental transaction ${index + 1} has invalid type "${transaction.type}", changing to 'debit'`);
            transactionType = 'debit';
            transaction.type = 'debit';
          }
        }
        
        // Process transaction based on type
        if (transactionType === 'credit') {
          balance += roundedAmount;
          console.log(`Transaction ${index + 1}: +₹${roundedAmount.toFixed(2)} (credit) = ₹${balance.toFixed(2)}`);
        } else if (transactionType === 'debit') {
          balance -= roundedAmount; // SUBTRACT for debit
          console.log(`Transaction ${index + 1}: -₹${roundedAmount.toFixed(2)} (debit) = ₹${balance.toFixed(2)}`);
        } else {
          console.warn(`Transaction ${index + 1}: Unknown type "${transaction.type}", skipping`);
        }
      } else {
        console.log(`Transaction ${index + 1}: Status is "${transaction.status}", skipping`);
      }
    });

    // Round to 2 decimal places and ensure balance doesn't go negative
    this.walletBalance = Math.max(0, Math.round(balance * 100) / 100);
    
    console.log('Final wallet balance:', this.walletBalance);
    console.log('===============================');
    
    // Save fixed transactions back if any were modified
    const needsSave = this.transactions.some(t => 
      t.description?.includes('Cycle Rental') && t.type !== 'debit'
    );
    if (needsSave) {
      localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
      console.log('✅ Saved fixed transactions');
    }
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
    try {
      const modal = await this.modalController.create({
        component: AddMoneyModalComponent,
        cssClass: 'add-money-modal',
        showBackdrop: true,
        backdropDismiss: true,
        componentProps: {}
      });

      await modal.present();

      // Use onDidDismiss instead of onWillDismiss for more reliable data handling
      const { data } = await modal.onDidDismiss();
      
      // Check if user confirmed the amount
      if (data && data.confirmed && data.amount !== null && data.amount !== undefined) {
        const amount = parseFloat(String(data.amount));
        if (!isNaN(amount) && amount > 0 && amount <= 10000) {
          // Navigate to payment gateway page with amount
          this.router.navigate(['/payment-gateway'], {
            queryParams: { amount: amount.toString() }
          });
        } else {
          await this.showToast('Please enter a valid amount between ₹1 and ₹10,000', 'warning');
        }
      }
      // If user cancelled (data.confirmed === false or no data), do nothing
    } catch (error) {
      console.error('Error opening add money modal:', error);
      await this.showToast('Failed to open add money dialog. Please try again.', 'danger');
    }
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

  /**
   * Check if wallet balance is 0 and send email notification
   * Only sends email once when balance reaches 0 (not on every check)
   */
  async checkAndSendWalletEmptyEmail(balance: number): Promise<void> {
    // Only send email if balance is exactly 0 and we haven't sent email for this 0 balance yet
    if (balance === 0 && this.lastEmailSentBalance !== 0) {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const userEmail = user.email || user.userEmail;
          const userName = user.name || user.userName || 'User';

          if (userEmail) {
            console.log('📧 Wallet balance is 0. Sending email notification to:', userEmail);
            
            // Send email
            const emailSent = await this.emailService.sendWalletEmptyEmail(userEmail, userName);
            
            if (emailSent) {
              this.lastEmailSentBalance = 0;
              console.log('✅ Wallet empty email sent successfully');
              // Show a subtle toast notification
              this.showToast('Email notification sent about empty wallet', 'success');
            } else {
              console.warn('⚠️ Failed to send wallet empty email');
            }
          } else {
            console.warn('⚠️ User email not found, cannot send wallet empty email');
          }
        } else {
          console.warn('⚠️ User data not found, cannot send wallet empty email');
        }
      } catch (error) {
        console.error('❌ Error in checkAndSendWalletEmptyEmail:', error);
      }
    } else if (balance > 0) {
      // Reset the flag when balance is above 0, so email can be sent again if balance goes to 0
      this.lastEmailSentBalance = -1;
    }
  }
}
