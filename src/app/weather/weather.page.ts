import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  speedometerOutline
} from 'ionicons/icons';

interface WeatherLocation {
  name: string;
  temp: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
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

  constructor(
    private router: Router,
    private toastController: ToastController
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
      speedometerOutline
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
        this.savedLocation = JSON.parse(saved);
        this.selectedLocation = this.savedLocation;
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

    setTimeout(() => {
      const searchTerm = this.searchQuery.toLowerCase().trim();

      const found = this.popularLocations.find(loc =>
        loc.name.toLowerCase().includes(searchTerm)
      );

      if (found) {
        this.selectedLocation = { ...found };
      } else {
        const conditions = ['sunny', 'cloudy', 'rainy', 'partly-sunny'];
        const icons = ['sunny-outline', 'cloud-outline', 'rainy-outline', 'partly-sunny-outline'];
        const randomIndex = Math.floor(Math.random() * conditions.length);

        this.selectedLocation = {
          name: this.searchQuery,
          temp: Math.floor(Math.random() * 15) + 20,
          condition: conditions[randomIndex],
          icon: icons[randomIndex],
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 15) + 5
        };
      }

      this.isLoading = false;
      this.searchQuery = '';
    }, 1000);
  }

  selectLocation(location: WeatherLocation) {
    this.selectedLocation = { ...location };
  }

  saveLocation() {
    if (!this.selectedLocation) {
      this.showToast('Please select a location first', 'warning');
      return;
    }

    localStorage.setItem('selectedWeatherLocation', JSON.stringify(this.selectedLocation));
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
    switch (condition) {
      case 'sunny':
        return 'warning';
      case 'cloudy':
        return 'medium';
      case 'rainy':
        return 'primary';
      case 'partly-sunny':
        return 'tertiary';
      default:
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
