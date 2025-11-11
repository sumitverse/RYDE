import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonListHeader,
  IonToggle,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonButtons,
  ToastController,
  AlertController,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  notificationsOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  colorPaletteOutline,
  languageOutline,
  locationOutline,
  notificationsOffOutline,
  moonOutline,
  sunnyOutline,
  volumeHighOutline,
  mailOutline,
  callOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  logOutOutline,
  chevronBackOutline,
  settingsOutline,
  saveOutline,
  bicycleOutline,
  walletOutline,
  createOutline,
  chevronDownOutline,
  chevronForwardOutline
} from 'ionicons/icons';

interface SettingSection {
  title: string;
  icon: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  type: 'toggle' | 'input' | 'select' | 'button' | 'info';
  value?: any;
  placeholder?: string;
  options?: { label: string; value: any }[];
  icon?: string;
  description?: string;
  action?: () => void;
}

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonList,
    IonListHeader,
    IonToggle,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButtons,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  ]
})
export class SettingPage implements OnInit {
  userName: string = 'User';
  userEmail: string = 'user@ryde.com';
  userPhone: string = '+91 98765 43210';
  userAvatar: string = '';

  notificationsEnabled: boolean = true;
  pushNotifications: boolean = true;
  emailNotifications: boolean = true;
  smsNotifications: boolean = false;
  locationServices: boolean = true;
  darkMode: boolean = false;
  soundEnabled: boolean = true;
  language: string = 'en';
  distanceUnit: string = 'km';
  currency: string = 'INR';

  showPassword: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  settingsSections: SettingSection[] = [];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      personOutline,
      notificationsOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      colorPaletteOutline,
      languageOutline,
      locationOutline,
      notificationsOffOutline,
      moonOutline,
      sunnyOutline,
      volumeHighOutline,
      mailOutline,
      callOutline,
      keyOutline,
      eyeOutline,
      eyeOffOutline,
      checkmarkCircleOutline,
      informationCircleOutline,
      logOutOutline,
      chevronBackOutline,
      settingsOutline,
      saveOutline,
      bicycleOutline,
      walletOutline,
      createOutline,
      chevronDownOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadSettings();
    this.initializeSettings();
  }

  loadUserData() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.userName = userData.name || 'User';
        this.userEmail = userData.email || 'user@ryde.com';
        this.userPhone = userData.phone || '+91 98765 43210';
        if (userData.photo || userData.avatar) {
          this.userAvatar = userData.photo || userData.avatar;
        } else if (this.userName && this.userName !== 'User') {
          this.userAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=10B981&color=fff';
        } else {
          this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.notificationsEnabled = settings.notificationsEnabled ?? true;
        this.pushNotifications = settings.pushNotifications ?? true;
        this.emailNotifications = settings.emailNotifications ?? true;
        this.smsNotifications = settings.smsNotifications ?? false;
        this.locationServices = settings.locationServices ?? true;
        this.darkMode = settings.darkMode ?? false;
        this.soundEnabled = settings.soundEnabled ?? true;
        this.language = settings.language ?? 'en';
        this.distanceUnit = settings.distanceUnit ?? 'km';
        this.currency = settings.currency ?? 'INR';
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }

  saveSettings() {
    const settings = {
      notificationsEnabled: this.notificationsEnabled,
      pushNotifications: this.pushNotifications,
      emailNotifications: this.emailNotifications,
      smsNotifications: this.smsNotifications,
      locationServices: this.locationServices,
      darkMode: this.darkMode,
      soundEnabled: this.soundEnabled,
      language: this.language,
      distanceUnit: this.distanceUnit,
      currency: this.currency
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    this.showToast('Settings saved successfully!', 'success');
  }

  initializeSettings() {
    this.settingsSections = [
      {
        title: 'Account',
        icon: 'person-outline',
        items: [
          {
            id: 'name',
            label: 'Full Name',
            type: 'input',
            value: this.userName,
            placeholder: 'Enter your name',
            icon: 'person-outline'
          },
          {
            id: 'email',
            label: 'Email',
            type: 'input',
            value: this.userEmail,
            placeholder: 'Enter your email',
            icon: 'mail-outline'
          },
          {
            id: 'phone',
            label: 'Phone Number',
            type: 'input',
            value: this.userPhone,
            placeholder: 'Enter your phone',
            icon: 'call-outline'
          },
          {
            id: 'password',
            label: 'Change Password',
            type: 'button',
            icon: 'key-outline',
            action: () => this.changePassword()
          }
        ]
      },
      {
        title: 'Notifications',
        icon: 'notifications-outline',
        items: [
          {
            id: 'notifications',
            label: 'Enable Notifications',
            type: 'toggle',
            value: this.notificationsEnabled,
            description: 'Receive push notifications',
            icon: 'notifications-outline'
          },
          {
            id: 'push',
            label: 'Push Notifications',
            type: 'toggle',
            value: this.pushNotifications,
            description: 'Get notified about rides and updates',
            icon: 'notifications-outline'
          },
          {
            id: 'email',
            label: 'Email Notifications',
            type: 'toggle',
            value: this.emailNotifications,
            description: 'Receive updates via email',
            icon: 'mail-outline'
          },
          {
            id: 'sms',
            label: 'SMS Notifications',
            type: 'toggle',
            value: this.smsNotifications,
            description: 'Receive updates via SMS',
            icon: 'call-outline'
          }
        ]
      },
      {
        title: 'Privacy & Security',
        icon: 'shield-checkmark-outline',
        items: [
          {
            id: 'location',
            label: 'Location Services',
            type: 'toggle',
            value: this.locationServices,
            description: 'Allow app to access your location',
            icon: 'location-outline'
          }
        ]
      },
      {
        title: 'App Preferences',
        icon: 'color-palette-outline',
        items: [
          {
            id: 'sound',
            label: 'Sound Effects',
            type: 'toggle',
            value: this.soundEnabled,
            description: 'Enable app sound effects',
            icon: 'volume-high-outline'
          },
          {
            id: 'language',
            label: 'Language',
            type: 'select',
            value: this.language,
            options: [
              { label: 'English', value: 'en' },
              { label: 'Hindi', value: 'hi' }
            ],
            icon: 'language-outline'
          },
          {
            id: 'distance',
            label: 'Distance Unit',
            type: 'select',
            value: this.distanceUnit,
            options: [
              { label: 'Kilometers (km)', value: 'km' },
              { label: 'Miles (mi)', value: 'mi' }
            ],
            icon: 'bicycle-outline'
          },
          {
            id: 'currency',
            label: 'Currency',
            type: 'select',
            value: this.currency,
            options: [
              { label: 'Indian Rupee (₹)', value: 'INR' },
              { label: 'US Dollar ($)', value: 'USD' },
              { label: 'Euro (€)', value: 'EUR' }
            ],
            icon: 'wallet-outline'
          }
        ]
      }
    ];
  }

  onToggleChange(itemId: string, value: boolean) {
    switch (itemId) {
      case 'notifications':
        this.notificationsEnabled = value;
        if (!value) {
          this.pushNotifications = false;
          this.emailNotifications = false;
          this.smsNotifications = false;
        } else {
          this.pushNotifications = true;
        }
        break;
      case 'push':
        this.pushNotifications = value;
        if (value) {
          this.notificationsEnabled = true;
        }
        break;
      case 'email':
        this.emailNotifications = value;
        if (value) {
          this.notificationsEnabled = true;
        }
        break;
      case 'sms':
        this.smsNotifications = value;
        if (value) {
          this.notificationsEnabled = true;
        }
        break;
      case 'location':
        this.locationServices = value;
        break;
      case 'sound':
        this.soundEnabled = value;
        break;
    }
    this.updateSettingsSections();
    this.saveSettings();
  }

  updateSettingsSections() {
    this.settingsSections.forEach(section => {
      section.items.forEach(item => {
        if (item.type === 'toggle') {
          switch (item.id) {
            case 'notifications':
              item.value = this.notificationsEnabled;
              break;
            case 'push':
              item.value = this.pushNotifications;
              break;
            case 'email':
              item.value = this.emailNotifications;
              break;
            case 'sms':
              item.value = this.smsNotifications;
              break;
            case 'location':
              item.value = this.locationServices;
              break;
            case 'sound':
              item.value = this.soundEnabled;
              break;
          }
        } else if (item.type === 'select') {
          switch (item.id) {
            case 'language':
              item.value = this.language;
              break;
            case 'distance':
              item.value = this.distanceUnit;
              break;
            case 'currency':
              item.value = this.currency;
              break;
          }
        }
      });
    });
  }

  onInputChange(itemId: string, value: string) {
    switch (itemId) {
      case 'name':
        this.userName = value;
        // updateUserData will handle avatar update and localStorage save
        this.updateUserData('name', value);
        const nameItem = this.settingsSections.find(s => s.title === 'Account')?.items.find(i => i.id === 'name');
        if (nameItem) {
          nameItem.value = value;
        }
        break;
      case 'email':
        this.userEmail = value;
        this.updateUserData('email', value);
        const emailItem = this.settingsSections.find(s => s.title === 'Account')?.items.find(i => i.id === 'email');
        if (emailItem) {
          emailItem.value = value;
        }
        break;
      case 'phone':
        this.userPhone = value;
        this.updateUserData('phone', value);
        const phoneItem = this.settingsSections.find(s => s.title === 'Account')?.items.find(i => i.id === 'phone');
        if (phoneItem) {
          phoneItem.value = value;
        }
        break;
    }
  }

  onSelectChange(itemId: string, value: any) {
    switch (itemId) {
      case 'language':
        this.language = value;
        break;
      case 'distance':
        this.distanceUnit = value;
        break;
      case 'currency':
        this.currency = value;
        break;
    }
    this.updateSettingsSections();
    this.saveSettings();
  }

  updateUserData(key: string, value: string) {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        userData[key] = value;
        
        // If name changed and no custom photo exists, update avatar URL in userData
        // This ensures avatar is regenerated with new name
        if (key === 'name' && !userData.photo) {
          // Check if current avatar is a generated one (contains ui-avatars.com) or doesn't exist
          const isGeneratedAvatar = !userData.avatar || userData.avatar.includes('ui-avatars.com');
          if (isGeneratedAvatar) {
            userData.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(value) + '&background=10B981&color=fff';
            // Also update the local avatar property for immediate UI update
            this.userAvatar = userData.avatar;
          }
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        this.showToast('Profile updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating user data:', error);
        this.showToast('Error updating profile', 'danger');
      }
    } else {
      // If no userData exists, create it
      const newUserData: any = {};
      newUserData[key] = value;
      if (key === 'name') {
        newUserData.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(value) + '&background=10B981&color=fff';
        this.userAvatar = newUserData.avatar;
      }
      localStorage.setItem('userData', JSON.stringify(newUserData));
      this.showToast('Profile updated successfully!', 'success');
    }
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: (data) => {
            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Passwords do not match!', 'danger');
              return false;
            }
            if (data.newPassword.length < 6) {
              this.showToast('Password must be at least 6 characters!', 'danger');
              return false;
            }
            this.showToast('Password changed successfully!', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            localStorage.removeItem('userData');
            localStorage.removeItem('activeRide');
            localStorage.removeItem('favorites');
            this.router.navigate(['/login']);
            this.showToast('Logged out successfully', 'success');
          }
        }
      ]
    });

    await alert.present();
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
    // Save any pending changes before navigating back
    this.saveSettings();
    // Navigate back to profile page which will reload user data via ionViewWillEnter
    this.router.navigate(['/tabs/tab5']);
  }

  getIconBackground(sectionTitle: string): string {
    switch (sectionTitle) {
      case 'Account':
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)';
      case 'Notifications':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)';
      case 'Privacy & Security':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)';
      case 'App Preferences':
        return 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)';
    }
  }

  getInputValue(itemId: string): string {
    switch (itemId) {
      case 'name':
        return this.userName;
      case 'email':
        return this.userEmail;
      case 'phone':
        return this.userPhone;
      default:
        return '';
    }
  }
}