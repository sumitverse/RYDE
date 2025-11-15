import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  saveOutline,
  imageOutline,
  bicycleOutline,
  locationOutline,
  cashOutline,
  flashOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  cameraOutline,
  trashOutline
} from 'ionicons/icons';
import { AdminService, Cycle } from '../../services/admin.service';

@Component({
  selector: 'app-add-cycle',
  templateUrl: './add-cycle.page.html',
  styleUrls: ['./add-cycle.page.scss'],
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
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip
  ]
})
export class AddCyclePage implements OnInit {
  cycleId: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  imagePreview: string | null = null;

  cycleForm = {
    title: '',
    price: 0,
    thumbnail: '',
    battery: 100,
    distance: 0,
    condition: 'excellent',
    location: '',
    status: 'available' as 'available' | 'booked' | 'maintenance',
    description: ''
  };

  // Predefined cycle images for quick selection
  predefinedImages = [
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
    'https://tse2.mm.bing.net/th/id/OIP.-Lu5ijpAXOMftoKJXH2qwQHaEK?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3'
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({
      arrowBackOutline,
      saveOutline,
      imageOutline,
      bicycleOutline,
      locationOutline,
      cashOutline,
      flashOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      cameraOutline,
      trashOutline
    });
  }

  ngOnInit() {
    // Check if we're editing an existing cycle
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cycleId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadCycleData();
    }
  }

  loadCycleData() {
    if (!this.cycleId) return;

    this.isLoading = true;
    try {
      const cycles = this.adminService.getAllCycles();
      const cycle = cycles.find(c => c.id === this.cycleId);
      
      if (cycle) {
        this.cycleForm = {
          title: cycle.title || '',
          price: cycle.price || 0,
          thumbnail: cycle.thumbnail || '',
          battery: cycle.battery || 100,
          distance: cycle.distance || 0,
          condition: cycle.condition || 'excellent',
          location: cycle.location || '',
          status: cycle.status || 'available',
          description: ''
        };
        this.imagePreview = cycle.thumbnail || null;
      } else {
        this.showToast('Cycle not found', 'danger');
        this.router.navigate(['/admin/cycles']);
      }
    } catch (error) {
      console.error('Error loading cycle:', error);
      this.showToast('Error loading cycle data', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  onImageUrlChange() {
    if (this.cycleForm.thumbnail) {
      this.imagePreview = this.cycleForm.thumbnail;
    }
  }

  selectPredefinedImage(imageUrl: string) {
    this.cycleForm.thumbnail = imageUrl;
    this.imagePreview = imageUrl;
    this.showToast('Image selected', 'success');
  }

  clearImage() {
    this.cycleForm.thumbnail = '';
    this.imagePreview = null;
  }

  async validateForm(): Promise<boolean> {
    if (!this.cycleForm.title || this.cycleForm.title.trim().length < 3) {
      this.showToast('Please enter a valid cycle title (at least 3 characters)', 'warning');
      return false;
    }

    if (!this.cycleForm.price || this.cycleForm.price <= 0) {
      this.showToast('Please enter a valid price (greater than 0)', 'warning');
      return false;
    }

    if (this.cycleForm.battery < 0 || this.cycleForm.battery > 100) {
      this.showToast('Battery level must be between 0 and 100', 'warning');
      return false;
    }

    if (this.cycleForm.distance < 0) {
      this.showToast('Distance cannot be negative', 'warning');
      return false;
    }

    if (!this.cycleForm.location || this.cycleForm.location.trim().length < 2) {
      this.showToast('Please enter a valid location', 'warning');
      return false;
    }

    return true;
  }

  async saveCycle() {
    if (!(await this.validateForm())) {
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Updating cycle...' : 'Adding cycle...',
      duration: 2000
    });

    await loading.present();

    try {
      if (this.isEditMode && this.cycleId) {
        // Update existing cycle
        const updated = this.adminService.updateCycle(this.cycleId, this.cycleForm);
        if (updated) {
          // Sync to localStorage so tab1 sees the change immediately
          this.syncCyclesToLocalStorage();
          await loading.dismiss();
          this.showToast('Cycle updated successfully! 🎉', 'success');
          setTimeout(() => {
            this.router.navigate(['/admin/cycles']);
          }, 1500);
        } else {
          await loading.dismiss();
          this.showToast('Failed to update cycle', 'danger');
        }
      } else {
        // Add new cycle
        const newCycle = this.adminService.addCycle(this.cycleForm);
        if (newCycle) {
          // Sync to localStorage so tab1 sees the change immediately
          this.syncCyclesToLocalStorage();
          await loading.dismiss();
          this.showToast('Cycle added successfully! 🎉', 'success');
          setTimeout(() => {
            this.router.navigate(['/admin/cycles']);
          }, 1500);
        } else {
          await loading.dismiss();
          this.showToast('Failed to add cycle', 'danger');
        }
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Error saving cycle:', error);
      this.showToast('Error saving cycle. Please try again.', 'danger');
    }
  }

  async confirmCancel() {
    if (this.hasUnsavedChanges()) {
      const alert = await this.alertController.create({
        header: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to leave?',
        buttons: [
          { text: 'Stay', role: 'cancel' },
          {
            text: 'Leave',
            role: 'destructive',
            handler: () => {
              this.router.navigate(['/admin/cycles']);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/admin/cycles']);
    }
  }

  hasUnsavedChanges(): boolean {
    // Check if form has been modified
    return !!(this.cycleForm.title || this.cycleForm.price > 0 || this.cycleForm.thumbnail);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'warning';
      case 'maintenance':
        return 'danger';
      default:
        return 'medium';
    }
  }

  syncCyclesToLocalStorage() {
    // Get current cycles from localStorage
    const savedCycles = localStorage.getItem('cycles');
    let cycles: any[] = [];
    
    if (savedCycles) {
      try {
        cycles = JSON.parse(savedCycles);
      } catch (e) {
        console.error('Error parsing cycles:', e);
      }
    }
    
    // Get admin cycles
    const adminCycles = this.adminService.getAllCycles();
    const adminCyclesMap = new Map(adminCycles.map(c => [c.id, c]));
    
    // Update cycles with admin data
    cycles = cycles.map(cycle => {
      const adminCycle = adminCyclesMap.get(cycle.id);
      if (adminCycle) {
        return {
          ...cycle,
          status: adminCycle.status || cycle.status || 'available',
          title: adminCycle.title || cycle.title,
          price: adminCycle.price || cycle.price,
          thumbnail: adminCycle.thumbnail || cycle.thumbnail,
          battery: adminCycle.battery !== undefined ? adminCycle.battery : cycle.battery,
          distance: adminCycle.distance !== undefined ? adminCycle.distance : cycle.distance,
          condition: adminCycle.condition || cycle.condition,
          location: adminCycle.location || cycle.location
        };
      }
      return cycle;
    });
    
    // Add admin cycles that aren't in the list
    adminCycles.forEach(adminCycle => {
      if (!cycles.find(c => c.id === adminCycle.id)) {
        cycles.push(adminCycle);
      }
    });
    
    // Save back to localStorage
    localStorage.setItem('cycles', JSON.stringify(cycles));
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

