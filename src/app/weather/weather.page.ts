import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonSearchbar,
  IonChip,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  locationOutline,
  sunnyOutline,
  cloudOutline,
  rainyOutline,
  partlySunnyOutline,
  checkmarkCircleOutline,
  addOutline,
  pinOutline,
  waterOutline,
  speedometerOutline,
  flashOutline
} from 'ionicons/icons';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface WeatherLocation {
  name: string;
  temp: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.html',
  styleUrls: ['./weather.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonSearchbar,
    IonChip,
    IonSpinner
  ]
})
export class WeatherPage implements OnInit, ViewWillEnter {
  searchQuery: string = '';
  isLoading: boolean = false;
  selectedLocation: WeatherLocation | null = null;
  savedLocation: WeatherLocation | null = null;

  popularLocations: WeatherLocation[] = [
    { name: 'Mumbai', temp: 28, condition: 'sunny', icon: 'sunny-outline', humidity: 65, windSpeed: 12 },
    { name: 'Delhi', temp: 32, condition: 'partly-sunny', icon: 'partly-sunny-outline', humidity: 45, windSpeed: 15 },
    { name: 'Bangalore', temp: 24, condition: 'cloudy', icon: 'cloud-outline', humidity: 70, windSpeed: 10 },
    { name: 'Chennai', temp: 30, condition: 'sunny', icon: 'sunny-outline', humidity: 60, windSpeed: 14 },
    { name: 'Kolkata', temp: 29, condition: 'rainy', icon: 'rainy-outline', humidity: 75, windSpeed: 8 },
    { name: 'Hyderabad', temp: 27, condition: 'partly-sunny', icon: 'partly-sunny-outline', humidity: 55, windSpeed: 11 },
    { name: 'Pune', temp: 26, condition: 'cloudy', icon: 'cloud-outline', humidity: 68, windSpeed: 9 },
    { name: 'Jaipur', temp: 31, condition: 'sunny', icon: 'sunny-outline', humidity: 40, windSpeed: 16 }
  ];

  private apiKey = '77403a8034684bd5df80c41671156d52';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    addIcons({
      arrowBackOutline,
      searchOutline,
      locationOutline,
      sunnyOutline,
      cloudOutline,
      rainyOutline,
      partlySunnyOutline,
      checkmarkCircleOutline,
      addOutline,
      pinOutline,
      waterOutline,
      speedometerOutline,
      flashOutline
    });
  }

  ngOnInit() {
    this.loadSavedLocation();
  }

  ionViewWillEnter() {
    this.loadSavedLocation();
  }

  loadSavedLocation() {
    const saved = localStorage.getItem('selectedWeatherLocation');
    if (saved) {
      try {
        const parsedLocation = JSON.parse(saved) as WeatherLocation;
        this.savedLocation = parsedLocation;
        
        // If saved location has coordinates, fetch real-time data
        if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
          this.fetchWeatherByCoordinates(parsedLocation.lat, parsedLocation.lng, parsedLocation.name);
        } else if (parsedLocation && parsedLocation.name) {
          // If no coordinates but has name, fetch by city name
          this.fetchWeatherByCity(parsedLocation.name);
        } else if (parsedLocation) {
          // Use saved data as fallback
          this.selectedLocation = parsedLocation;
        }
      } catch (e) {
        console.error('Error loading saved location:', e);
      }
    }
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
  }

  searchLocation() {
    if (!this.searchQuery.trim()) {
      this.showToast('Please enter a location', 'warning');
      return;
    }

    this.isLoading = true;
    const searchQuery = this.searchQuery.trim();

    // First, try to find in popular locations
    const found = this.popularLocations.find(loc =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      // If found in popular locations, fetch real weather data
      this.fetchWeatherByCity(found.name);
    } else {
      // Search using OpenWeatherMap API by city name
      this.fetchWeatherByCity(searchQuery);
    }
  }

  fetchWeatherByCity(cityName: string) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
    
    this.http.get<any>(weatherUrl).pipe(
      catchError(error => {
        console.error('Error fetching weather data:', error);
        this.isLoading = false;
        this.showToast('Location not found. Please try a different city name.', 'danger');
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.parseWeatherData(data);
          this.isLoading = false;
          this.searchQuery = '';
        }
      }
    });
  }

  fetchWeatherByCoordinates(lat: number, lng: number, cityName: string) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
    
    this.http.get<any>(weatherUrl).pipe(
      catchError(error => {
        console.error('Error fetching weather data:', error);
        this.showToast('Unable to fetch weather data.', 'warning');
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          // Override city name with provided name
          if (cityName) {
            data.name = cityName;
          }
          this.parseWeatherData(data);
        }
      }
    });
  }

  parseWeatherData(data: any) {
    if (data && data.main && data.weather && data.weather.length > 0) {
      const temp = Math.round(data.main.temp);
      const humidity = data.main.humidity || 0;
      const windSpeed = data.wind?.speed ? Math.round(data.wind.speed * 3.6) : 0; // Convert m/s to km/h
      const weatherId = data.weather[0].id;
      const weatherMain = data.weather[0].main;
      const weatherDescription = data.weather[0].description;

      // Map weather ID to condition and icon
      const { condition, icon } = this.getWeatherCondition(weatherId, weatherMain);

      this.selectedLocation = {
        name: data.name || 'Unknown',
        temp: temp,
        condition: condition,
        icon: icon,
        humidity: humidity,
        windSpeed: windSpeed,
        lat: data.coord?.lat,
        lng: data.coord?.lon
      };
    }
  }

  getWeatherCondition(weatherId: number, weatherMain: string): { condition: string; icon: string } {
    // OpenWeatherMap weather ID mapping
    // Weather IDs: https://openweathermap.org/weather-conditions
    
    // Clear sky
    if (weatherId === 800) {
      return { condition: 'clear', icon: 'sunny-outline' };
    }
    // Clouds
    else if (weatherId === 801 || weatherId === 802) {
      return { condition: 'partly cloudy', icon: 'cloud-outline' };
    }
    else if (weatherId === 803 || weatherId === 804) {
      return { condition: 'cloudy', icon: 'cloud-outline' };
    }
    // Thunderstorm
    else if (weatherId >= 200 && weatherId < 300) {
      return { condition: 'thunderstorm', icon: 'flash-outline' };
    }
    // Drizzle
    else if (weatherId >= 300 && weatherId < 400) {
      return { condition: 'drizzle', icon: 'cloud-outline' };
    }
    // Rain
    else if (weatherId >= 500 && weatherId < 600) {
      if (weatherId === 500 || weatherId === 501) {
        return { condition: 'rainy', icon: 'flash-outline' };
      } else {
        return { condition: 'heavy rain', icon: 'flash-outline' };
      }
    }
    // Snow
    else if (weatherId >= 600 && weatherId < 700) {
      return { condition: 'snowy', icon: 'cloud-outline' };
    }
    // Atmosphere (mist, fog, etc.)
    else if (weatherId >= 700 && weatherId < 800) {
      return { condition: 'foggy', icon: 'cloud-outline' };
    }
    // Fallback based on main condition
    else {
      const mainLower = weatherMain.toLowerCase();
      if (mainLower.includes('clear')) {
        return { condition: 'clear', icon: 'sunny-outline' };
      } else if (mainLower.includes('cloud')) {
        return { condition: 'cloudy', icon: 'cloud-outline' };
      } else if (mainLower.includes('rain')) {
        return { condition: 'rainy', icon: 'flash-outline' };
      } else if (mainLower.includes('snow')) {
        return { condition: 'snowy', icon: 'cloud-outline' };
      } else if (mainLower.includes('thunderstorm')) {
        return { condition: 'thunderstorm', icon: 'flash-outline' };
      } else if (mainLower.includes('mist') || mainLower.includes('fog')) {
        return { condition: 'foggy', icon: 'cloud-outline' };
      } else {
        // Default to cloudy
        return { condition: 'cloudy', icon: 'cloud-outline' };
      }
    }
  }

  selectLocation(location: WeatherLocation) {
    // Fetch real-time weather data for the selected popular location
    this.isLoading = true;
    this.fetchWeatherByCity(location.name);
  }

  saveLocation() {
    if (!this.selectedLocation) {
      this.showToast('Please select a location first', 'warning');
      return;
    }

    // Save location with coordinates for future real-time data fetching
    const locationToSave = {
      ...this.selectedLocation,
      lat: this.selectedLocation.lat,
      lng: this.selectedLocation.lng
    };
    
    localStorage.setItem('selectedWeatherLocation', JSON.stringify(locationToSave));
    this.savedLocation = { ...this.selectedLocation };
    this.showToast(`${this.selectedLocation.name} set as default location!`, 'success');

    setTimeout(() => {
      this.router.navigate(['/tabs/tab1']);
    }, 1500);
  }

  getFilteredLocations(): WeatherLocation[] {
    if (!this.searchQuery.trim()) {
      return this.popularLocations;
    }

    const query = this.searchQuery.toLowerCase();
    return this.popularLocations.filter(loc =>
      loc.name.toLowerCase().includes(query)
    );
  }

  getConditionColor(condition: string): string {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return 'warning';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('cloud')) {
      return 'medium';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'primary';
    } else if (conditionLower.includes('thunderstorm')) {
      return 'danger';
    } else if (conditionLower.includes('snow')) {
      return 'tertiary';
    } else {
      return 'medium';
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

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}
