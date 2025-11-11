import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonCheckbox,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
  logoFacebook,
  logoApple,
  bicycleOutline,
  personOutline,
  callOutline,
  cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    IonCheckbox,
    IonSpinner
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode: boolean = true;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  rememberMe: boolean = false;
  selectedPhoto: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logoGoogle,
      logoFacebook,
      logoApple,
      bicycleOutline,
      personOutline,
      callOutline,
      cameraOutline
    });
  }

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.showPassword = false;
    this.showConfirmPassword = false;
    if (this.isLoginMode) {
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Image size should be less than 5MB', 'danger');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const existingUser = localStorage.getItem('userData');
      let existingPhoto = null;
      if (existingUser) {
        try {
          const userData = JSON.parse(existingUser);
          existingPhoto = userData.photo || userData.avatar;
        } catch (e) {
          console.error('Error loading existing photo:', e);
        }
      }

      const userData = {
        name: this.loginForm.value.name || this.loginForm.value.email.split('@')[0] || 'User',
        email: this.loginForm.value.email,
        photo: existingPhoto,
        avatar: existingPhoto
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      const statsKey = `userStats_${userData.email}`;
      const existingStats = localStorage.getItem(statsKey);
      if (!existingStats) {
        const defaultStats = {
          totalRides: 24,
          totalDistance: 156.8,
          totalSaved: 45.50,
          carbonSaved: 12.3
        };
        localStorage.setItem(statsKey, JSON.stringify(defaultStats));
        localStorage.setItem('userStats', JSON.stringify(defaultStats));
      }

      setTimeout(() => {
        this.isLoading = false;
        this.showToast('Login successful! 🎉', 'success');
        this.router.navigate(['/tabs/tab1']);
      }, 2000);
    } else {
      this.showToast('Please fill in all fields correctly', 'danger');
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      const userData = {
        name: this.registerForm.value.name || 'User',
        email: this.registerForm.value.email,
        phone: this.registerForm.value.phone,
        photo: this.selectedPhoto || null,
        avatar: this.selectedPhoto || null
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      const statsKey = `userStats_${userData.email}`;
      const defaultStats = {
        totalRides: 24,
        totalDistance: 156.8,
        totalSaved: 45.50,
        carbonSaved: 12.3
      };
      localStorage.setItem(statsKey, JSON.stringify(defaultStats));
      localStorage.setItem('userStats', JSON.stringify(defaultStats));

      setTimeout(() => {
        this.isLoading = false;
        this.showToast('Account created successfully! 🎉', 'success');
        this.router.navigate(['/tabs/tab1']);
      }, 2000);
    } else {
      this.showToast('Please fill in all fields correctly', 'danger');
    }
  }

  async onSocialLogin(provider: string) {
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.showToast(`Signed in with ${provider}!`, 'success');
      this.router.navigate(['/tabs/tab1']);
    }, 1500);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  get email() {
    return this.isLoginMode ? this.loginForm.get('email') : this.registerForm.get('email');
  }

  get password() {
    return this.isLoginMode ? this.loginForm.get('password') : this.registerForm.get('password');
  }
}
