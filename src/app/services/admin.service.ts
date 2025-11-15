import { Injectable } from '@angular/core';

export interface UserLogin {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginTime: Date;
  logoutTime?: Date;
  sessionDuration?: number; // in minutes
  deviceInfo?: string;
}

export interface Cycle {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  battery?: number;
  distance?: number;
  condition?: string;
  location?: string;
  status: 'available' | 'booked' | 'maintenance';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly LOGIN_HISTORY_KEY = 'userLoginHistory';
  private readonly CYCLES_KEY = 'cycles';
  private readonly TRANSACTIONS_KEY = 'walletTransactions';

  constructor() {}

  // Login Tracking Methods
  trackUserLogin(userId: string, userName: string, userEmail: string): void {
    const loginHistory = this.getLoginHistory();
    
    const login: UserLogin = {
      id: `login_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      userName,
      userEmail,
      loginTime: new Date(),
      deviceInfo: this.getDeviceInfo()
    };
    
    loginHistory.push(login);
    localStorage.setItem(this.LOGIN_HISTORY_KEY, JSON.stringify(loginHistory));
  }

  trackUserLogout(userId: string): void {
    const loginHistory = this.getLoginHistory();
    const activeLogin = loginHistory.find(
      login => login.userId === userId && !login.logoutTime
    );
    
    if (activeLogin) {
      activeLogin.logoutTime = new Date();
      const duration = (activeLogin.logoutTime.getTime() - new Date(activeLogin.loginTime).getTime()) / (1000 * 60);
      activeLogin.sessionDuration = Math.round(duration * 100) / 100;
      localStorage.setItem(this.LOGIN_HISTORY_KEY, JSON.stringify(loginHistory));
    }
  }

  getLoginHistory(): UserLogin[] {
    const saved = localStorage.getItem(this.LOGIN_HISTORY_KEY);
    if (saved) {
      try {
        const history = JSON.parse(saved);
        return history.map((login: any) => ({
          ...login,
          loginTime: new Date(login.loginTime),
          logoutTime: login.logoutTime ? new Date(login.logoutTime) : undefined
        }));
      } catch (e) {
        console.error('Error parsing login history:', e);
        return [];
      }
    }
    return [];
  }

  getTotalLogins(): number {
    return this.getLoginHistory().length;
  }

  getUniqueUsers(): number {
    const history = this.getLoginHistory();
    const uniqueUserIds = new Set(history.map(login => login.userId));
    return uniqueUserIds.size;
  }

  getTodayLogins(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const history = this.getLoginHistory();
    return history.filter(login => {
      const loginDate = new Date(login.loginTime);
      loginDate.setHours(0, 0, 0, 0);
      return loginDate.getTime() === today.getTime();
    }).length;
  }

  getActiveSessions(): number {
    const history = this.getLoginHistory();
    return history.filter(login => !login.logoutTime).length;
  }

  // Cycle Management Methods
  getAllCycles(): Cycle[] {
    const saved = localStorage.getItem(this.CYCLES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cycles:', e);
        return [];
      }
    }
    return [];
  }

  addCycle(cycle: Omit<Cycle, 'id' | 'createdAt' | 'updatedAt'>): Cycle {
    const cycles = this.getAllCycles();
    const newCycle: Cycle = {
      ...cycle,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    cycles.push(newCycle);
    localStorage.setItem(this.CYCLES_KEY, JSON.stringify(cycles));
    return newCycle;
  }

  updateCycle(id: number, updates: Partial<Cycle>): boolean {
    const cycles = this.getAllCycles();
    const index = cycles.findIndex(c => c.id === id);
    if (index !== -1) {
      cycles[index] = {
        ...cycles[index],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem(this.CYCLES_KEY, JSON.stringify(cycles));
      return true;
    }
    return false;
  }

  deleteCycle(id: number): boolean {
    const cycles = this.getAllCycles();
    const filtered = cycles.filter(c => c.id !== id);
    if (filtered.length < cycles.length) {
      localStorage.setItem(this.CYCLES_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  // Transaction Methods
  getAllTransactions(): Transaction[] {
    const saved = localStorage.getItem(this.TRANSACTIONS_KEY);
    if (saved) {
      try {
        const transactions = JSON.parse(saved);
        return transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          userId: t.userId || 'unknown',
          userName: t.userName || 'Unknown User'
        }));
      } catch (e) {
        console.error('Error parsing transactions:', e);
        return [];
      }
    }
    return [];
  }

  getTotalRevenue(): number {
    const transactions = this.getAllTransactions();
    return transactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTodayRevenue(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactions = this.getAllTransactions();
    return transactions
      .filter(t => {
        const transDate = new Date(t.date);
        transDate.setHours(0, 0, 0, 0);
        return t.type === 'debit' && 
               t.status === 'completed' &&
               transDate.getTime() === today.getTime();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Helper Methods
  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) {
      return 'Mobile';
    } else if (/tablet/i.test(ua)) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  // Wallet Balance Methods
  /**
   * Get wallet balance for a specific user
   * @param userId - User ID to get balance for
   * @returns Wallet balance or 0 if not found
   */
  getUserWalletBalance(userId: string): number {
    // Try to get balance from direct storage first
    const directBalance = localStorage.getItem('currentWalletBalance');
    if (directBalance) {
      const balance = parseFloat(directBalance);
      if (!isNaN(balance) && balance >= 0) {
        return balance;
      }
    }

    // Fallback: calculate from transactions
    const transactions = this.getAllTransactions();
    const userTransactions = transactions.filter(t => t.userId === userId && t.status === 'completed');
    
    // Get initial balance
    const savedInitialBalance = localStorage.getItem('initialWalletBalance');
    let balance = savedInitialBalance ? parseFloat(savedInitialBalance) : 250.50;

    // Process user's transactions
    userTransactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'number' 
        ? transaction.amount 
        : parseFloat(String(transaction.amount)) || 0;
      
      const roundedAmount = Math.round(amount * 100) / 100;
      
      if (transaction.type === 'credit') {
        balance += roundedAmount;
      } else if (transaction.type === 'debit') {
        balance -= roundedAmount;
      }
    });

    return Math.max(0, Math.round(balance * 100) / 100);
  }

  /**
   * Get wallet balance for a user by email
   * @param userEmail - User email to get balance for
   * @returns Wallet balance or 0 if not found
   */
  getUserWalletBalanceByEmail(userEmail: string): number {
    // Find user ID from login history
    const loginHistory = this.getLoginHistory();
    const userLogin = loginHistory.find(login => login.userEmail === userEmail);
    
    if (userLogin) {
      return this.getUserWalletBalance(userLogin.userId);
    }

    // If user not found in login history, return current balance (assuming it's the logged-in user)
    const directBalance = localStorage.getItem('currentWalletBalance');
    if (directBalance) {
      const balance = parseFloat(directBalance);
      if (!isNaN(balance) && balance >= 0) {
        return balance;
      }
    }

    return 0;
  }

  // Statistics Methods
  getDashboardStats() {
    const cycles = this.getAllCycles();
    const transactions = this.getAllTransactions();
    const loginHistory = this.getLoginHistory();
    
    return {
      totalCycles: cycles.length,
      availableCycles: cycles.filter(c => c.status === 'available').length,
      bookedCycles: cycles.filter(c => c.status === 'booked').length,
      maintenanceCycles: cycles.filter(c => c.status === 'maintenance').length,
      totalUsers: this.getUniqueUsers(),
      totalLogins: this.getTotalLogins(),
      todayLogins: this.getTodayLogins(),
      activeSessions: this.getActiveSessions(),
      totalRevenue: this.getTotalRevenue(),
      todayRevenue: this.getTodayRevenue(),
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length
    };
  }
}

