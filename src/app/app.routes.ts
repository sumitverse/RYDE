import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'tab4',
    loadComponent: () => import('./tab4/tab4.page').then( m => m.Tab4Page)
  },
  {
    path: 'tab5',
    loadComponent: () => import('./tab5/tab5.page').then( m => m.Tab5Page)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'notification',
    loadComponent: () => import('./notification/notification.page').then( m => m.NotificationPage)
  },
  {
    path: 'distance',
    loadComponent: () => import('./distance/distance.page').then( m => m.DistancePage)
  },
  {
    path: 'totalrides',
    loadComponent: () => import('./totalrides/totalrides.page').then( m => m.TotalridesPage)
  },
  {
    path: 'cycle-details/:id',
    loadComponent: () => import('./cycle-details/cycle-details.page').then( m => m.CycleDetailsPage)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule.page').then( m => m.SchedulePage)
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats/stats.page').then( m => m.StatsPage)
  },
  {
    path: 'weather',
    loadComponent: () => import('./weather/weather.page').then( m => m.WeatherPage)
  },
  {
    path: 'setting',
    loadComponent: () => import('./setting/setting.page').then( m => m.SettingPage)
  },
  {
    path: 'help-and-support',
    loadComponent: () => import('./help-and-support/help-and-support.page').then( m => m.HelpAndSupportPage)
  },
  {
    path: 'offer-details/:id',
    loadComponent: () => import('./offer-details/offer-details.page').then( m => m.OfferDetailsPage)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.page').then( m => m.PrivacyPage)
  },
  {
    path: 'booked',
    loadComponent: () => import('./booked/booked.page').then( m => m.BookedPage)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then( m => m.AboutPage)
  },
  {
    path: 'payment-gateway',
    loadComponent: () => import('./payment-gateway/payment-gateway.page').then((m) => m.PaymentGatewayPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage)
  },
  {
    path: 'admin/cycles',
    loadComponent: () => import('./admin/admin-cycles/admin-cycles.page').then( m => m.AdminCyclesPage)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/admin-users/admin-users.page').then( m => m.AdminUsersPage)
  },
  {
    path: 'admin/transactions',
    loadComponent: () => import('./admin/admin-transactions/admin-transactions.page').then( m => m.AdminTransactionsPage)
  },
  {
    path: 'admin/cycles/add',
    loadComponent: () => import('./admin/add-cycle/add-cycle.page').then( m => m.AddCyclePage)
  },
  {
    path: 'admin/cycles/edit/:id',
    loadComponent: () => import('./admin/add-cycle/add-cycle.page').then( m => m.AddCyclePage)
  },
  {
    path: 'aboutdev',
    loadComponent: () => import('./aboutdev/aboutdev.page').then( m => m.AboutdevPage)
  },

];
