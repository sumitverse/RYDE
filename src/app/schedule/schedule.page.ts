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
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonModal,
  IonLabel,
  IonItem,
  IonInput,
  IonTextarea,
  IonChip,
  IonBadge,
  IonSpinner,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  timeOutline,
  locationOutline,
  bicycleOutline,
  addOutline,
  trashOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  navigateOutline,
  createOutline,
  documentTextOutline,
  closeOutline
} from 'ionicons/icons';

interface ScheduledRide {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  cycleType?: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
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
    IonButtons,
    IonModal,
    IonLabel,
    IonItem,
    IonInput,
    IonTextarea,
    IonChip,
    IonBadge,
    IonSpinner
  ]
})
export class SchedulePage implements OnInit {
  scheduledRides: ScheduledRide[] = [];
  isLoading: boolean = false;

  newSchedule: Partial<ScheduledRide> = {
    title: '',
    date: '',
    time: '',
    location: '',
    cycleType: '',
    notes: '',
    status: 'upcoming'
  };

  isModalOpen: boolean = false;
  isEditing: boolean = false;
  editingId: string = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBackOutline,
      calendarOutline,
      timeOutline,
      locationOutline,
      bicycleOutline,
      addOutline,
      trashOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      navigateOutline,
      createOutline,
      documentTextOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.loadScheduledRides();
  }

  loadScheduledRides() {
    const saved = localStorage.getItem('scheduledRides');
    if (saved) {
      try {
        this.scheduledRides = JSON.parse(saved);
        this.scheduledRides.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
      } catch (e) {
        console.error('Error loading scheduled rides:', e);
        this.scheduledRides = [];
      }
    } else {
      this.scheduledRides = [
        {
          id: '1',
          title: 'Morning Ride to Campus',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '08:00',
          location: 'Main Campus - Building A',
          cycleType: 'Electric',
          notes: 'Need to reach by 8:30 AM',
          status: 'upcoming',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Evening Exercise',
          date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          time: '18:00',
          location: 'Sports Complex',
          cycleType: 'Regular',
          notes: 'Evening workout session',
          status: 'upcoming',
          createdAt: new Date().toISOString()
        }
      ];
      this.saveScheduledRides();
    }
  }

  saveScheduledRides() {
    localStorage.setItem('scheduledRides', JSON.stringify(this.scheduledRides));
  }

  openNewScheduleModal() {
    this.isEditing = false;
    this.editingId = '';
    this.newSchedule = {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      cycleType: '',
      notes: '',
      status: 'upcoming'
    };
    this.isModalOpen = true;
  }

  openEditModal(ride: ScheduledRide) {
    this.isEditing = true;
    this.editingId = ride.id;
    this.newSchedule = {
      title: ride.title,
      date: ride.date,
      time: ride.time,
      location: ride.location,
      cycleType: ride.cycleType || '',
      notes: ride.notes || '',
      status: ride.status
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editingId = '';
  }

  async saveSchedule() {
    if (!this.newSchedule.title || !this.newSchedule.date || !this.newSchedule.time || !this.newSchedule.location) {
      this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    if (this.isEditing) {
      const index = this.scheduledRides.findIndex(r => r.id === this.editingId);
      if (index !== -1) {
        this.scheduledRides[index] = {
          ...this.scheduledRides[index],
          ...this.newSchedule,
          id: this.editingId
        } as ScheduledRide;
        this.showToast('Schedule updated successfully!', 'success');
      }
    } else {
      const newRide: ScheduledRide = {
        id: Date.now().toString(),
        title: this.newSchedule.title!,
        date: this.newSchedule.date!,
        time: this.newSchedule.time!,
        location: this.newSchedule.location!,
        cycleType: this.newSchedule.cycleType,
        notes: this.newSchedule.notes,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };
      this.scheduledRides.push(newRide);
      this.showToast('Schedule created successfully!', 'success');
    }

    this.saveScheduledRides();
    this.closeModal();
  }

  async deleteSchedule(id: string) {
    const alert = await this.alertController.create({
      header: 'Delete Schedule',
      message: 'Are you sure you want to delete this scheduled ride?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.scheduledRides = this.scheduledRides.filter(r => r.id !== id);
            this.saveScheduledRides();
            this.showToast('Schedule deleted successfully', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }

  isPastSchedule(ride: ScheduledRide): boolean {
    const scheduleDateTime = new Date(`${ride.date}T${ride.time}`);
    return scheduleDateTime < new Date();
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
