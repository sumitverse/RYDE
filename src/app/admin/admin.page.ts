import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButtons,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  bicycleOutline,
  peopleOutline,
  calendarOutline,
  walletOutline,
  ticketOutline,
  statsChartOutline,
  addOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  searchOutline,
  filterOutline,
  refreshOutline,
  arrowBackOutline,
  shieldCheckmarkOutline,
  trendingUpOutline,
  trendingDownOutline,
  timeOutline,
  locationOutline,
  cashOutline,
  cardOutline,
  closeOutline,
  personCircleOutline
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
  status: 'available' | 'booked' | 'maintenance';
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalRides: number;
  walletBalance: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface Booking {
  id: string;
  userId: string;
  userName: string;
  cycleId: number;
  cycleTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fare: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discount?: string;
  validFrom: Date;
  validTo: Date;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
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
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButtons
  ]
})
export class AdminPage implements OnInit {
  selectedTab: string = 'dashboard';
  
  // Dashboard Stats
  dashboardStats = {
    totalCycles: 0,
    availableCycles: 0,
    bookedCycles: 0,
    totalUsers: 0,
    activeRides: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0
  };

  // Data Arrays
  cycles: Cycle[] = [];
  users: User[] = [];
  bookings: Booking[] = [];
  transactions: Transaction[] = [];
  offers: Offer[] = [];

  // Filtered Data
  filteredCycles: Cycle[] = [];
  filteredUsers: User[] = [];
  filteredBookings: Booking[] = [];
  filteredTransactions: Transaction[] = [];

  // Search
  searchQuery: string = '';

  // Modal States
  isCycleModalOpen: boolean = false;
  isOfferModalOpen: boolean = false;
  editingCycle: Cycle | null = null;
  editingOffer: Offer | null = null;

  // Form Data
  cycleForm = {
    title: '',
    price: 0,
    thumbnail: '',
    battery: 100,
    distance: 0,
    condition: 'excellent',
    location: '',
    status: 'available'
  };

  offerForm = {
    title: '',
    description: '',
    image: '',
    discount: '',
    validFrom: '',
    validTo: '',
    status: 'active'
  };

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({
      settingsOutline,
      bicycleOutline,
      peopleOutline,
      calendarOutline,
      walletOutline,
      ticketOutline,
      statsChartOutline,
      addOutline,
      createOutline,
      trashOutline,
      eyeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      searchOutline,
      filterOutline,
      refreshOutline,
      arrowBackOutline,
      shieldCheckmarkOutline,
      trendingUpOutline,
      trendingDownOutline,
      timeOutline,
      locationOutline,
      cashOutline,
      cardOutline,
      closeOutline,
      personCircleOutline
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  async loadAllData() {
    this.isLoading = true;
    // Clear existing data to ensure fresh dummy data loads
    // Uncomment the line below if you want to force refresh dummy data
    // localStorage.removeItem('users');
    // localStorage.removeItem('bookings');
    
    await Promise.all([
      this.loadCycles(),
      this.loadUsers(),
      this.loadBookings(),
      this.loadTransactions(),
      this.loadOffers()
    ]);
    this.calculateDashboardStats();
    this.isLoading = false;
  }

  async loadCycles() {
    const saved = localStorage.getItem('cycles');
    if (saved) {
      this.cycles = JSON.parse(saved);
    } else {
      // Sample data
      this.cycles = [
        {
          id: 1,
          title: 'Electric Bike Pro',
          price: 50,
          thumbnail: 'https://via.placeholder.com/150',
          battery: 85,
          distance: 2.5,
          condition: 'excellent',
          location: 'Block A',
          status: 'available'
        },
        {
          id: 2,
          title: 'Mountain Bike',
          price: 30,
          thumbnail: 'https://via.placeholder.com/150',
          battery: 0,
          distance: 1.2,
          condition: 'good',
          location: 'Block B',
          status: 'booked'
        }
      ];
      localStorage.setItem('cycles', JSON.stringify(this.cycles));
    }
    this.filteredCycles = [...this.cycles];
  }

  async loadUsers() {
    const dummyUsers: User[] = [
      {
        id: '1',
        name: 'Sumit',
        email: 'sumit@gmail.com',
        phone: '+919876543210',
        totalRides: 30,
        walletBalance: 850,
        status: 'active' as 'active' | 'inactive' | 'suspended'
      },
      {
        id: '2',
        name: 'Kunal',
        email: 'kunal@gmail.com',
        phone: '+919765432109',
        totalRides: 22,
        walletBalance: 600,
        status: 'active' as 'active' | 'inactive' | 'suspended'
      },
      {
        id: '3',
        name: 'Tejasvi Sisodia',
        email: 'tejasvi@gmail.com',
        phone: '+919654321098',
        totalRides: 28,
        walletBalance: 720,
        status: 'active' as 'active' | 'inactive' | 'suspended'
      },
      {
        id: '4',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@gmail.com',
        phone: '+919543210987',
        totalRides: 25,
        walletBalance: 750,
        status: 'active' as 'active' | 'inactive' | 'suspended'
      },
      {
        id: '5',
        name: 'Priya Sharma',
        email: 'priya.sharma@yahoo.com',
        phone: '+919432109876',
        totalRides: 18,
        walletBalance: 450,
        status: 'active' as 'active' | 'inactive' | 'suspended'
      }
    ];
    
    const saved = localStorage.getItem('users');
    
    // Always use dummy users to ensure they're visible
    // Check if saved data exists and merge, but prioritize dummy users
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if our specific dummy users (by ID) exist
        const existingIds = parsed.map((u: any) => u.id);
        const dummyUserIds = dummyUsers.map(u => u.id);
        
        // Remove old dummy users if they exist
        const filteredParsed = parsed.filter((u: any) => !dummyUserIds.includes(u.id));
        
        // Always add/update dummy users
        this.users = [...filteredParsed, ...dummyUsers];
        localStorage.setItem('users', JSON.stringify(this.users));
      } catch (e) {
        // If parsing fails, use dummy data
        this.users = dummyUsers;
        localStorage.setItem('users', JSON.stringify(this.users));
      }
    } else {
      // No saved data, use dummy data
      this.users = dummyUsers;
      localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    // Ensure at least dummy users are always present
    if (this.users.length === 0) {
      this.users = dummyUsers;
      localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    this.filteredUsers = [...this.users];
  }

  async loadBookings() {
    const saved = localStorage.getItem('bookings');
    if (saved) {
      this.bookings = JSON.parse(saved).map((b: any) => ({
        ...b,
        startTime: new Date(b.startTime),
        endTime: b.endTime ? new Date(b.endTime) : undefined
      }));
    } else {
      this.bookings = [];
    }
    
    // Always ensure dummy bookings are present
    // Check if our dummy bookings exist, if not add them
    const dummyBookingIds = ['booking_1', 'booking_2', 'booking_3', 'booking_4', 'booking_5', 'booking_6'];
    const existingBookingIds = this.bookings.map((b: any) => b.id);
    const missingBookingIds = dummyBookingIds.filter(id => !existingBookingIds.includes(id));
    
    if (this.bookings.length === 0 || missingBookingIds.length > 0) {
      const now = new Date();
      const newBookings: Booking[] = [
        {
          id: 'booking_1',
          userId: '1',
          userName: 'Sumit',
          cycleId: 1,
          cycleTitle: 'Electric Bike Pro',
          startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          endTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          duration: 90,
          fare: 75,
          status: 'completed' as 'active' | 'completed' | 'cancelled'
        },
        {
          id: 'booking_2',
          userId: '2',
          userName: 'Kunal',
          cycleId: 2,
          cycleTitle: 'Mountain Bike',
          startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
          endTime: undefined,
          duration: undefined,
          fare: 45,
          status: 'active' as 'active' | 'completed' | 'cancelled'
        },
        {
          id: 'booking_3',
          userId: '3',
          userName: 'Tejasvi Sisodia',
          cycleId: 1,
          cycleTitle: 'Electric Bike Pro',
          startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
          endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
          duration: 120,
          fare: 100,
          status: 'completed' as 'active' | 'completed' | 'cancelled'
        },
        {
          id: 'booking_4',
          userId: '4',
          userName: 'Rajesh Kumar',
          cycleId: 2,
          cycleTitle: 'Mountain Bike',
          startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          endTime: new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23 hours ago
          duration: 60,
          fare: 30,
          status: 'completed' as 'active' | 'completed' | 'cancelled'
        },
        {
          id: 'booking_5',
          userId: '5',
          userName: 'Priya Sharma',
          cycleId: 1,
          cycleTitle: 'Electric Bike Pro',
          startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          endTime: undefined,
          duration: undefined,
          fare: 50,
          status: 'active' as 'active' | 'completed' | 'cancelled'
        },
        {
          id: 'booking_6',
          userId: '1',
          userName: 'Sumit',
          cycleId: 2,
          cycleTitle: 'Mountain Bike',
          startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
          duration: 45,
          fare: 22.5,
          status: 'cancelled' as 'active' | 'completed' | 'cancelled'
        }
      ];
      
      // If bookings exist, filter out old dummy bookings and add new ones
      if (this.bookings.length > 0) {
        const filteredBookings = this.bookings.filter((b: any) => !dummyBookingIds.includes(b.id));
        this.bookings = [...filteredBookings, ...newBookings];
      } else {
        this.bookings = newBookings;
      }
      
      localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }
    this.filteredBookings = [...this.bookings];
  }

  async loadTransactions() {
    const saved = localStorage.getItem('walletTransactions');
    if (saved) {
      const transactions = JSON.parse(saved);
      this.transactions = transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        userId: '1',
        userName: 'User'
      }));
    } else {
      this.transactions = [];
    }
    this.filteredTransactions = [...this.transactions];
  }

  async loadOffers() {
    const saved = localStorage.getItem('offers');
    if (saved) {
      this.offers = JSON.parse(saved).map((o: any) => ({
        ...o,
        validFrom: new Date(o.validFrom),
        validTo: new Date(o.validTo)
      }));
    } else {
      this.offers = [];
      localStorage.setItem('offers', JSON.stringify(this.offers));
    }
  }

  calculateDashboardStats() {
    this.dashboardStats.totalCycles = this.cycles.length;
    this.dashboardStats.availableCycles = this.cycles.filter(c => c.status === 'available').length;
    this.dashboardStats.bookedCycles = this.cycles.filter(c => c.status === 'booked').length;
    this.dashboardStats.totalUsers = this.users.length;
    this.dashboardStats.activeRides = this.bookings.filter(b => b.status === 'active').length;
    this.dashboardStats.totalRevenue = this.transactions
      .filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    this.dashboardStats.todayRevenue = this.transactions
      .filter(t => {
        const today = new Date();
        const transDate = new Date(t.date);
        return t.type === 'credit' && 
               t.status === 'completed' &&
               transDate.toDateString() === today.toDateString();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    this.dashboardStats.totalBookings = this.bookings.length;
  }

  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
    this.searchQuery = '';
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.applyFilters();
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();
    
    switch (this.selectedTab) {
      case 'cycles':
        this.filteredCycles = this.cycles.filter(c =>
          c.title.toLowerCase().includes(query) ||
          (c.location && c.location.toLowerCase().includes(query))
        );
        break;
      case 'users':
        this.filteredUsers = this.users.filter(u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
        break;
      case 'bookings':
        this.filteredBookings = this.bookings.filter(b =>
          b.userName.toLowerCase().includes(query) ||
          b.cycleTitle.toLowerCase().includes(query)
        );
        break;
      case 'transactions':
        this.filteredTransactions = this.transactions.filter(t =>
          t.userName.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
        );
        break;
    }
  }

  // Cycle Management
  openCycleModal(cycle?: Cycle) {
    if (cycle) {
      this.editingCycle = cycle;
      this.cycleForm = {
        title: cycle.title,
        price: cycle.price,
        thumbnail: cycle.thumbnail,
        battery: cycle.battery || 100,
        distance: cycle.distance || 0,
        condition: cycle.condition || 'excellent',
        location: cycle.location || '',
        status: cycle.status
      };
    } else {
      this.editingCycle = null;
      this.cycleForm = {
        title: '',
        price: 0,
        thumbnail: '',
        battery: 100,
        distance: 0,
        condition: 'excellent',
        location: '',
        status: 'available'
      };
    }
    this.isCycleModalOpen = true;
  }

  async saveCycle() {
    if (!this.cycleForm.title || !this.cycleForm.price) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    if (this.editingCycle) {
      const index = this.cycles.findIndex(c => c.id === this.editingCycle!.id);
      this.cycles[index] = {
        ...this.editingCycle,
        ...this.cycleForm,
        status: this.cycleForm.status as 'available' | 'booked' | 'maintenance'
      };
      this.showToast('Cycle updated successfully', 'success');
    } else {
      const newCycle: Cycle = {
        id: Date.now(),
        ...this.cycleForm,
        status: this.cycleForm.status as 'available' | 'booked' | 'maintenance'
      };
      this.cycles.push(newCycle);
      this.showToast('Cycle added successfully', 'success');
    }

    localStorage.setItem('cycles', JSON.stringify(this.cycles));
    this.isCycleModalOpen = false;
    this.applyFilters();
    this.calculateDashboardStats();
  }

  async deleteCycle(cycle: Cycle) {
    const alert = await this.alertController.create({
      header: 'Delete Cycle',
      message: `Are you sure you want to delete "${cycle.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.cycles = this.cycles.filter(c => c.id !== cycle.id);
            localStorage.setItem('cycles', JSON.stringify(this.cycles));
            this.applyFilters();
            this.calculateDashboardStats();
            this.showToast('Cycle deleted successfully', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  // Offer Management
  openOfferModal(offer?: Offer) {
    if (offer) {
      this.editingOffer = offer;
      this.offerForm = {
        title: offer.title,
        description: offer.description,
        image: offer.image,
        discount: offer.discount || '',
        validFrom: offer.validFrom.toISOString().split('T')[0],
        validTo: offer.validTo.toISOString().split('T')[0],
        status: offer.status
      };
    } else {
      this.editingOffer = null;
      this.offerForm = {
        title: '',
        description: '',
        image: '',
        discount: '',
        validFrom: '',
        validTo: '',
        status: 'active'
      };
    }
    this.isOfferModalOpen = true;
  }

  async saveOffer() {
    if (!this.offerForm.title || !this.offerForm.description) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    if (this.editingOffer) {
      const index = this.offers.findIndex(o => o.id === this.editingOffer!.id);
      this.offers[index] = {
        ...this.editingOffer,
        ...this.offerForm,
        status: this.offerForm.status as 'active' | 'inactive',
        validFrom: new Date(this.offerForm.validFrom),
        validTo: new Date(this.offerForm.validTo)
      };
      this.showToast('Offer updated successfully', 'success');
    } else {
      const newOffer: Offer = {
        id: `offer_${Date.now()}`,
        ...this.offerForm,
        status: this.offerForm.status as 'active' | 'inactive',
        validFrom: new Date(this.offerForm.validFrom),
        validTo: new Date(this.offerForm.validTo)
      };
      this.offers.push(newOffer);
      this.showToast('Offer added successfully', 'success');
    }

    localStorage.setItem('offers', JSON.stringify(this.offers));
    this.isOfferModalOpen = false;
  }

  async deleteOffer(offer: Offer) {
    const alert = await this.alertController.create({
      header: 'Delete Offer',
      message: `Are you sure you want to delete "${offer.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.offers = this.offers.filter(o => o.id !== offer.id);
            localStorage.setItem('offers', JSON.stringify(this.offers));
            this.showToast('Offer deleted successfully', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  // User Management
  async toggleUserStatus(user: User) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('users', JSON.stringify(this.users));
    this.showToast(`User ${user.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
  }

  // Booking Management
  async cancelBooking(booking: Booking) {
    const alert = await this.alertController.create({
      header: 'Cancel Booking',
      message: `Are you sure you want to cancel this booking?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => {
            booking.status = 'cancelled';
            const cycle = this.cycles.find(c => c.id === booking.cycleId);
            if (cycle) {
              cycle.status = 'available';
            }
            localStorage.setItem('bookings', JSON.stringify(this.bookings));
            localStorage.setItem('cycles', JSON.stringify(this.cycles));
            this.applyFilters();
            this.calculateDashboardStats();
            this.showToast('Booking cancelled successfully', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  async refreshData() {
    const loading = await this.loadingController.create({
      message: 'Refreshing data...'
    });
    await loading.present();
    
    // Force refresh by clearing and reloading
    localStorage.removeItem('users');
    localStorage.removeItem('bookings');
    
    await this.loadAllData();
    
    await loading.dismiss();
    this.showToast('Data refreshed successfully', 'success');
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'available':
      case 'active':
      case 'completed':
        return 'success';
      case 'booked':
        return 'warning';
      case 'maintenance':
      case 'cancelled':
      case 'failed':
        return 'danger';
      case 'inactive':
        return 'medium';
      default:
        return 'primary';
    }
  }
}

