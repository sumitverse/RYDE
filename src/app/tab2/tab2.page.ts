import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonChip,
  IonBadge,
  IonItem,
  IonLabel,
  LoadingController,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/header/header.component';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  personCircleOutline,
  bicycleOutline,
  navigateOutline,
  locateOutline,
  refreshOutline,
  searchOutline,
  filterOutline,
  flashOutline,
  timeOutline,
  closeOutline,
  checkmarkCircleOutline,
  mapOutline,
  pinOutline,
  compassOutline,
  walletOutline,
  listOutline,
  schoolOutline
} from 'ionicons/icons';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonChip,
    IonBadge,
    IonItem,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab2Page implements OnInit, AfterViewInit, OnDestroy, ViewWillEnter {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // User data
  userName: string = 'User';
  userAvatar: string = '';
  loggedInUserName: string = '';
  notificationCount: number = 6;

  // Map data
  cycles: Cycle[] = [];
  filteredCycles: Cycle[] = [];
  map: any = null;
  markers: any[] = [];
  userMarker: any = null;
  selectedCycle: Cycle | null = null;
  routePolyline: any = null; // Store the route line
  isRouteLoading: boolean = false; // Loading state for route

  // LPU Campus coordinates (Phagwara, Punjab, India)
  lpuCampus = {
    lat: 31.2544,
    lng: 75.7053,
    zoom: 16
  };

  // Loading states
  isLoading: boolean = true;
  isMapLoading: boolean = true;

  // Filter states
  selectedFilter: string = 'all';
  showFilters: boolean = false;

  // Map controls
  showCycleList: boolean = false;

  // Location state
  private locationWatchId: number | null = null;
  private userLocation: { lat: number; lng: number } | null = null;
  private isLocationAvailable: boolean = false;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({
      locationOutline,
      personCircleOutline,
      bicycleOutline,
      navigateOutline,
      locateOutline,
      refreshOutline,
      searchOutline,
      filterOutline,
      flashOutline,
      timeOutline,
      closeOutline,
      checkmarkCircleOutline,
      mapOutline,
      pinOutline,
      compassOutline,
      walletOutline,
      listOutline,
      schoolOutline
    });
  }

  ngOnInit() {
    this.loadUserFromStorage();
    this.loadCycles();
  }

  ionViewWillEnter() {
    this.loadUserFromStorage();
    if (this.map) {
      this.updateMapMarkers();
    }
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
      this.isMapLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }
    this.clearRoute();
    if (this.map) {
      this.map.remove();
    }
  }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.loggedInUserName = userData.name || 'User';
        this.userName = this.loggedInUserName;
        if (userData.photo || userData.avatar) {
          this.userAvatar = userData.photo || userData.avatar;
        } else if (this.loggedInUserName && this.loggedInUserName !== 'User') {
          this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.loggedInUserName) + '&background=10B981&color=fff';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.loggedInUserName = 'User';
        this.userName = 'User';
      }
    } else {
      this.loggedInUserName = 'User';
      this.userName = 'User';
    }
  }

  initMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement || !L) {
      console.warn('Map container or Leaflet not available');
      this.isMapLoading = false;
      return;
    }

    // Initialize map centered on LPU Campus
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.lpuCampus.lat, this.lpuCampus.lng],
      zoom: this.lpuCampus.zoom,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | LPU Campus',
      maxZoom: 19
    }).addTo(this.map);

    // Add custom LPU marker
    const lpuIcon = L.divIcon({
      className: 'lpu-marker',
      html: '<div class="lpu-marker-content"><ion-icon name="school-outline"></ion-icon></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    L.marker([this.lpuCampus.lat, this.lpuCampus.lng], {
      icon: lpuIcon
    }).addTo(this.map).bindPopup('<strong>Lovely Professional University</strong><br>Phagwara, Punjab');

    // Wait for map to be fully ready before requesting location
    this.map.whenReady(() => {
      // Get user location after map is ready
      this.getCurrentLocation();
    });

    // Update markers when cycles are loaded
    if (this.cycles.length > 0) {
      this.updateMapMarkers();
    }

    this.isMapLoading = false;
  }

  getCurrentLocation() {
    this.requestLocation(false);
  }

  private requestLocation(showErrorToast: boolean = true, callback?: () => void) {
    if (!navigator.geolocation) {
      if (showErrorToast) {
        this.showToast('Geolocation is not supported by your browser', 'warning');
      }
      this.isLocationAvailable = false;
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: showErrorToast ? 15000 : 10000, // Longer timeout when user explicitly requests
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        this.userLocation = { lat: userLat, lng: userLng };
        this.isLocationAvailable = true;

        // Add or update user location marker
        if (this.userMarker && this.map) {
          this.map.removeLayer(this.userMarker);
        }

        if (this.map && L) {
          try {
            // Try to create a custom blue marker icon
            const customIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            this.userMarker = L.marker([userLat, userLng], {
              icon: customIcon
            }).addTo(this.map).bindPopup('Your Location');
          } catch (error) {
            // Fallback to default Leaflet marker if custom icon fails
            console.warn('Custom marker icon failed, using default:', error);
            this.userMarker = L.marker([userLat, userLng])
              .addTo(this.map)
              .bindPopup('Your Location');
          }
          
          // Ensure marker is visible by bringing it to front
          if (this.userMarker) {
            this.userMarker.bringToFront();
            // Invalidate map size to ensure marker is visible
            setTimeout(() => {
              if (this.map) {
                this.map.invalidateSize();
              }
            }, 100);
          }
        }

        // Start watching position for updates
        if (this.locationWatchId !== null) {
          navigator.geolocation.clearWatch(this.locationWatchId);
        }

        this.locationWatchId = navigator.geolocation.watchPosition(
          (updatedPosition) => {
            if (this.userMarker && this.map) {
              const updatedLat = updatedPosition.coords.latitude;
              const updatedLng = updatedPosition.coords.longitude;
              this.userLocation = { lat: updatedLat, lng: updatedLng };
              this.userMarker.setLatLng([updatedLat, updatedLng]);
            }
          },
          (error) => {
            console.error('Watch position error:', error);
          },
          options
        );

        // Execute callback if provided
        if (callback) {
          callback();
        }
      },
      (error) => {
        this.isLocationAvailable = false;
        this.userLocation = null;
        let errorMessage = 'Location not available';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your GPS settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please try again.';
            break;
        }
        
        console.error('Geolocation error:', error);
        if (showErrorToast) {
          this.showToast(errorMessage, 'warning');
        }
      },
      options
    );
  }

  loadCycles() {
    this.isLoading = true;
    this.fetchCycles(0).subscribe({
      next: (cycles) => {
        this.cycles = cycles;
        this.filteredCycles = cycles;
        this.isLoading = false;
        if (this.map) {
          this.updateMapMarkers();
        }
      },
      error: (error) => {
        console.error('Error loading cycles:', error);
        this.isLoading = false;
        this.showToast('Failed to load cycles. Please try again.', 'danger');
      }
    });
  }

  // Array of different cycle images
  private cycleImages: string[] = [
    'https://tse2.mm.bing.net/th/id/OIP.OXYP8HZtkg0rlEuMKx5jQQAAAA?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://purepng.com/public/uploads/large/purepng.com-bicyclebicyclesbicyclebikecyclehuman-poweredpedal-drivensingle-track-vehicletwo-wheels-1701528100067orlz0.png',
    'https://tse2.mm.bing.net/th/id/OIP.E2x72Mmy1YPbsdIqg4gUFAHaF6?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://rukminim1.flixcart.com/image/612/612/kdyus280/cycle/e/y/b/storm-nv-17-hercules-single-speed-original-imafurfymcvb5yrm.jpeg?q=70',
    'https://rukminim1.flixcart.com/image/1664/1664/cycle/k/s/k/na-atlas-l-super-strong-original-imaegg8rgggrccfy.jpeg?q=90'
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
    'Bianchi Sprint'
  ];

  // LPU Campus locations
  private lpuLocations = [
    { name: 'Block 32 - Engineering', lat: 31.2550, lng: 75.7060 },
    { name: 'Block 28 - Management', lat: 31.2540, lng: 75.7045 },
    { name: 'Block 34 - Library', lat: 31.2560, lng: 75.7070 },
    { name: 'Block 13 - Hostel Area', lat: 31.2530, lng: 75.7030 },
    { name: 'Block 38 - Sports Complex', lat: 31.2570, lng: 75.7080 },
    { name: 'Block 26 - Cafeteria', lat: 31.2535, lng: 75.7050 },
    { name: 'Block 30 - Science Block', lat: 31.2555, lng: 75.7065 },
    { name: 'Block 29 - Admin Building', lat: 31.2545, lng: 75.7055 }
  ];

  fetchCycles(skip: number = 0): Observable<Cycle[]> {
    const conditions = ['Excellent', 'Good', 'Fair', 'Very Good'];

    return this.http.get<{ products: any[] }>(`https://dummyjson.com/products?limit=8&skip=${skip}`).pipe(
      map(response => {
        const cycles = response.products.map((product, index) => {
          const cycleId = product.id;
          const nameIndex = (cycleId + skip + index) % this.cycleNames.length;
          const locationIndex = (cycleId + skip + index) % this.lpuLocations.length;
          const conditionIndex = (cycleId + skip + index) % conditions.length;
          const location = this.lpuLocations[locationIndex];

          // Calculate distance from campus center
          const distance = this.calculateDistance(
            this.lpuCampus.lat,
            this.lpuCampus.lng,
            location.lat,
            location.lng
          );

          return {
            id: cycleId,
            title: this.cycleNames[nameIndex],
            price: Math.floor(Math.random() * 4) + 1, // 1-5 INR per minute
            thumbnail: this.cycleImages[index % this.cycleImages.length],
            battery: Math.floor(Math.random() * 40) + 60,
            distance: Math.round(distance * 10) / 10,
            condition: conditions[conditionIndex],
            location: location.name,
            lat: location.lat + (Math.random() - 0.5) * 0.001, // Add slight variation
            lng: location.lng + (Math.random() - 0.5) * 0.001
          };
        });

        localStorage.setItem('cycles', JSON.stringify(cycles));
        return cycles;
      }),
      catchError(error => {
        console.error('Error fetching cycles:', error);
        return of([]);
      })
    );
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  updateMapMarkers() {
    if (!this.map || this.cycles.length === 0) return;

    // Clear existing cycle markers
    this.markers.forEach(marker => this.map?.removeLayer(marker));
    this.markers = [];

    // Clear route when markers are updated
    this.clearRoute();

    // Add markers for available cycles
    this.filteredCycles.forEach((cycle) => {
      if (cycle.lat && cycle.lng) {
        const cycleIcon = L.divIcon({
          className: 'cycle-marker',
          html: `
            <div class="cycle-marker-content">
              <ion-icon name="bicycle-outline"></ion-icon>
              <div class="cycle-marker-badge">${cycle.battery || 0}%</div>
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        });

        const marker = L.marker([cycle.lat, cycle.lng], {
          icon: cycleIcon
        }).addTo(this.map!);

        const popupContent = `
          <div class="cycle-popup">
            <img src="${cycle.thumbnail}" alt="${cycle.title}" class="popup-image" />
            <div class="popup-content">
              <h3>${cycle.title}</h3>
              <p><strong>₹${cycle.price}/min</strong></p>
              <p>📍 ${cycle.location}</p>
              <p>🔋 Battery: ${cycle.battery}%</p>
              <p>📏 ${cycle.distance} km away</p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          this.selectCycle(cycle);
        });

        this.markers.push(marker);
      }
    });
  }

  centerOnCampus() {
    if (this.map) {
      this.map.setView([this.lpuCampus.lat, this.lpuCampus.lng], this.lpuCampus.zoom);
      this.showToast('Centered on LPU Campus', 'success');
    }
  }

  centerOnUser() {
    if (this.userLocation && this.map) {
      // User location is available, center on it
      // Ensure marker exists
      if (!this.userMarker && L && this.map) {
        try {
          const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
            icon: customIcon
          }).addTo(this.map).bindPopup('Your Location');
        } catch (error) {
          console.warn('Custom marker icon failed, using default:', error);
          this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng])
            .addTo(this.map)
            .bindPopup('Your Location');
        }
        
        if (this.userMarker) {
          this.userMarker.bringToFront();
          // Invalidate map size to ensure marker is visible
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 100);
        }
      }
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
      this.showToast('Centered on your location', 'success');
    } else {
      // Location not available, try to get it
      this.showToast('Getting your location...', 'primary');
      this.requestLocation(true, () => {
        // Callback executed after location is retrieved
        if (this.userLocation && this.map && this.userMarker) {
          this.userMarker.bringToFront();
          this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
          // Invalidate map size to ensure marker is visible
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 100);
          this.showToast('Centered on your location', 'success');
        }
      });
    }
  }

  refreshCycles() {
    this.loadCycles();
    this.showToast('Refreshing cycles...', 'primary');
  }

  filterCycles(filter: string) {
    this.selectedFilter = filter;
    let filtered = [...this.cycles];

    switch (filter) {
      case 'nearby':
        filtered = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'battery':
        filtered = filtered.sort((a, b) => (b.battery || 0) - (a.battery || 0));
        break;
      case 'price':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    this.filteredCycles = filtered;
    // Clear route when filtering
    this.clearRoute();
    this.selectedCycle = null;
    this.updateMapMarkers();
  }

  selectCycle(cycle: Cycle) {
    this.selectedCycle = cycle;
    this.showCycleList = true;
    if (this.map && cycle.lat && cycle.lng) {
      this.map.setView([cycle.lat, cycle.lng], 18);
      
      // Draw route from user location to cycle
      this.drawRouteToCycle(cycle);
      
      // Open popup for the selected cycle marker
      setTimeout(() => {
        const marker = this.markers.find(m => {
          const latlng = m.getLatLng();
          return Math.abs(latlng.lat - cycle.lat!) < 0.0001 && Math.abs(latlng.lng - cycle.lng!) < 0.0001;
        });
        if (marker) {
          marker.openPopup();
        }
      }, 300);
    }
  }

  drawRouteToCycle(cycle: Cycle) {
    if (!this.map || !L || !cycle.lat || !cycle.lng) return;

    // Remove existing route if any
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }

    // Check if user location is available
    if (!this.userLocation) {
      // If user location not available, try to get it
      this.requestLocation(false, () => {
        if (this.userLocation) {
          this.createRoute(this.userLocation.lat, this.userLocation.lng, cycle.lat!, cycle.lng!);
        }
      });
      return;
    }

    // Create route from user location to cycle
    this.createRoute(this.userLocation.lat, this.userLocation.lng, cycle.lat!, cycle.lng!);
  }

  createRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    if (!this.map || !L) return;

    this.isRouteLoading = true;
    this.showToast('Calculating route...', 'primary');

    // Use OSRM (Open Source Routing Machine) for free routing
    // Format: /route/v1/{profile}/{coordinates}?overview=full&geometries=geojson
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=false`;

    this.http.get<any>(osrmUrl).subscribe({
      next: (response) => {
        this.isRouteLoading = false;
        
        if (response.code === 'Ok' && response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          const geometry = route.geometry;
          
          // Decode polyline (OSRM returns encoded polyline)
          // For GeoJSON format, coordinates are already decoded
          let routeCoordinates: [number, number][] = [];
          
          if (geometry.type === 'LineString' && geometry.coordinates) {
            // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
            routeCoordinates = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          } else {
            // Fallback: use straight line if decoding fails
            routeCoordinates = [[startLat, startLng], [endLat, endLng]];
          }

          // Create polyline with route styling
          this.routePolyline = L.polyline(routeCoordinates, {
            color: '#10B981',
            weight: 6,
            opacity: 0.9,
            smoothFactor: 1
          }).addTo(this.map);

          // Get route distance and duration from OSRM response
          const distance = route.distance / 1000; // Convert meters to kilometers
          const duration = Math.round(route.duration / 60); // Convert seconds to minutes

          // Add distance and duration marker in the middle of the route
          const midIndex = Math.floor(routeCoordinates.length / 2);
          const midPoint = routeCoordinates[midIndex];
          
          const distanceMarker = L.marker(midPoint, {
            icon: L.divIcon({
              className: 'route-distance-marker',
              html: `<div class="route-distance-badge">
                <div>${distance.toFixed(2)} km</div>
                <div style="font-size: 0.7em; opacity: 0.9;">${duration} min</div>
              </div>`,
              iconSize: [90, 50],
              iconAnchor: [45, 25]
            })
          }).addTo(this.map);

          // Store distance marker to remove later
          this.routePolyline._distanceMarker = distanceMarker;

          // Fit map to show the entire route with padding
          const bounds = this.routePolyline.getBounds();
          this.map.fitBounds(bounds, { padding: [50, 50] });

          this.showToast('Route calculated successfully', 'success');
        } else {
          // Fallback to straight line if routing fails
          this.createFallbackRoute(startLat, startLng, endLat, endLng);
        }
      },
      error: (error) => {
        console.error('Error fetching route:', error);
        this.isRouteLoading = false;
        // Fallback to straight line if API fails
        this.createFallbackRoute(startLat, startLng, endLat, endLng);
        this.showToast('Using direct route (routing service unavailable)', 'warning');
      }
    });
  }

  createFallbackRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    if (!this.map || !L) return;

    // Create a simple straight line route as fallback
    const routeCoordinates: [number, number][] = [
      [startLat, startLng],
      [endLat, endLng]
    ];

    this.routePolyline = L.polyline(routeCoordinates, {
      color: '#10B981',
      weight: 5,
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(this.map);

    // Calculate and display distance
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    
    // Add distance marker in the middle of the route
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;
    const distanceMarker = L.marker([midLat, midLng], {
      icon: L.divIcon({
        className: 'route-distance-marker',
        html: `<div class="route-distance-badge">${distance.toFixed(2)} km</div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      })
    }).addTo(this.map);

    this.routePolyline._distanceMarker = distanceMarker;

    // Fit map to show both points with padding
    const bounds = L.latLngBounds([[startLat, startLng], [endLat, endLng]]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  clearRoute() {
    if (this.routePolyline && this.map) {
      this.map.removeLayer(this.routePolyline);
      if (this.routePolyline._distanceMarker) {
        this.map.removeLayer(this.routePolyline._distanceMarker);
      }
      this.routePolyline = null;
    }
  }

  closeCycleList() {
    this.showCycleList = false;
    // Keep the route visible - don't clear selectedCycle or route
    // The route will remain on the map even when the list is closed
  }

  viewCycleDetails(cycle: Cycle) {
    this.router.navigate(['/cycle-details', cycle.id], {
      state: { cycle }
    });
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

  getBatteryColor(battery: number): string {
    if (battery >= 80) return 'success';
    if (battery >= 50) return 'warning';
    return 'danger';
  }
}

