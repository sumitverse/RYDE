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
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonSearchbar,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bicycleOutline,
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  searchOutline,
  arrowBackOutline,
  locationOutline,
  cashOutline,
  checkmarkCircleOutline,
  timeOutline,
  flashOutline,
  navigateOutline,
  constructOutline,
  helpCircleOutline
} from 'ionicons/icons';
import { AdminService, Cycle } from '../../services/admin.service';

@Component({
  selector: 'app-admin-cycles',
  templateUrl: './admin-cycles.page.html',
  styleUrls: ['./admin-cycles.page.scss'],
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
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonChip,
    IonSearchbar,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class AdminCyclesPage implements OnInit {
  cycles: Cycle[] = [];
  filteredCycles: Cycle[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;
  isModalOpen: boolean = false;
  editingCycle: Cycle | null = null;

  cycleForm = {
    title: '',
    price: 0,
    thumbnail: '',
    battery: 100,
    distance: 0,
    condition: 'excellent',
    location: '',
    status: 'available' as 'available' | 'booked' | 'maintenance'
  };

  // Array of different cycle names to ensure uniqueness
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
    'Argon 18 Gallium',
    'Fuji Roubaix',
    'Kona Rove',
    'Surly Straggler',
    'Salsa Vaya',
    'All-City Space Horse',
    'Jamis Renegade',
    'Raleigh Tamland',
    'Niner RLT',
    'Soma Double Cross',
    'Breezer Radar',
    'Marin Four Corners',
    'Diamondback Haanjo',
    'GT Grade',
    'Norco Search',
    'Rocky Mountain Solo'
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      bicycleOutline,
      addOutline,
      createOutline,
      trashOutline,
      closeOutline,
      searchOutline,
      arrowBackOutline,
      locationOutline,
      cashOutline,
      checkmarkCircleOutline,
      timeOutline,
      flashOutline,
      navigateOutline,
      constructOutline,
      helpCircleOutline
    });
  }

  ngOnInit() {
    this.loadCycles();
  }

  // Get unique cycle name based on ID
  getUniqueCycleName(cycleId: number, existingNames: Set<string>): string {
    // Try to get a name based on cycle ID
    const nameIndex = cycleId % this.cycleNames.length;
    let baseName = this.cycleNames[nameIndex];
    
    // If name already exists, add a suffix to make it unique
    if (existingNames.has(baseName)) {
      let counter = 1;
      let uniqueName = `${baseName} #${counter}`;
      while (existingNames.has(uniqueName)) {
        counter++;
        uniqueName = `${baseName} #${counter}`;
      }
      return uniqueName;
    }
    
    return baseName;
  }

  loadCycles() {
    this.isLoading = true;
    try {
      setTimeout(() => {
        // Load cycles from localStorage (same source as tab1)
        const savedCycles = localStorage.getItem('cycles');
        let loadedCycles: Cycle[] = [];
        
        if (savedCycles) {
          try {
            loadedCycles = JSON.parse(savedCycles);
          } catch (e) {
            console.error('Error parsing cycles:', e);
          }
        }
        
        // Also get admin-managed cycles and merge
        const adminCycles = this.adminService.getAllCycles();
        const adminCyclesMap = new Map(adminCycles.map(c => [c.id, c]));
        
        // First, ensure all cycles from tab1 are also in admin storage (for status management)
        // We need to add them with their existing IDs, not create new ones
        loadedCycles.forEach(cycle => {
          if (!adminCyclesMap.has(cycle.id)) {
            // Add cycle to admin storage with its existing ID
            const cycles = this.adminService.getAllCycles();
            const newCycle: Cycle = {
              id: cycle.id, // Preserve the original ID
              title: cycle.title,
              price: cycle.price,
              thumbnail: cycle.thumbnail,
              battery: cycle.battery,
              distance: cycle.distance,
              condition: cycle.condition,
              location: cycle.location,
              status: cycle.status || 'available',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            cycles.push(newCycle);
            // Save directly to localStorage using the same key as AdminService
            localStorage.setItem('cycles', JSON.stringify(cycles));
          }
        });
        
        // Reload admin cycles after adding missing ones
        const updatedAdminCycles = this.adminService.getAllCycles();
        const updatedAdminCyclesMap = new Map(updatedAdminCycles.map(c => [c.id, c]));
        
        // Track used names to ensure uniqueness
        const usedNames = new Set<string>();
        
        // Update cycles with admin data (status, etc.) - prioritize admin data
        loadedCycles = loadedCycles.map((cycle, index) => {
          const adminCycle = updatedAdminCyclesMap.get(cycle.id);
          let cycleTitle = cycle.title;
          
          // If cycle doesn't have a title or has a generic title, assign a unique one
          if (!cycleTitle || cycleTitle.trim() === '' || cycleTitle.toLowerCase().includes('cycle')) {
            cycleTitle = this.getUniqueCycleName(cycle.id, usedNames);
            usedNames.add(cycleTitle);
          } else {
            // Check if title is already used, if so make it unique
            if (usedNames.has(cycleTitle)) {
              let counter = 1;
              let uniqueTitle = `${cycleTitle} #${counter}`;
              while (usedNames.has(uniqueTitle)) {
                counter++;
                uniqueTitle = `${cycleTitle} #${counter}`;
              }
              cycleTitle = uniqueTitle;
            }
            usedNames.add(cycleTitle);
          }
          
          if (adminCycle) {
            // Use admin title if it exists and is not empty, otherwise use the unique title
            const finalTitle = (adminCycle.title && adminCycle.title.trim() !== '') 
              ? adminCycle.title 
              : cycleTitle;
            
            // If we assigned a new unique title, save it to admin storage
            if (finalTitle !== adminCycle.title) {
              this.adminService.updateCycle(cycle.id, { title: finalTitle });
            }
            
            return {
              ...cycle,
              status: adminCycle.status || cycle.status || 'available',
              title: finalTitle,
              price: adminCycle.price || cycle.price,
              thumbnail: adminCycle.thumbnail || cycle.thumbnail,
              battery: adminCycle.battery !== undefined ? adminCycle.battery : cycle.battery,
              distance: adminCycle.distance !== undefined ? adminCycle.distance : cycle.distance,
              condition: adminCycle.condition || cycle.condition,
              location: adminCycle.location || cycle.location
            };
          }
          
          // Update admin storage with unique title if cycle exists but title changed
          if (updatedAdminCyclesMap.has(cycle.id)) {
            const existingAdminCycle = updatedAdminCyclesMap.get(cycle.id);
            if (existingAdminCycle && existingAdminCycle.title !== cycleTitle) {
              this.adminService.updateCycle(cycle.id, { title: cycleTitle });
            }
          } else {
            // Cycle doesn't exist in admin storage, add it with unique title
            const cycles = this.adminService.getAllCycles();
            const newCycle: Cycle = {
              id: cycle.id,
              title: cycleTitle,
              price: cycle.price,
              thumbnail: cycle.thumbnail,
              battery: cycle.battery,
              distance: cycle.distance,
              condition: cycle.condition || 'excellent',
              location: cycle.location || 'Unknown',
              status: (cycle.status || 'available') as 'available' | 'booked' | 'maintenance',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            cycles.push(newCycle);
            localStorage.setItem('cycles', JSON.stringify(cycles));
          }
          
          return {
            ...cycle,
            title: cycleTitle,
            status: (cycle.status || 'available') as 'available' | 'booked' | 'maintenance'
          };
        });
        
        // Add admin cycles that aren't in the main list (standalone admin-created cycles)
        updatedAdminCycles.forEach(adminCycle => {
          if (!loadedCycles.find(c => c.id === adminCycle.id)) {
            // Ensure unique name for admin-created cycles
            let cycleTitle = adminCycle.title;
            if (!cycleTitle || cycleTitle.trim() === '') {
              cycleTitle = this.getUniqueCycleName(adminCycle.id, usedNames);
            } else if (usedNames.has(cycleTitle)) {
              let counter = 1;
              let uniqueTitle = `${cycleTitle} #${counter}`;
              while (usedNames.has(uniqueTitle)) {
                counter++;
                uniqueTitle = `${cycleTitle} #${counter}`;
              }
              cycleTitle = uniqueTitle;
            }
            usedNames.add(cycleTitle);
            
            // Save unique title to admin storage if it changed
            if (cycleTitle !== adminCycle.title) {
              this.adminService.updateCycle(adminCycle.id, { title: cycleTitle });
            }
            
            loadedCycles.push({
              ...adminCycle,
              title: cycleTitle
            });
          }
        });
        
        // Save merged cycles back to localStorage to ensure persistence
        localStorage.setItem('cycles', JSON.stringify(loadedCycles));
        
        this.cycles = loadedCycles;
        this.filteredCycles = [...this.cycles];
        this.isLoading = false;
      }, 300);
    } catch (error) {
      console.error('Error loading cycles:', error);
      this.cycles = [];
      this.filteredCycles = [];
      this.isLoading = false;
      this.showToast('Error loading cycles', 'danger');
    }
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value.toLowerCase();
    this.filteredCycles = this.cycles.filter(cycle =>
      cycle.title.toLowerCase().includes(this.searchQuery) ||
      (cycle.location && cycle.location.toLowerCase().includes(this.searchQuery))
    );
  }

  openAddModal() {
    // Navigate to dedicated add cycle page
    this.router.navigate(['/admin/cycles/add']);
  }

  openEditModal(cycle: Cycle) {
    try {
      if (!cycle || !cycle.id) {
        this.showToast('Invalid cycle data', 'warning');
        return;
      }
      // Navigate to dedicated edit cycle page
      this.router.navigate(['/admin/cycles/edit', cycle.id]);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      this.showToast('Error opening edit form', 'danger');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingCycle = null;
  }

  async saveCycle() {
    try {
      if (!this.cycleForm.title || !this.cycleForm.price || this.cycleForm.price <= 0) {
        this.showToast('Please fill all required fields with valid values', 'warning');
        return;
      }

      if (this.editingCycle) {
        const updated = this.adminService.updateCycle(this.editingCycle.id, this.cycleForm);
        if (updated) {
          // Update cycles in localStorage to sync with tab1
          this.syncCyclesToLocalStorage();
          this.showToast('Cycle updated successfully', 'success');
          this.closeModal();
          this.loadCycles();
        } else {
          this.showToast('Failed to update cycle', 'danger');
        }
      } else {
        this.adminService.addCycle(this.cycleForm);
        // Update cycles in localStorage to sync with tab1
        this.syncCyclesToLocalStorage();
        this.showToast('Cycle added successfully', 'success');
        this.closeModal();
        this.loadCycles();
      }
    } catch (error) {
      console.error('Error saving cycle:', error);
      this.showToast('Error saving cycle. Please try again.', 'danger');
    }
  }

  syncCyclesToLocalStorage() {
    // Get current cycles from localStorage
    const savedCycles = localStorage.getItem('cycles');
    let cycles: Cycle[] = [];
    
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

  async deleteCycle(cycle: Cycle) {
    try {
      if (!cycle || !cycle.id) {
        this.showToast('Invalid cycle data', 'warning');
        return;
      }

      const alert = await this.alertController.create({
        header: 'Delete Cycle',
        message: `Are you sure you want to delete "${cycle.title}"? This action cannot be undone.`,
        buttons: [
          { 
            text: 'Cancel', 
            role: 'cancel',
            handler: () => {
              // User cancelled, do nothing
            }
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              try {
                const deleted = this.adminService.deleteCycle(cycle.id);
                if (deleted) {
                  // Sync to localStorage so tab1 sees the change immediately
                  this.syncCyclesToLocalStorage();
                  this.showToast('Cycle deleted successfully', 'success');
                  this.loadCycles();
                } else {
                  this.showToast('Failed to delete cycle', 'danger');
                }
              } catch (error) {
                console.error('Error deleting cycle:', error);
                this.showToast('Error deleting cycle. Please try again.', 'danger');
              }
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error showing delete alert:', error);
      this.showToast('Error opening delete confirmation', 'danger');
    }
  }

  async quickChangeStatus(cycle: Cycle) {
    const currentStatus = cycle.status || 'available';
    let newStatus: 'available' | 'booked' | 'maintenance';
    
    // Cycle through statuses
    switch (currentStatus) {
      case 'available':
        newStatus = 'booked';
        break;
      case 'booked':
        newStatus = 'maintenance';
        break;
      case 'maintenance':
        newStatus = 'available';
        break;
      default:
        newStatus = 'available';
    }
    
    const alert = await this.alertController.create({
      header: 'Change Status',
      message: `Change "${cycle.title}" status from ${currentStatus} to ${newStatus}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Change',
          handler: () => {
            const updated = this.adminService.updateCycle(cycle.id, { status: newStatus });
            if (updated) {
              // Sync to localStorage so tab1 sees the change immediately
              this.syncCyclesToLocalStorage();
              this.showToast(`Status changed to ${newStatus}`, 'success');
              this.loadCycles();
            } else {
              this.showToast('Failed to update status', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getStatusCount(status: 'available' | 'booked' | 'maintenance'): number {
    return this.cycles.filter(c => c.status === status).length;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'available':
        return 'checkmark-circle-outline';
      case 'booked':
        return 'time-outline';
      case 'maintenance':
        return 'construct-outline';
      default:
        return 'help-circle-outline';
    }
  }

  getBatteryLevel(battery: number): string {
    if (battery >= 80) return 'high';
    if (battery >= 50) return 'medium';
    return 'low';
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

