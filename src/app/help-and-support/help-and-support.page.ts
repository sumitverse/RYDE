import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  IonInput,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  sendOutline,
  chatbubbleOutline,
  helpCircleOutline,
  callOutline,
  mailOutline,
  timeOutline,
  personOutline
} from 'ionicons/icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-help-and-support',
  templateUrl: './help-and-support.page.html',
  styleUrls: ['./help-and-support.page.scss'],
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
    IonInput,
    IonBackButton,
    IonButtons,
    IonSpinner
  ]
})
export class HelpAndSupportPage implements OnInit, AfterViewInit {
  // Help and support component
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isTyping: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      chevronBackOutline,
      sendOutline,
      chatbubbleOutline,
      helpCircleOutline,
      callOutline,
      mailOutline,
      timeOutline,
      personOutline
    });
  }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  addWelcomeMessage() {
    const welcomeMessage: Message = {
      id: '1',
      text: 'Hello! 👋 I\'m here to help you with any questions about RYDE. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(welcomeMessage);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || this.isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.newMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageText = this.newMessage.trim();
    this.newMessage = '';

    setTimeout(() => this.scrollToBottom(), 100);

    this.isTyping = true;
    this.isLoading = true;

    try {
      await this.delay(800 + Math.random() * 700);

      const botResponse = await this.getBotResponse(messageText);

      this.isTyping = false;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      this.messages.push(botMessage);
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error getting bot response:', error);
      this.isTyping = false;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team directly.',
        sender: 'bot',
        timestamp: new Date()
      };

      this.messages.push(errorMessage);
      setTimeout(() => this.scrollToBottom(), 100);
    } finally {
      this.isLoading = false;
    }
  }

  async getBotResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('ride') || lowerMessage.includes('start') || lowerMessage.includes('book')) {
      return 'To start a ride:\n\n1. Open the app and go to the Map or Home screen\n2. Find an available cycle near you\n3. Tap on the cycle to see details\n4. Click "Start Ride" to begin your journey\n5. Remember to end your ride when you\'re done!\n\nIs there anything specific about starting a ride you\'d like to know?';
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('wallet') || lowerMessage.includes('money') || lowerMessage.includes('pay')) {
      return 'For payment and wallet issues:\n\n• Add money to your wallet from the Wallet tab\n• Payments are automatically deducted after each ride\n• You can view your transaction history in the Wallet section\n• If you face any payment issues, please contact support with your transaction ID\n\nWould you like help with a specific payment problem?';
    }

    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('login')) {
      return 'For account and profile help:\n\n• Update your profile from the Profile tab\n• Change your settings from the Settings page\n• To logout, go to Profile → Settings → Logout\n• If you forgot your password, you can reset it from the login screen\n\nWhat account issue are you experiencing?';
    }

    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('report') || lowerMessage.includes('broken')) {
      return 'To report a problem:\n\n1. Go to the cycle details page\n2. Look for the "Report Issue" button\n3. Describe the problem in detail\n4. Our team will review and address it promptly\n\nYou can also contact us directly:\n• Email: support@ryde.com\n• Phone: +91 1800-XXX-XXXX\n\nPlease provide more details about the issue you\'re facing.';
    }

    if (lowerMessage.includes('battery') || lowerMessage.includes('charge')) {
      return 'Battery information:\n\n• Each cycle shows its battery level on the map\n• Cycles with low battery (below 20%) are marked\n• We recommend choosing cycles with at least 50% battery for longer rides\n• Batteries are charged regularly by our team\n\nIs there a specific battery-related issue you\'re facing?';
    }

    if (lowerMessage.includes('location') || lowerMessage.includes('find') || lowerMessage.includes('where')) {
      return 'Finding cycles:\n\n• Use the Map tab to see all available cycles near you\n• Cycles are marked with icons on the map\n• Tap on a cycle marker to see its details and location\n• The app uses your GPS to show the nearest cycles\n\nNeed help finding a cycle in a specific area?';
    }

    if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fare')) {
      return 'Pricing information:\n\n• Rides are charged per minute of usage\n• Standard rate: ₹1-5 per minute (varies by cycle)\n• Minimum charge: ₹10 per ride\n• You can see the price before starting a ride\n• Payment is automatically deducted from your wallet\n\nWould you like to know about any specific pricing details?';
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! 👋 How can I help you today? You can ask me about:\n\n• Starting a ride\n• Payment and wallet\n• Account issues\n• Reporting problems\n• Battery and location\n• Pricing information\n\nFeel free to ask me anything about RYDE!';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'I\'m here to help! You can ask me about:\n\n📱 Using the app\n💰 Payments and wallet\n🔧 Account settings\n🚲 Cycle issues\n📍 Finding cycles\n💵 Pricing\n\nOr contact our support team:\n• Email: support@ryde.com\n• Phone: +91 1800-XXX-XXXX\n\nWhat would you like help with?';
    }

    return 'I understand you\'re asking about: "' + userMessage + '". While I\'m still learning, I can help you with:\n\n• Starting and ending rides\n• Payment and wallet issues\n• Account problems\n• Reporting cycle issues\n• Finding cycles\n• Pricing information\n\nPlease rephrase your question. For specific issues, contact our support team at support@ryde.com';
  }

  scrollToBottom() {
    try {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab5']);
  }

  contactSupport(method: 'email' | 'phone') {
    if (method === 'email') {
      window.location.href = 'mailto:sumitverse26@gmail.com?subject=Support Request';
    } else {
      window.location.href = 'tel:+919576877877';
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
