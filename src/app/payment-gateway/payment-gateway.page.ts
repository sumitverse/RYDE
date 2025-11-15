import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  ToastController,
  LoadingController,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cardOutline,
  walletOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  phonePortraitOutline,
  businessOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline,
  checkmarkCircle,
  closeCircle,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.page.html',
  styleUrls: ['./payment-gateway.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner
  ]
})
export class PaymentGatewayPage implements OnInit, OnDestroy {
  // Payment gateway component
  amount: number = 0;
  orderId: string = '';
  isLoading: boolean = false;
  isInitializing: boolean = true;
  isProcessing: boolean = false;
  paymentStatus: 'pending' | 'success' | 'failed' | null = null;

  // Payment method selection
  selectedPaymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | null = null;
  showPaymentForm: boolean = false;

  // Card payment form
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  cardType: 'visa' | 'mastercard' | 'amex' | 'other' | null = null;

  // UPI
  upiId: string = '';
  isValidUpi: boolean = false;

  // Selected bank/wallet
  selectedBank: string = '';

  // Payment methods data
  paymentMethods: { [key: string]: { name: string; icon: string; color: string; description: string } } = {
    card: { name: 'Credit/Debit Card', icon: 'card-outline', color: '#6366f1', description: 'Visa, Mastercard, RuPay' },
    upi: { name: 'UPI', icon: 'phone-portrait-outline', color: '#10b981', description: 'Paytm, PhonePe, Google Pay' },
    netbanking: { name: 'Net Banking', icon: 'business-outline', color: '#f59e0b', description: 'All major banks' },
    wallet: { name: 'Wallets', icon: 'wallet-outline', color: '#8b5cf6', description: 'Paytm, PhonePe & more' }
  };

  paymentMethodKeys: ('card' | 'upi' | 'netbanking' | 'wallet')[] = ['card', 'upi', 'netbanking', 'wallet'];

  banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'];
  wallets = ['Paytm', 'PhonePe', 'Google Pay', 'FamPay', 'Mobikwik'];

  // Wallet logos mapping
  walletLogos: { [key: string]: string } = {
    'Paytm': 'https://tse3.mm.bing.net/th/id/OIP.ugqUs6-BnsAlp5xrPQr0OAHaHa?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'PhonePe': 'https://seeklogo.com/images/P/phonepe-logo-B9E7D6F75F-seeklogo.com.png',
    'Google Pay': 'https://static.vecteezy.com/system/resources/previews/021/672/629/original/google-pay-logo-transparent-free-png.png',
    'FamPay': 'https://logosandtypes.com/wp-content/uploads/2024/05/FamPay.png',
    'Mobikwik': 'https://th.bing.com/th/id/R.74d5a87ba8aa1dd5baa6d73961a55788?rik=uFRYYCY9MxwaNw&riu=http%3a%2f%2fmoney.mobikwik.com%2fimages%2flogo.png&ehk=bfflX7Obbe154LpBUQmwoO4LA6l6wEWsv97nx2ycXTo%3d&risl=&pid=ImgRaw&r=0'
  };

  // Fallback wallet logo if image fails to load
  getWalletLogo(wallet: string): string {
    return this.walletLogos[wallet] || 'https://via.placeholder.com/60';
  }

  // Card type detection
  cardTypes = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private navController: NavController,
    private walletService: WalletService
  ) {
    addIcons({
      arrowBackOutline,
      cardOutline,
      walletOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      phonePortraitOutline,
      businessOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      chevronForwardOutline,
      checkmarkCircle,
      closeCircle,
      informationCircleOutline
    });
  }

  ngOnInit() {
    // Reset state first
    this.resetPaymentState();
    
    // Get amount from route query params
    this.route.queryParams.subscribe(params => {
      this.amount = parseFloat(params['amount']) || 0;
      if (this.amount <= 0) {
        this.showToast('Invalid amount', 'danger');
        this.goBack();
        return;
      }
      this.orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Initialize payment gateway with loading animation
      this.initializePaymentGateway();
    });
  }

  async initializePaymentGateway() {
    // Show initialization loading for 1.5 seconds
    this.isInitializing = true;

    // Simulate payment gateway initialization
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Hide loading and show payment form
    this.isInitializing = false;
    this.showPaymentForm = true;
  }

  ionViewWillEnter() {
    // Reset all states when entering the page
    this.resetPaymentState();
    
    // Get amount from route query params (in case user navigates back with new amount)
    const params = this.route.snapshot.queryParams;
    const amount = parseFloat(params['amount']) || 0;
    
    if (amount > 0) {
      this.amount = amount;
      this.orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.initializePaymentGateway();
    } else if (this.amount <= 0) {
      // If no valid amount, go back
      this.goBack();
    } else {
      // Re-initialize with existing amount
      this.orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.initializePaymentGateway();
    }
  }

  ngOnDestroy() {
    // Clear all payment states when leaving
    this.resetPaymentState();
  }

  resetPaymentState() {
    // Reset all payment-related states
    this.paymentStatus = null;
    this.isProcessing = false;
    this.isInitializing = false; // Will be set to true when initializing
    this.selectedPaymentMethod = null;
    this.showPaymentForm = false;
    
    // Reset form fields
    this.cardNumber = '';
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.upiId = '';
    this.isValidUpi = false;
    this.selectedBank = '';
    this.cardType = null;
    this.orderId = '';
  }

  selectPaymentMethod(method: 'card' | 'upi' | 'netbanking' | 'wallet') {
    this.selectedPaymentMethod = method;

    // Reset form fields
    this.cardNumber = '';
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.upiId = '';
    this.isValidUpi = false;
    this.selectedBank = '';
    this.cardType = null;
  }

  validateUpiId(upiId: string) {
    // UPI ID format: username@paymentservice
    // Common UPI handles: @paytm, @ybl, @ibl, @axl, @okaxis, @okhdfcbank, @okicici, @oksbi, @phonepe, @gpay, @fampay
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    this.isValidUpi = upiPattern.test(upiId.trim());
    return this.isValidUpi;
  }

  onUpiIdChange(event: any) {
    const value = event.target.value;
    this.upiId = value;
    this.validateUpiId(value);
  }

  goBackToMethods() {
    this.selectedPaymentMethod = null;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardNumber = formattedValue;

    // Detect card type
    this.detectCardType(value);
  }

  detectCardType(cardNumber: string) {
    if (this.cardTypes.visa.test(cardNumber)) {
      this.cardType = 'visa';
    } else if (this.cardTypes.mastercard.test(cardNumber)) {
      this.cardType = 'mastercard';
    } else if (this.cardTypes.amex.test(cardNumber)) {
      this.cardType = 'amex';
    } else if (cardNumber.length > 0) {
      this.cardType = 'other';
    } else {
      this.cardType = null;
    }
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardExpiry = value;
  }

  formatCvv(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    this.cardCvv = value.substring(0, 3);
  }

  async processPayment() {
    if (!this.selectedPaymentMethod) {
      await this.showToast('Please select a payment method', 'warning');
      return;
    }

    // Validate based on selected method
    if (this.selectedPaymentMethod === 'card') {
      const cardNum = this.cardNumber.replace(/\s/g, '');
      if (!cardNum || cardNum.length < 16) {
        await this.showToast('Please enter a valid card number', 'warning');
        return;
      }
      if (!this.cardName || this.cardName.length < 3) {
        await this.showToast('Please enter cardholder name', 'warning');
        return;
      }
      if (!this.cardExpiry || this.cardExpiry.length < 5) {
        await this.showToast('Please enter expiry date', 'warning');
        return;
      }
      if (!this.cardCvv || this.cardCvv.length < 3) {
        await this.showToast('Please enter CVV', 'warning');
        return;
      }
    } else if (this.selectedPaymentMethod === 'upi') {
      if (!this.upiId || !this.isValidUpi) {
        await this.showToast('Please enter a valid UPI ID', 'warning');
        return;
      }
    } else if (this.selectedPaymentMethod === 'netbanking' || this.selectedPaymentMethod === 'wallet') {
      if (!this.selectedBank) {
        await this.showToast('Please select a bank/wallet', 'warning');
        return;
      }
    }

    // Show processing state
    this.isProcessing = true;

    // Simulate payment processing
    setTimeout(() => {
      this.handlePaymentSuccess();
    }, 2000);
  }

  async handlePaymentSuccess() {
    this.paymentStatus = 'success';
    this.isProcessing = false;

    // Add transaction to wallet
    const transaction = {
      id: this.orderId,
      type: 'credit',
      amount: this.amount,
      description: 'Added via Payment Gateway',
      date: new Date(),
      status: 'completed',
      icon: 'add-outline'
    };

    // Load existing transactions
    const savedTransactions = localStorage.getItem('walletTransactions');
    let transactions = [];
    if (savedTransactions) {
      try {
        transactions = JSON.parse(savedTransactions);
      } catch (e) {
        console.error('Error parsing transactions:', e);
        transactions = [];
      }
    }

    // Add new transaction at the beginning
    transactions.unshift(transaction);
    localStorage.setItem('walletTransactions', JSON.stringify(transactions));

    // Update wallet balance directly in localStorage for immediate consistency
    const currentBalance = this.walletService.getWalletBalanceValue();
    const newBalance = Math.round((currentBalance + this.amount) * 100) / 100;
    localStorage.setItem('currentWalletBalance', newBalance.toString());

    // Update wallet service - this will notify all subscribers (Tab1, Tab4, etc.)
    this.walletService.addAmount(this.amount);
    
    // Also refresh balance to ensure consistency
    this.walletService.refreshBalance();

    // Reset payment state before navigating
    this.resetPaymentState();

    // Show success toast and redirect immediately to wallet
    await this.showToast(`₹${this.amount.toFixed(2)} added successfully!`, 'success');
    
    // Small delay to ensure toast is visible
    setTimeout(() => {
      this.router.navigate(['/tabs/tab4'], { replaceUrl: true });
    }, 500);
  }

  async handlePaymentFailure(error: string) {
    this.paymentStatus = 'failed';
    this.isProcessing = false;
    await this.showToast(`Payment failed: ${error}`, 'danger');
  }

  goBack() {
    // Reset payment state before navigating
    this.resetPaymentState();
    // Navigate back to wallet (tab4) and replace current route in history
    this.router.navigate(['/tabs/tab4'], { replaceUrl: true });
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
}

