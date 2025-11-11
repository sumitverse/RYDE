import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonChip,
  IonBadge,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  bicycleOutline,
  timeOutline,
  flashOutline,
  navigateOutline,
  closeCircleOutline,
  closeOutline,
  refreshOutline,
  searchOutline,
  filterOutline,
  starOutline,
  star,
  trendingUpOutline,
  walletOutline,
  speedometerOutline,
  calendarOutline,
  trophyOutline,
  heartOutline,
  heart,
  shareSocialOutline,
  chevronForwardOutline,
  statsChartOutline,
  sunnyOutline,
  cloudOutline,
  checkmarkCircleOutline,
  checkmarkCircle
} from 'ionicons/icons';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HeaderComponent } from '../shared/header/header.component';

// Leaflet - will be loaded dynamically
let L: any;

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

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discount?: string;
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
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonSearchbar,
    IonChip,
    IonBadge,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1Page implements OnInit, AfterViewInit, OnDestroy, ViewWillEnter {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  Math = Math; // Expose Math to template

  // User data
  userName: string = 'User';
  userAvatar: string = '';
  currentLocation: string = 'Loading...';
  greeting: string = '';
  loggedInUserName: string = '';
  notificationCount: number = 6;
  showBookingNotification: boolean = false;
  bookingNotificationMessage: string = '';

  // Cycle and ride data
  cycles: Cycle[] = [];
  filteredCycles: Cycle[] = [];
  offers: Offer[] = [];
  activeRide: ActiveRide | null = null;

  // Loading states
  isLoading: boolean = true;
  isReloading: boolean = false;
  showReloadAnimation: boolean = false;
  map: any = null;
  markers: any[] = [];

  // Filter and search states
  searchQuery: string = '';
  selectedFilter: string = 'all';
  favoriteCycles: Set<number> = new Set();
  showNearestMessage: boolean = false;

  // Statistics
  totalRides: number = 0;
  totalDistance: number = 0;
  totalSaved: number = 0;
  carbonSaved: number = 0;

  recentActivities: any[] = [];

  // Animation states
  isTotalRidesAnimating: boolean = false;
  isDistanceAnimating: boolean = false;
  animatingAction: string | null = null;

  weather: any = {
    temp: 22,
    condition: 'sunny',
    icon: 'sunny-outline'
  };

  quickActions = [
    { icon: 'navigate-outline', label: 'Find Nearest', color: 'primary' },
    { icon: 'filter-outline', label: 'Filter', color: 'secondary' },
    { icon: 'calendar-outline', label: 'Schedule', color: 'tertiary' },
    { icon: 'stats-chart-outline', label: 'Stats', color: 'success' }
  ];

  // Location and ride tracking
  private locationWatchId: number | null = null;
  private rideInterval: any = null;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      locationOutline,
      bicycleOutline,
      timeOutline,
      flashOutline,
      navigateOutline,
      closeCircleOutline,
      closeOutline,
      refreshOutline,
      searchOutline,
      filterOutline,
      starOutline,
      star,
      trendingUpOutline,
      walletOutline,
      speedometerOutline,
      calendarOutline,
      trophyOutline,
      heartOutline,
      heart,
      shareSocialOutline,
      chevronForwardOutline,
      statsChartOutline,
      sunnyOutline,
      cloudOutline,
      checkmarkCircleOutline,
      checkmarkCircle
    });
  }

  ngOnInit() {
    console.log('Tab1Page initialized');
    this.loadUserFromStorage();
    this.setGreeting();
    // Update userName immediately from loggedInUserName
    this.userName = this.loggedInUserName || 'User';
    if (this.loggedInUserName && this.loggedInUserName !== 'User') {
      this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.loggedInUserName) + '&background=2563EB&color=fff';
    }
    // Clear any stale active rides first, then load valid ones
    this.validateAndLoadActiveRide();
    this.loadData();
    this.getCurrentLocation();
    this.loadStats();
    this.loadFavorites();
    this.loadWeather();
    this.loadRecentActivity();
    this.updateNotificationCount();
    // Request notification permission on app load
    this.requestNotificationPermission();
  }

  validateAndLoadActiveRide() {
    // First check if ride was explicitly ended - if so, don't load it
    const rideEnded = localStorage.getItem('rideEnded');
    if (rideEnded === 'true') {
      console.log('Ride was ended - clearing any remaining data');
      this.clearActiveRide();
      localStorage.removeItem('rideEnded');
      return;
    }

    // First validate if there's a valid active ride
    const savedRide = localStorage.getItem('activeRide');
    if (!savedRide) {
      this.activeRide = null;
      return;
    }

    try {
      const rideData = JSON.parse(savedRide);
      
      // Check if cycle data exists
      if (!rideData.cycle || !rideData.cycle.title || !rideData.cycle.price) {
        console.log('Invalid cycle data in saved ride - clearing');
        this.clearActiveRide();
        return;
      }
      
      // Check if startTime exists and is valid
      if (!rideData.startTime) {
        console.log('No startTime in saved ride - clearing');
        this.clearActiveRide();
        return;
      }

      const startTime = new Date(rideData.startTime);
      if (isNaN(startTime.getTime())) {
        console.log('Invalid startTime - clearing');
        this.clearActiveRide();
        return;
      }

      // Check if ride is in the future (invalid)
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      
      if (diffMs < 0) {
        console.log('Ride startTime is in the future - clearing invalid ride');
        this.clearActiveRide();
        return;
      }

      // Only clear if ride is older than 24 hours (truly stale from previous sessions)
      // This allows valid rides to persist across page reloads
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 24) {
        console.log(`Ride is older than 24 hours (${diffHours.toFixed(2)} hours) - clearing stale ride`);
        this.clearActiveRide();
        return;
      }

      // If validation passes, load the ride
      this.loadActiveRide();
    } catch (error) {
      console.error('Error validating active ride:', error);
      this.clearActiveRide();
    }
  }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.loggedInUserName = userData.name || 'User';
        // Update userName and avatar immediately
        this.userName = this.loggedInUserName;
        // Check for photo in localStorage (prefer photo, then avatar, then generate)
        if (userData.photo || userData.avatar) {
          this.userAvatar = userData.photo || userData.avatar;
        } else if (this.loggedInUserName && this.loggedInUserName !== 'User') {
          this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.loggedInUserName) + '&background=10B981&color=fff';
        } else {
          this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.loggedInUserName = 'User';
        this.userName = 'User';
        this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
      }
    } else {
      this.loggedInUserName = 'User';
      this.userName = 'User';
      this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
    }
  }

  ionViewWillEnter() {
    // Refresh user data and stats when tab becomes active
    this.loadUserFromStorage();
    this.loadStats();
    // Validate and reload active ride when returning to tab1 (prevents stale rides)
    this.validateAndLoadActiveRide();
    // Refresh weather when returning from weather page
    this.loadWeather();
    // Refresh recent activity
    this.loadRecentActivity();
    // Update notification count when returning to tab
    this.updateNotificationCount();
  }

  async ngAfterViewInit() {

    try {
      const leafletModule = await import('leaflet');
      L = leafletModule.default || leafletModule;
      setTimeout(() => {
        this.initMap();
      }, 500);
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  }

  ngOnDestroy() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }
    if (this.rideInterval) {
      clearInterval(this.rideInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  async loadData() {
    try {
      const loading = await this.loadingController.create({
        message: 'Loading...',
        spinner: 'crescent'
      });
      await loading.present();

      forkJoin({
        cycles: this.fetchCycles(0),
        offers: this.fetchOffers()
      }).subscribe({
        next: (data) => {
          console.log('Data loaded successfully:', data);
          // Use logged in user name from localStorage
          this.userName = this.loggedInUserName || 'User';
          // Check for photo in localStorage, otherwise generate avatar from name
          const savedUser = localStorage.getItem('userData');
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              if (userData.photo || userData.avatar) {
                this.userAvatar = userData.photo || userData.avatar;
              } else {
                this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
              }
            } catch (e) {
              this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
            }
          } else {
            this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
          }
          this.cycles = data.cycles;
          this.filteredCycles = data.cycles;
          this.offers = data.offers;
          this.isLoading = false;
          loading.dismiss();
          this.updateMapMarkers();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.isLoading = false;
          loading.dismiss().catch(() => {});
          this.showToast('Failed to load data. Please try again.', 'danger');
          // Set default values to prevent empty page
          if (!this.loggedInUserName || this.loggedInUserName === 'User') {
            this.userName = 'Guest User';
            this.userAvatar = 'https://ui-avatars.com/api/?name=Guest+User&background=2563EB&color=fff';
          } else {
            this.userName = this.loggedInUserName;
            this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=2563EB&color=fff';
          }
          if (this.cycles.length === 0) {
            console.warn('No cycles loaded');
          }
        }
      });
    } catch (error) {
      console.error('Error in loadData:', error);
      this.isLoading = false;
    }
  }

  // Removed fetchUser - using localStorage instead
  // Array of different cycle images - diverse bicycle images
  private cycleImages: string[] = [
    'https://tse2.mm.bing.net/th/id/OIP.OXYP8HZtkg0rlEuMKx5jQQAAAA?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://purepng.com/public/uploads/large/purepng.com-bicyclebicyclesbicyclebikecyclehuman-poweredpedal-drivensingle-track-vehicletwo-wheels-1701528100067orlz0.png',
    'https://tse2.mm.bing.net/th/id/OIP.E2x72Mmy1YPbsdIqg4gUFAHaF6?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://rukminim1.flixcart.com/image/612/612/kdyus280/cycle/e/y/b/storm-nv-17-hercules-single-speed-original-imafurfymcvb5yrm.jpeg?q=70',
    'https://rukminim1.flixcart.com/image/1664/1664/cycle/k/s/k/na-atlas-l-super-strong-original-imaegg8rgggrccfy.jpeg?q=90',
    'https://www.velocrushindia.com/wp-content/uploads/2019/03/Untitled-design-36-2.jpg',
    'https://cdn.zeebiz.com/sites/default/files/2020/11/18/133925-ev.PNG',
    'https://images-na.ssl-images-amazon.com/images/I/71Sev%2Bjv7HL._SX569_.jpg',
    'https://tse2.mm.bing.net/th/id/OIP.QeKNorwrLo5MIQFE_4TqwQHaEh?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://tse4.mm.bing.net/th/id/OIP.OFA31LbdChwi-VrfznBqtAHaEO?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://cdn.pixabay.com/photo/2016/01/13/10/29/bicycle-1137514_960_720.jpg',
    'https://tse2.mm.bing.net/th/id/OIP.-Lu5ijpAXOMftoKJXH2qwQHaEK?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://en-media.thebetterindia.com/uploads/2021/03/nexzu-mobility.PNG1_.jpg',
    'https://tse2.mm.bing.net/th/id/OIP.81qNORKjkGMK8BQlVI55RgHaE8?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://images.livemint.com/img/2020/11/18/1600x900/EMX_1605715171838_1605715180242.jpg',
    'https://image.made-in-china.com/2f0j00JGpqLtNRsvrE/China-New-Type-Electric-48V-350W-Electric-Mountian-Bike-EV-Bike-Cycle-Electric-Bicycle.jpg',
    'https://tse4.mm.bing.net/th/id/OIP.FepJcY0Px0_t3hW385ewgAHaE7?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://wallpapercave.com/wp/wp3988183.jpg',
    'https://cdn.pixabay.com/photo/2023/11/26/21/14/bike-8414316_1280.jpg',
    'https://tse1.mm.bing.net/th/id/OIP.MovCtlrCMEag-lrXyCLFKAHaEK?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3'
  ];

  // Array of different cycle names
  private cycleNames: string[] = [
    'Hercules Storm NV 17',
    'Atlas L Super Strong',
    'Hero Sprint Pro',
    'Avon Cyclone',
    'Hero Ranger DTB',
    'Firefox Rapide',
    'Montra Trance Pro',
    'Bianchi Sprint',
    'Trek Domane AL',
    'Giant Defy Advanced',
    'Specialized Allez',
    'Cannondale CAAD13',
    'Scott Addict',
    'Merida Reacto',
    'Pinarello Dogma',
    'Colnago C64',
    'Cervelo R5',
    'Orbea Orca',
    'BMC Teammachine',
    'Focus Izalco',
    'Cube Agree C:62',
    'Ridley Helium',
    'Wilier Zero',
    'Factor O2',
    'Argon 18 Gallium'
  ];

  getCycleImage(cycleId: number, index: number): string {
    // Use cycleId and index to ensure different images for different cycles
    // This ensures variety even when reloading
    const imageIndex = (cycleId + index) % this.cycleImages.length;
    return this.cycleImages[imageIndex];
  }

  getCycleName(cycleId: number, index: number): string {
    // Use cycleId and index to ensure different names for different cycles
    // This ensures variety even when reloading
    const nameIndex = (cycleId + index) % this.cycleNames.length;
    return this.cycleNames[nameIndex];
  }

  fetchCycles(skip: number = 0): Observable<Cycle[]> {
    const conditions = ['Excellent', 'Good', 'Fair', 'Very Good'];
    const locations = [
      'Main Campus - Building A',
      'Main Campus - Building B',
      'Library Block',
      'Sports Complex',
      'Student Center',
      'Engineering Block',
      'Science Block',
      'Administration Building',
      'Cafeteria Area',
      'Parking Lot 1'
    ];

    return this.http.get<{ products: any[] }>(`https://dummyjson.com/products?limit=5&skip=${skip}`).pipe(
      map(response => {
        const cycles = response.products.map((product, index) => {
          const cycleId = product.id;
          const nameIndex = (cycleId + skip + index) % this.cycleNames.length;
          const locationIndex = (cycleId + skip + index) % locations.length;
          const conditionIndex = (cycleId + skip + index) % conditions.length;
          return {
            id: cycleId,
            title: this.getCycleName(cycleId, skip + index),
            price: Math.floor(Math.random() * 4) + 1, // 1-5 INR per minute
            thumbnail: this.getCycleImage(cycleId, skip + index),
            battery: Math.floor(Math.random() * 40) + 60,
            distance: Math.round((Math.random() * 1.9 + 0.1) * 100) / 100, // Round to 2 decimal places
            condition: conditions[conditionIndex],
            location: locations[locationIndex]
          };
        });
        // Save cycles to localStorage for details page access
        localStorage.setItem('cycles', JSON.stringify(cycles));
        return cycles;
      }),
      catchError(error => {
        console.error('Error fetching cycles:', error);
        return of([]);
      })
    );
  }

  fetchOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>('https://mocki.io/v1/ce0a4208-0878-465d-b5c2-fb4d1ab664aa').pipe(
      catchError(error => {
        console.error('Error fetching offers:', error);
        return of([
          {
            id: '1',
            title: 'Weekend Special',
            description: 'Get 20% off on weekend rides',
            image: 'https://www.epos.com.sg/wp-content/uploads/2022/11/Bike-Rental-Singapore-Cover-Image-Opt.jpg',
            discount: '20% OFF'
          },
          {
            id: '2',
            title: 'Student Discount',
            description: 'Exclusive discount for students',
            image: 'https://3.imimg.com/data3/CI/LX/MY-13663668/bike-rental-1000x1000.jpg',
            discount: '15% OFF'
          },
          {
            id: '3',
            title: 'First Ride Free',
            description: 'Your first ride is on us!',
            image: 'https://2.bp.blogspot.com/-kp3-LfM2B2w/XA-SYfMgK3I/AAAAAAAAXAA/pDNJDhW3eU0cJ1eKv9DdPxuZ8rWapC5mgCLcBGAs/s1600/LimeElectricAssistCivicCentre.jpg',
            discount: '100% OFF'
          },
          {
            id: '4',
            title: 'Group Ride Bonus',
            description: 'Ride with friends and save more',
            image: 'https://cdn.mos.cms.futurecdn.net/9gZC5hRGjgx9doAZVJCb9L-1280-80.jpg',
            discount: '30% OFF'
          }
        ]);
      })
    );
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], 15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.currentLocation = 'Location unavailable';
          this.showToast('Location access denied. Using default location.', 'warning');
        }
      );

      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], 15);
          }
        }
      );
    } else {
      this.currentLocation = 'Location not supported';
    }
  }

  reverseGeocode(lat: number, lng: number) {
    this.http.get<any>(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'RYDE' } }
    ).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (data) => {
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          this.currentLocation = parts.slice(0, 2).join(', ') || 'Campus Area';
        } else {
          this.currentLocation = 'Campus Area';
        }
      },
      error: () => {
        this.currentLocation = 'Campus Area';
      }
    });
  }

  initMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement || !L) {
      console.warn('Map container or Leaflet not available');
      return;
    }
    // Default to a campus-like location (you can change this)
    const defaultLat = 40.7128;
    const defaultLng = -74.0060;
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
    // Set user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.map?.setView([position.coords.latitude, position.coords.longitude], 15);
          L.marker([position.coords.latitude, position.coords.longitude], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            })
          }).addTo(this.map).bindPopup('Your Location');
        },
        () => {
          // Use default location
        }
      );
    }
    this.updateMapMarkers();
  }

  updateMapMarkers() {
    if (!this.map || this.cycles.length === 0) return;
    // Clear existing markers
    this.markers.forEach(marker => this.map?.removeLayer(marker));
    this.markers = [];
    // Get current map center or use default
    const center = this.map.getCenter();
    const lat = center.lat;
    const lng = center.lng;
    // Add markers for available cycles
    this.cycles.forEach((cycle, index) => {
      const offsetLat = lat + (Math.random() - 0.5) * 0.01;
      const offsetLng = lng + (Math.random() - 0.5) * 0.01;
      const marker = L.marker([offsetLat, offsetLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      }).addTo(this.map!);
      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${cycle.title}</strong><br>
          ₹${cycle.price}/min<br>
          ${cycle.distance ? cycle.distance.toFixed(2) : '0.00'} km away<br>
          Battery: ${cycle.battery}%
        </div>
      `);
      this.markers.push(marker);
    });
  }

  async bookCycle(cycle: Cycle) {
    if (this.activeRide) {
      this.showToast('You already have an active ride!', 'warning');
      return;
    }
    // Validate cycle data before booking
    if (!cycle || !cycle.title || !cycle.price) {
      this.showToast('Invalid cycle data. Please try again.', 'danger');
      return;
    }
    // Validate price is a valid number greater than 0
    const cyclePrice = parseFloat(cycle.price.toString());
    if (isNaN(cyclePrice) || cyclePrice <= 0) {
      this.showToast('Invalid cycle price. Please try again.', 'danger');
      return;
    }
    // Check for applied coupon
    const appliedCoupon = this.getAppliedCoupon();
    // Create active ride
    const startTime = new Date();
    // Ensure cycle object has all required properties
    const validCycle = {
      ...cycle,
      title: cycle.title,
      price: cyclePrice
    };
    const activeRide: ActiveRide = {
      cycle: validCycle,
      startTime,
      duration: 0,
      fare: 0,
      originalFare: 0,
      discount: 0,
      discountPercent: appliedCoupon?.discountPercent || 0,
      couponId: appliedCoupon?.id,
      couponTitle: appliedCoupon?.title
    };
    this.activeRide = activeRide;
    // Clear the rideEnded flag when starting a new ride
    localStorage.removeItem('rideEnded');
    // Save with startTime as ISO string for proper storage
    const rideToSave = {
      cycle: this.activeRide.cycle,
      startTime: startTime.toISOString(),
      duration: this.activeRide.duration,
      fare: this.activeRide.fare,
      originalFare: this.activeRide.originalFare || 0,
      discount: this.activeRide.discount || 0,
      discountPercent: this.activeRide.discountPercent || 0,
      couponId: this.activeRide.couponId,
      couponTitle: this.activeRide.couponTitle
    };
    localStorage.setItem('activeRide', JSON.stringify(rideToSave));
    // Save cycle data for booked page (as fallback)
    localStorage.setItem('bookedCycle', JSON.stringify(validCycle));
    // Clear applied coupon after booking (one-time use)
    if (appliedCoupon) {
      localStorage.removeItem('appliedCoupon');
    }
    // Send booking confirmation notification
    this.sendBookingNotification(validCycle.title);
    // Navigate to booked page with cycle data
    this.router.navigate(['/booked'], {
      state: { cycle: validCycle }
    });
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

  async endRide() {
    if (!this.activeRide) return;

    const rideData = {
      fare: this.activeRide.fare,
      discount: this.activeRide.discount || 0,
      duration: this.activeRide.duration,
      cycleTitle: this.activeRide.cycle.title,
      discountPercent: this.activeRide.discountPercent || 0,
      originalFare: this.activeRide.originalFare || this.activeRide.fare,
      couponTitle: this.activeRide.couponTitle
    };

    // Prepare fare message with discount info
    let fareMessage = `Total fare: ₹${rideData.fare.toFixed(2)}`;
    if (rideData.discount > 0) {
      fareMessage = `Original fare: ₹${rideData.originalFare.toFixed(2)}\nDiscount: -₹${rideData.discount.toFixed(2)} (${rideData.discountPercent}%)\nTotal fare: ₹${rideData.fare.toFixed(2)}`;
    }
    const alert = await this.alertController.create({
      header: 'End Ride',
      message: `Are you sure you want to end your ride?\n\n${fareMessage}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'End Ride',
          handler: () => {
            // Calculate distance (mock: 1km per 10 minutes)
            const estimatedDistance = Math.round(((rideData.duration / 10) || 0.5) * 100) / 100;
            // Update stats
            this.totalRides += 1;
            this.totalDistance = Math.round((this.totalDistance + estimatedDistance) * 100) / 100;
            this.totalSaved = Math.round((this.totalSaved + estimatedDistance * 0.3) * 100) / 100; // ₹0.3 per km
            this.carbonSaved = Math.round((this.carbonSaved + estimatedDistance * 0.2) * 100) / 100; // 0.2 kg CO2 per km
            // Save updated stats
            this.saveStats();
            // Save ride to history WITH cycle name BEFORE clearing active ride
            this.saveRideToHistory(estimatedDistance, rideData.duration, rideData.cycleTitle, rideData.fare);
            // Deduct discounted fare from wallet and add transaction
            this.deductFromWallet(rideData.fare, rideData.cycleTitle, rideData.discount, rideData.couponTitle);
            // IMPORTANT: Clear active ride from localStorage FIRST to prevent it from reloading
            // Clear all possible ride-related keys to ensure complete cleanup
            localStorage.removeItem('activeRide');
            localStorage.removeItem('bookedCycle');
            // Add a flag to mark that ride was ended (prevents reload on page refresh)
            localStorage.setItem('rideEnded', 'true');
            // Clear the active ride from component immediately
            if (this.rideInterval) {
              clearInterval(this.rideInterval);
              this.rideInterval = null;
            }
            this.activeRide = null;
            // Force change detection to update UI immediately
            this.cdr.detectChanges();
            // Reload recent activity to show the new transaction
            this.loadRecentActivity();
            // Show success message with discount info
            if (rideData.discount > 0) {
              this.showToast(`Ride ended! Saved ₹${rideData.discount.toFixed(2)} with coupon! 🎉`, 'success');
            } else {
              this.showToast('Ride ended successfully!', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  deductFromWallet(amount: number, cycleName: string, discount: number = 0, couponTitle?: string) {
    // Load existing transactions
    const savedTransactions = localStorage.getItem('walletTransactions');
    let transactions: any[] = [];
    if (savedTransactions) {
      try {
        transactions = JSON.parse(savedTransactions);
      } catch (e) {
        console.error('Error parsing wallet transactions:', e);
      }
    }
    // Build description with discount info
    let description = `Cycle Rental - ${cycleName}`;
    if (discount > 0 && couponTitle) {
      description += ` (${couponTitle} applied, saved ₹${discount.toFixed(2)})`;
    }
    // Add payment transaction (completed debit)
    const transaction = {
      id: Date.now().toString(),
      type: 'debit',
      amount: amount,
      description: description,
      date: new Date().toISOString(),
      status: 'completed',
      icon: 'bicycle-outline',
      discount: discount,
      couponTitle: couponTitle
    };
    transactions.unshift(transaction);
    // Keep only last 100 transactions
    transactions = transactions.slice(0, 100);
    // Save transactions
    localStorage.setItem('walletTransactions', JSON.stringify(transactions));
  }

  saveRideToHistory(distance: number, duration: number, cycleName?: string, fare?: number) {
    const today = new Date().toISOString().split('T')[0];
    const userData = localStorage.getItem('userData');
    let userEmail = 'default';
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email || 'default';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    const historyKey = `rideHistory_${userEmail}`;
    const individualRidesKey = `individualRides_${userEmail}`;
    let rideHistory: any[] = [];
    let individualRides: any[] = [];
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        rideHistory = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing ride history:', e);
      }
    }
    // Load individual rides for detailed history
    const savedIndividualRides = localStorage.getItem(individualRidesKey);
    if (savedIndividualRides) {
      try {
        individualRides = JSON.parse(savedIndividualRides);
      } catch (e) {
        console.error('Error parsing individual rides:', e);
      }
    }
    // Add individual ride record with cycle name
    const rideRecord = {
      id: `ride-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: today,
      cycleName: cycleName || 'Cycle',
      distance: distance,
      duration: duration,
      fare: fare || 0,
      timestamp: new Date().toISOString()
    };
    individualRides.unshift(rideRecord);
    // Keep only last 100 individual rides
    individualRides = individualRides.slice(0, 100);
    localStorage.setItem(individualRidesKey, JSON.stringify(individualRides));
    // Also update aggregated daily history for backward compatibility
    const todayIndex = rideHistory.findIndex(ride => ride.date === today);
    if (todayIndex >= 0) {
      // Update existing ride for today
      rideHistory[todayIndex].distance += distance;
      rideHistory[todayIndex].rides += 1;
      rideHistory[todayIndex].duration += duration;
    } else {
      // Add new ride for today
      rideHistory.unshift({
        date: today,
        distance: distance,
        rides: 1,
        duration: duration
      });
    }
    // Keep only last 30 days
    rideHistory = rideHistory.slice(0, 30);
    localStorage.setItem(historyKey, JSON.stringify(rideHistory));
    localStorage.setItem('rideHistory', JSON.stringify(rideHistory)); // Legacy key
  }

  loadActiveRide() {
    // Clear any existing interval to prevent duplicates
    if (this.rideInterval) {
      clearInterval(this.rideInterval);
      this.rideInterval = null;
    }

    const savedRide = localStorage.getItem('activeRide');
    if (savedRide) {
      try {
        const rideData = JSON.parse(savedRide);
        
        // Validate cycle data exists and is valid
        if (!rideData.cycle || !rideData.cycle.title || !rideData.cycle.price) {
          console.error('Invalid cycle data in saved ride - missing title or price');
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }

        // Validate cycle price is a valid number greater than 0
        const cyclePrice = parseFloat(rideData.cycle.price);
        if (isNaN(cyclePrice) || cyclePrice <= 0) {
          console.error('Invalid cycle price in saved ride - price must be greater than 0');
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }
        
        // Parse startTime - handle both ISO string and Date object
        let startTime: Date;
        if (typeof rideData.startTime === 'string') {
          startTime = new Date(rideData.startTime);
        } else if (rideData.startTime instanceof Date) {
          startTime = rideData.startTime;
        } else {
          console.error('Invalid startTime in saved ride');
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }

        // Verify the startTime is valid
        if (isNaN(startTime.getTime())) {
          console.error('Invalid startTime date');
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }

        // Ensure cycle object has all required properties
        const validCycle = {
          ...rideData.cycle,
          title: rideData.cycle.title || 'Unknown Cycle',
          price: cyclePrice
        };

        // Always recalculate duration from startTime (don't trust saved duration)
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Only load ride if it started in the past (not future)
        if (diffMs < 0) {
          console.error('Invalid ride - startTime is in the future');
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }

        // Only clear ride if it's older than 24 hours (truly stale from previous sessions)
        // This allows valid rides to persist across page reloads
        if (diffHours > 24) {
          console.log(`Active ride is older than 24 hours (${diffHours.toFixed(2)} hours) - clearing stale ride`);
          localStorage.removeItem('activeRide');
          localStorage.removeItem('bookedCycle');
          this.activeRide = null;
          return;
        }

        // Calculate duration in seconds first for accurate fare calculation
        const durationInSeconds = Math.floor(diffMs / 1000);
        const currentDuration = Math.floor(durationInSeconds / 60);
        // Calculate fare using precise seconds-to-minutes conversion
        const durationInMinutes = durationInSeconds / 60;
        const originalFare = Math.round(durationInMinutes * cyclePrice * 100) / 100;
        
        // Apply discount if coupon was applied
        const discountPercent = rideData.discountPercent || 0;
        let currentFare = originalFare;
        let discount = 0;
        if (discountPercent > 0) {
          discount = Math.round((originalFare * discountPercent / 100) * 100) / 100;
          currentFare = Math.round((originalFare - discount) * 100) / 100;
        }

        this.activeRide = {
          cycle: validCycle,
          startTime: startTime,
          duration: currentDuration,
          fare: currentFare,
          originalFare: originalFare,
          discount: discount,
          discountPercent: discountPercent,
          couponId: rideData.couponId,
          couponTitle: rideData.couponTitle
        };

        // Save the updated values immediately
        const rideToSave = {
          cycle: this.activeRide.cycle,
          startTime: startTime.toISOString(),
          duration: currentDuration,
          fare: currentFare,
          originalFare: originalFare,
          discount: discount,
          discountPercent: discountPercent,
          couponId: this.activeRide.couponId,
          couponTitle: this.activeRide.couponTitle
        };
        localStorage.setItem('activeRide', JSON.stringify(rideToSave));

        // Immediately update timer and fare to show current values
        this.updateRideTime();
        // Resume duration calculation - update every second for real-time display
        this.rideInterval = setInterval(() => {
          this.updateRideTime();
        }, 1000);
      } catch (error) {
        console.error('Error loading active ride:', error);
        localStorage.removeItem('activeRide');
        this.activeRide = null;
      }
    } else {
      this.activeRide = null;
    }
  }

  updateRideTime() {
    if (!this.activeRide || !this.activeRide.cycle) {
      console.warn('No active ride or cycle data available');
      this.clearActiveRide();
      return;
    }

    // Validate cycle data is still valid
    if (!this.activeRide.cycle.title || !this.activeRide.cycle.price) {
      console.warn('Invalid cycle data - clearing active ride');
      this.clearActiveRide();
      return;
    }

    // Validate price is valid number greater than 0
    const cyclePrice = parseFloat(this.activeRide.cycle.price.toString());
    if (isNaN(cyclePrice) || cyclePrice <= 0) {
      console.warn('Invalid cycle price - clearing active ride');
      this.clearActiveRide();
      return;
    }

    try {
      const now = new Date();
      const diffMs = now.getTime() - this.activeRide.startTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Safety check: Clear ride if it's older than 24 hours (truly stale)
      // This prevents rides from running indefinitely, but allows normal ride durations
      if (diffHours > 24) {
        console.log(`Ride duration exceeds 24 hours (${diffHours.toFixed(2)} hours) - auto-clearing`);
        this.clearActiveRide();
        return;
      }
      // Only update if time has passed (prevent negative durations)
      if (diffMs >= 0) {
        // Calculate duration in seconds for more accurate fare calculation
        const durationInSeconds = Math.floor(diffMs / 1000);
        // Store duration in minutes for display (rounded down)
        const newDuration = Math.floor(durationInSeconds / 60);
        // Calculate fare: price per minute, so convert seconds to minutes for accurate calculation
        const durationInMinutes = durationInSeconds / 60;
        const originalFare = Math.round(durationInMinutes * cyclePrice * 100) / 100;
        // Apply discount if coupon is applied
        let newFare = originalFare;
        let discount = 0;
        if (this.activeRide.discountPercent && this.activeRide.discountPercent > 0) {
          discount = Math.round((originalFare * this.activeRide.discountPercent / 100) * 100) / 100;
          newFare = Math.round((originalFare - discount) * 100) / 100;
        }
        // Only update if values have changed to avoid unnecessary updates
        if (this.activeRide.duration !== newDuration || this.activeRide.fare !== newFare || this.activeRide.originalFare !== originalFare) {
          this.activeRide.duration = newDuration;
          this.activeRide.originalFare = originalFare;
          this.activeRide.fare = newFare;
          this.activeRide.discount = discount;
          // Manually trigger change detection since setInterval runs outside Angular zone
          this.cdr.detectChanges();
          // Debug log (remove in production)
          console.log('Ride Update:', {
            cycle: this.activeRide.cycle.title,
            duration: newDuration,
            originalFare: originalFare,
            discount: discount,
            fare: newFare,
            discountPercent: this.activeRide.discountPercent
          });
        }
        // Save to localStorage every 5 seconds to reduce writes but keep it updated
        if (durationInSeconds % 5 === 0) {
          const rideToSave = {
            cycle: this.activeRide.cycle,
            startTime: this.activeRide.startTime.toISOString(),
            duration: this.activeRide.duration,
            fare: this.activeRide.fare,
            originalFare: this.activeRide.originalFare || 0,
            discount: this.activeRide.discount || 0,
            discountPercent: this.activeRide.discountPercent || 0,
            couponId: this.activeRide.couponId,
            couponTitle: this.activeRide.couponTitle
          };
          localStorage.setItem('activeRide', JSON.stringify(rideToSave));
        }
      } else {
        // If time is negative (shouldn't happen), clear the ride
        console.warn('Negative duration detected, clearing active ride');
        this.clearActiveRide();
      }
    } catch (error) {
      console.error('Error updating ride time:', error);
    }
  }

  clearActiveRide() {
    if (this.rideInterval) {
      clearInterval(this.rideInterval);
      this.rideInterval = null;
    }
    this.activeRide = null;
    // Clear all ride-related data from localStorage
    localStorage.removeItem('activeRide');
    localStorage.removeItem('bookedCycle');
    localStorage.removeItem('rideEnded'); // Clear the ended flag if it exists
    // Force change detection to update UI
    this.cdr.detectChanges();
  }

  async doRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  async reloadCycles() {
    try {
      // Prevent multiple clicks during reload or cooldown
      if (this.isReloading) {
        return;
      }

      this.isReloading = true;
      this.showReloadAnimation = true;
      // Use random skip to get different products (0-90 to get different sets)
      const randomSkip = Math.floor(Math.random() * 90);
      this.fetchCycles(randomSkip).subscribe({
        next: (newCycles) => {
          if (newCycles.length > 0) {
            this.cycles = newCycles;
            this.filteredCycles = newCycles;
            this.updateMapMarkers();
            this.showToast('New cycles loaded!', 'success');
          } else {
            this.showToast('No new cycles available', 'warning');
          }
          // Hide loading animation after 1 second, but keep button disabled for 3.5 seconds cooldown
          setTimeout(() => {
            this.showReloadAnimation = false;
            // Keep button disabled for additional 3.5 seconds (cooldown period)
            setTimeout(() => {
              this.isReloading = false;
            }, 3500); // 3.5 seconds cooldown after loading animation
          }, 1000); // Keep loading animation for 1 second after data loads
        },
        error: (error) => {
          console.error('Error reloading cycles:', error);
          this.showToast('Failed to load new cycles', 'danger');
          // On error, still add cooldown
          setTimeout(() => {
            this.showReloadAnimation = false;
            setTimeout(() => {
              this.isReloading = false;
            }, 3500);
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Error in reloadCycles:', error);
      this.showToast('Failed to reload cycles', 'danger');
      setTimeout(() => {
        this.showReloadAnimation = false;
        setTimeout(() => {
          this.isReloading = false;
        }, 3500);
      }, 1000);
    }
  }

  locateNearestCycle() {
    if (this.map && this.markers.length > 0) {
      const bounds = L.latLngBounds(this.markers.map(m => m.getLatLng()));
      this.map.fitBounds(bounds, { padding: [50, 50] });
      this.showToast('Showing nearest cycles', 'success');
    }
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

  formatDuration(minutes: number): string {
    // Always get real-time duration from active ride for accurate display
    if (!this.activeRide) {
      return '0s';
    }
    try {
      const now = new Date();
      const diffMs = now.getTime() - this.activeRide.startTime.getTime();
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000)); // Ensure non-negative
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      // Format with hours if more than an hour
      if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
      }
      // Format with minutes and seconds if more than a minute
      else if (mins > 0) {
        return `${mins}m ${secs}s`;
      }
      // Show just seconds if less than a minute
      else {
        return `${secs}s`;
      }
    } catch (error) {
      console.error('Error formatting duration:', error);
      // Fallback: format from minutes parameter
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hrs > 0) {
        return `${hrs}h ${mins}m`;
      }
      return mins > 0 ? `${mins}m` : '0s';
    }
  }

  getCurrentFare(): number {
    if (!this.activeRide) {
      return 0;
    }
    return this.activeRide.fare || 0;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterCycles();
  }

  filterCycles() {
    let filtered = [...this.cycles];
    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(cycle => cycle.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    // Category filter
    if (this.selectedFilter === 'nearby') {
      filtered = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (this.selectedFilter === 'battery') {
      filtered = filtered.sort((a, b) => (b.battery || 0) - (a.battery || 0));
    } else if (this.selectedFilter === 'price') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (this.selectedFilter === 'favorites') {
      filtered = filtered.filter(cycle => this.favoriteCycles.has(cycle.id));
    }
    this.filteredCycles = filtered;
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.filterCycles();
  }

  toggleFavorite(cycleId: number) {
    if (this.favoriteCycles.has(cycleId)) {
      this.favoriteCycles.delete(cycleId);
    } else {
      this.favoriteCycles.add(cycleId);
    }
    localStorage.setItem('favorites', JSON.stringify(Array.from(this.favoriteCycles)));
    this.filterCycles();
  }

  isFavorite(cycleId: number): boolean {
    return this.favoriteCycles.has(cycleId);
  }

  loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        this.favoriteCycles = new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }

  loadStats() {
    // Get current user email to load user-specific stats
    const userData = localStorage.getItem('userData');
    let userEmail = 'default';
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email || 'default';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    const statsKey = `userStats_${userEmail}`;
    const saved = localStorage.getItem(statsKey);
    if (saved) {
      try {
        const stats = JSON.parse(saved);
        this.totalRides = stats.totalRides || 0;
        this.totalDistance = stats.totalDistance || 0;
        this.totalSaved = stats.totalSaved || 0;
        this.carbonSaved = stats.carbonSaved || 0;
        // Also save to legacy key for backward compatibility
        localStorage.setItem('userStats', JSON.stringify(stats));
      } catch (e) {
        console.error('Error loading stats:', e);
        this.initializeDefaultStats(userEmail);
      }
    } else {
      // Check legacy key for backward compatibility
      const legacyStats = localStorage.getItem('userStats');
      if (legacyStats) {
        try {
          const stats = JSON.parse(legacyStats);
          this.totalRides = stats.totalRides || 0;
          this.totalDistance = stats.totalDistance || 0;
          this.totalSaved = stats.totalSaved || 0;
          this.carbonSaved = stats.carbonSaved || 0;
          // Migrate to user-specific key
          localStorage.setItem(statsKey, legacyStats);
        } catch (e) {
          this.initializeDefaultStats(userEmail);
        }
      } else {
        this.initializeDefaultStats(userEmail);
      }
    }
  }

  initializeDefaultStats(userEmail: string) {
    // Default mock stats for new users
    const defaultStats = {
      totalRides: 24,
      totalDistance: 156.8,
      totalSaved: 45.50,
      carbonSaved: 12.3
    };
    this.totalRides = defaultStats.totalRides;
    this.totalDistance = defaultStats.totalDistance;
    this.totalSaved = defaultStats.totalSaved;
    this.carbonSaved = defaultStats.carbonSaved;
    // Save to both user-specific and legacy keys
    const statsKey = `userStats_${userEmail}`;
    localStorage.setItem(statsKey, JSON.stringify(defaultStats));
    localStorage.setItem('userStats', JSON.stringify(defaultStats));
  }

  saveStats() {
    // Get current user email to save user-specific stats
    const userData = localStorage.getItem('userData');
    let userEmail = 'default';
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email || 'default';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    const stats = {
      totalRides: this.totalRides,
      totalDistance: this.totalDistance,
      totalSaved: this.totalSaved,
      carbonSaved: this.carbonSaved
    };
    const statsKey = `userStats_${userEmail}`;
    localStorage.setItem(statsKey, JSON.stringify(stats));
    localStorage.setItem('userStats', JSON.stringify(stats));
  }

  loadWeather() {
    const saved = localStorage.getItem('selectedWeatherLocation');
    if (saved) {
      try {
        const savedLocation = JSON.parse(saved);
        this.weather = {
          temp: savedLocation.temp,
          condition: savedLocation.condition,
          icon: savedLocation.icon
        };
        return;
      } catch (e) {
        console.error('Error loading saved weather:', e);
      }
    }

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      this.weather = { temp: 22, condition: 'sunny', icon: 'sunny-outline' };
    } else {
      this.weather = { temp: 18, condition: 'cloudy', icon: 'cloud-outline' };
    }
  }

  navigateToWeather() {
    this.router.navigate(['/weather']);
  }

  onQuickAction(action: string) {
    // Simple tap animation
    this.animatingAction = action;
    setTimeout(() => {
      this.animatingAction = null;
    }, 300);
    switch(action) {
      case 'Find Nearest':
        this.selectedFilter = 'nearby';
        this.filterCycles();
        this.showNearestMessage = true;
        // Hide message after 5 seconds
        setTimeout(() => {
          this.showNearestMessage = false;
        }, 5000);
        break;
      case 'Filter':
        this.showFilterOptions();
        break;
      case 'Schedule':
        this.router.navigate(['/schedule']);
        break;
      case 'Stats':
        this.router.navigate(['/stats']);
        break;
    }
  }

  async showFilterOptions() {
    const alert = await this.alertController.create({
      header: 'Filter Cycles',
      message: 'Choose a filter option',
      buttons: [
        { text: 'All', handler: () => { this.selectedFilter = 'all'; this.filterCycles(); } },
        { text: 'Nearby', handler: () => { this.selectedFilter = 'nearby'; this.filterCycles(); } },
        { text: 'High Battery', handler: () => { this.selectedFilter = 'battery'; this.filterCycles(); } },
        { text: 'Low Price', handler: () => { this.selectedFilter = 'price'; this.filterCycles(); } },
        { text: 'Favorites', handler: () => { this.selectedFilter = 'favorites'; this.filterCycles(); } },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  shareCycle(cycle: Cycle) {
    this.showToast(`Sharing ${cycle.title}...`, 'primary');
    // In real app, use Web Share API
    if (navigator.share) {
      navigator.share({
        title: cycle.title,
        text: `Check out this cycle: ${cycle.title} for ₹${cycle.price}/min`,
        url: window.location.href
      }).catch(() => {});
    }
  }

  getBatteryColor(battery: number): string {
    if (battery >= 80) return 'success';
    if (battery >= 50) return 'warning';
    return 'danger';
  }

  getDistanceColor(distance: number): string {
    if (distance <= 0.5) return 'success';
    if (distance <= 1.0) return 'warning';
    return 'medium';
  }

  onNotificationClick() {
    this.router.navigate(['/notification']);
  }

  onProfileClick() {
    this.router.navigate(['/tabs/tab5']);
  }

  onMenuClick() {
    this.showToast('Menu feature coming soon!', 'primary');
    // In real app, open side menu
  }
  onSearchClick() {
    // Focus on search bar or navigate to search page
    const searchBar = document.querySelector('ion-searchbar');
    if (searchBar) {
      (searchBar as any).setFocus();
    }
  }

  navigateToDistanceStats() {
    this.router.navigate(['/distance']);
  }

  navigateToMyRides() {
    this.router.navigate(['/totalrides']);
  }

  navigateToSchedule() {
    this.router.navigate(['/schedule']);
  }

  animateTotalRides() {
    this.isTotalRidesAnimating = true;
    setTimeout(() => {
      this.isTotalRidesAnimating = false;
    }, 800);
  }

  animateDistance() {
    this.isDistanceAnimating = true;
    setTimeout(() => {
      this.isDistanceAnimating = false;
    }, 800);
  }

  viewCycleDetails(cycle: Cycle) {
    console.log('Navigating to cycle details:', cycle);
    this.router.navigate(['/cycle-details', cycle.id], {
      state: { cycle }
    }).then(
      (success) => console.log('Navigation successful:', success),
      (error) => console.error('Navigation error:', error)
    );
  }

  viewOfferDetails(offer: Offer) {
    console.log('Navigating to offer details:', offer);
    // Save offers to localStorage for offer details page
    localStorage.setItem('offers', JSON.stringify(this.offers));
    this.router.navigate(['/offer-details', offer.id], {
      state: { offer }
    }).then(
      (success) => console.log('Navigation to offer details successful:', success),
      (error) => console.error('Navigation error:', error)
    );
  }

  loadRecentActivity() {
    const savedTransactions = localStorage.getItem('walletTransactions');
    let transactions: any[] = [];

    if (savedTransactions) {
      try {
        transactions = JSON.parse(savedTransactions);
      } catch (e) {
        console.error('Error parsing wallet transactions:', e);
        this.recentActivities = [];
        return;
      }
    }

    // Get all completed transactions, prioritize cycle rentals
    const completedTransactions = transactions
      .filter(t => t.status === 'completed' && t.date)
      .sort((a, b) => {
        // Sort by date (most recent first)
        const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : (a.date?.getTime() || 0);
        const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : (b.date?.getTime() || 0);
        return dateB - dateA;
      })
      .slice(0, 3) // Get last 3 transactions
      .map(t => ({
        id: t.id,
        title: t.description?.includes('Cycle Rental') ? 'Ride Completed' : this.getActivityTitle(t),
        time: this.formatTimeAgo(t.date),
        amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
        icon: t.icon || this.getActivityIcon(t),
        color: t.description?.includes('Cycle Rental') ? 'success' : (t.type === 'credit' ? 'warning' : 'primary')
      }));
    this.recentActivities = completedTransactions;
  }

  getActivityTitle(transaction: any): string {
    if (transaction.description?.includes('Cycle Rental')) {
      return 'Ride Completed';
    }
    if (transaction.type === 'credit') {
      return 'Payment Received';
    }
    if (transaction.type === 'debit') {
      return 'Payment Made';
    }
    return 'Transaction';
  }

  getActivityIcon(transaction: any): string {
    if (transaction.description?.includes('Cycle Rental')) {
      return 'checkmark-circle-outline';
    }
    if (transaction.type === 'credit') {
      return 'wallet-outline';
    }
    if (transaction.type === 'debit') {
      return 'bicycle-outline';
    }
    return 'time-outline';
  }

  formatTimeAgo(date: Date | string): string {
    // Handle both Date objects and ISO strings
    const dateObj = date instanceof Date ? date : new Date(date);
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Recently';
    }
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    // Handle future dates (shouldn't happen, but safety check)
    if (diffMs < 0) {
      return 'Just now';
    }
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.log('Notification permission request failed:', error);
        }
      }
    }
  }

  async sendBookingNotification(cycleTitle: string) {
    // Add notification to the list
    this.addNotificationToList(cycleTitle);
    // Show in-app notification banner
    this.bookingNotificationMessage = `Your booking for ${cycleTitle} has been confirmed. Enjoy your ride!`;
    this.showBookingNotification = true;
    this.cdr.detectChanges();
    // Auto-dismiss banner after 5 seconds
    setTimeout(() => {
      this.dismissBookingNotification();
    }, 5000);
    // Send browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('Booking Confirmed', {
          body: `Your booking for ${cycleTitle} has been confirmed. Enjoy your ride!`,
          icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          badge: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          tag: 'booking-confirmed',
          requireInteraction: false
        });
        // Auto close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
        // Handle notification click
        notification.onclick = () => {
          window.focus();
          this.router.navigate(['/notification']);
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else if ('Notification' in window && Notification.permission === 'default') {
      // Request permission if not yet requested
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          this.sendBookingNotification(cycleTitle); // Retry after permission granted
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  dismissBookingNotification() {
    this.showBookingNotification = false;
    this.bookingNotificationMessage = '';
    this.cdr.detectChanges();
  }

  addNotificationToList(cycleTitle: string) {
    // Load existing notifications
    const savedNotifications = localStorage.getItem('notifications');
    let notifications: any[] = [];
    if (savedNotifications) {
      try {
        notifications = JSON.parse(savedNotifications);
      } catch (e) {
        console.error('Error parsing notifications:', e);
        notifications = [];
      }
    }
    // Create new booking notification
    const newNotification = {
      id: `booking-${Date.now()}`,
      type: 'ride' as const,
      title: 'Booking Confirmed',
      message: `Your booking for ${cycleTitle} has been confirmed. Your ride is ready to start!`,
      time: 'Just now',
      isRead: false,
      icon: 'checkmark-circle-outline',
      color: 'success',
      action: 'View Ride',
      timestamp: new Date().toISOString()
    };
    // Add to beginning of array (most recent first)
    notifications.unshift(newNotification);
    // Keep only last 100 notifications
    notifications = notifications.slice(0, 100);
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
    // Update notification count
    this.updateNotificationCount();
  }

  updateNotificationCount() {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications);
        // Count unread notifications
        this.notificationCount = notifications.filter((n: any) => !n.isRead).length;
      } catch (e) {
        console.error('Error parsing notifications for count:', e);
        this.notificationCount = 0;
      }
    } else {
      this.notificationCount = 0;
    }
    // Force change detection to update UI
    this.cdr.detectChanges();
  }
}
