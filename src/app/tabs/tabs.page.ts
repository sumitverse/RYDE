import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bicycleOutline,
  bicycle,
  mapOutline,
  map,
  qrCodeOutline,
  qrCode,
  walletOutline,
  wallet,
  personOutline,
  person,
  homeOutline,
  home
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({
      bicycleOutline,
      bicycle,
      mapOutline,
      map,
      qrCodeOutline,
      qrCode,
      walletOutline,
      wallet,
      personOutline,
      person,
      homeOutline,
      home
    });
  }
}
