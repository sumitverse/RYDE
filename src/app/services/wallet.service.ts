import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletBalanceSubject: BehaviorSubject<number>;
  public walletBalance$: Observable<number>;

  constructor() {
    // Initialize with current balance from localStorage
    const initialBalance = this.calculateBalanceFromTransactions();
    this.walletBalanceSubject = new BehaviorSubject<number>(initialBalance);
    this.walletBalance$ = this.walletBalanceSubject.asObservable();
  }

  /**
   * Get current wallet balance as Observable
   */
  getWalletBalance(): Observable<number> {
    return this.walletBalance$;
  }

  /**
   * Get current wallet balance synchronously
   */
  getWalletBalanceValue(): number {
    return this.walletBalanceSubject.value;
  }

  /**
   * Deduct amount directly from current balance (simpler, more direct)
   * @param amount - Amount to deduct (should be positive number)
   */
  deductAmountDirectly(amount: number): void {
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid amount for deduction:', amount);
      return;
    }

    // Get current balance
    const currentBalance = this.walletBalanceSubject.value;
    
    // Deduct the amount
    const newBalance = Math.max(0, Math.round((currentBalance - amount) * 100) / 100);
    
    // Update the balance subject immediately
    this.walletBalanceSubject.next(newBalance);
    
    console.log(`✅ WalletService: Directly deducted ₹${amount.toFixed(2)} | Balance: ₹${currentBalance.toFixed(2)} → ₹${newBalance.toFixed(2)}`);
    
    // Also refresh from transactions to ensure consistency
    setTimeout(() => {
      this.refreshBalance();
    }, 100);
  }

  /**
   * Deduct amount from wallet balance (legacy method - kept for compatibility)
   * @param amount - Amount to deduct (should be positive number)
   */
  deductAmount(amount: number): void {
    this.deductAmountDirectly(amount);
  }

  /**
   * Add amount to wallet balance
   * @param amount - Amount to add (should be positive number)
   */
  addAmount(amount: number): void {
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount for addition:', amount);
      return;
    }

    // Calculate current balance from all transactions
    const currentBalance = this.calculateBalanceFromTransactions();
    
    // Add the amount
    const newBalance = Math.round((currentBalance + amount) * 100) / 100;
    
    // Update the balance subject
    this.walletBalanceSubject.next(newBalance);
    
    console.log(`WalletService: Added ₹${amount.toFixed(2)}, New balance: ₹${newBalance.toFixed(2)}`);
  }

  /**
   * Set balance directly (simple approach - used by Tab1)
   */
  setBalanceDirectly(balance: number): void {
    if (isNaN(balance) || balance < 0) {
      console.error('❌ Invalid balance:', balance);
      return;
    }
    const roundedBalance = Math.round(balance * 100) / 100;
    this.walletBalanceSubject.next(roundedBalance);
    console.log(`✅ WalletService: Balance set directly to ₹${roundedBalance.toFixed(2)}`);
  }

  /**
   * Refresh balance from transactions (useful when transactions are updated externally)
   */
  refreshBalance(): void {
    // First try to get from direct balance storage
    const directBalance = localStorage.getItem('currentWalletBalance');
    if (directBalance) {
      const balance = parseFloat(directBalance);
      if (!isNaN(balance) && balance >= 0) {
        this.walletBalanceSubject.next(balance);
        console.log(`WalletService: Balance refreshed from direct storage: ₹${balance.toFixed(2)}`);
        return;
      }
    }
    
    // Fallback: calculate from transactions
    const currentBalance = this.calculateBalanceFromTransactions();
    this.walletBalanceSubject.next(currentBalance);
    console.log(`WalletService: Balance refreshed from transactions: ₹${currentBalance.toFixed(2)}`);
  }

  /**
   * Calculate wallet balance from all transactions in localStorage
   */
  private calculateBalanceFromTransactions(): number {
    // Get initial balance
    const savedInitialBalance = localStorage.getItem('initialWalletBalance');
    let balance = savedInitialBalance ? parseFloat(savedInitialBalance) : 250.50;

    if (!savedInitialBalance) {
      localStorage.setItem('initialWalletBalance', balance.toString());
    }

    console.log('💰 WalletService: Starting balance calculation. Initial balance:', balance);

    // Load transactions
    const savedTransactions = localStorage.getItem('walletTransactions');
    if (!savedTransactions) {
      console.log('💰 WalletService: No transactions found. Returning initial balance:', balance);
      return balance;
    }

    try {
      const transactions = JSON.parse(savedTransactions);
      console.log('💰 WalletService: Found', transactions.length, 'transactions');
      
      // Process all completed transactions
      transactions.forEach((transaction: any, index: number) => {
        if (transaction.status === 'completed') {
          const amount = typeof transaction.amount === 'number' 
            ? transaction.amount 
            : parseFloat(String(transaction.amount)) || 0;
          
          const roundedAmount = Math.round(amount * 100) / 100;
          
          if (isNaN(roundedAmount) || !isFinite(roundedAmount) || roundedAmount <= 0) {
            console.warn('💰 WalletService: Skipping invalid transaction', index, transaction);
            return;
          }
          
          // Get transaction type - ensure it's a string
          const transactionType = String(transaction.type || 'debit').toLowerCase().trim();
          
          // Fix cycle rentals that are incorrectly saved as 'credit'
          let finalType = transactionType;
          if (transaction.description?.includes('Cycle Rental')) {
            if (transactionType === 'credit') {
              console.warn('💰 WalletService: FIXING - Cycle rental was saved as credit, changing to debit');
              finalType = 'debit';
            } else if (!transactionType || transactionType !== 'debit') {
              console.warn('💰 WalletService: FIXING - Cycle rental has invalid type, changing to debit');
              finalType = 'debit';
            }
          }
          
          const balanceBefore = balance;
          if (finalType === 'credit') {
            balance += roundedAmount;
            console.log(`💰 WalletService: Transaction ${index + 1} - CREDIT +₹${roundedAmount.toFixed(2)} | Balance: ₹${balanceBefore.toFixed(2)} → ₹${balance.toFixed(2)}`);
          } else if (finalType === 'debit') {
            // SUBTRACT for debit (this is correct - debit means money going out)
            balance -= roundedAmount;
            console.log(`💰 WalletService: Transaction ${index + 1} - DEBIT -₹${roundedAmount.toFixed(2)} | Balance: ₹${balanceBefore.toFixed(2)} → ₹${balance.toFixed(2)}`);
          } else {
            console.warn(`💰 WalletService: Transaction ${index + 1} - Unknown type "${finalType}", skipping`);
          }
        } else {
          console.log(`💰 WalletService: Transaction ${index + 1} - Status is "${transaction.status}", skipping`);
        }
      });
    } catch (e) {
      console.error('💰 WalletService: Error calculating balance from transactions:', e);
    }

    // Round to 2 decimal places and ensure balance doesn't go negative
    const finalBalance = Math.max(0, Math.round(balance * 100) / 100);
    console.log('💰 WalletService: Final calculated balance:', finalBalance);
    return finalBalance;
  }
}

