import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  // EmailJS Configuration
  // Your EmailJS credentials
  private readonly EMAILJS_PUBLIC_KEY = 'iSH3acMg2XGgG801y';
  private readonly EMAILJS_SERVICE_ID = 'service_pfwgvtf';
  private readonly EMAILJS_TEMPLATE_ID = 'template_l1bvpkv'; // Welcome email template
  private readonly EMAILJS_WALLET_EMPTY_TEMPLATE_ID = 'template_dpa6z8t'; // Wallet empty email template

  constructor() {
    // Initialize EmailJS with your public key
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }

  /**
   * Send welcome email to user automatically
   * This will actually send a real email to the user's inbox
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      // Prepare email template parameters
      // CRITICAL: Variable names must match your EmailJS template exactly
      // Your template uses: {{email}} for To Email and {{name}} for Subject
      const templateParams: any = {
        email: email,           // Recipient email - matches {{email}} in template "To Email" field
        name: name,             // User name - matches {{name}} in template Subject
        // Additional variables for template content (if needed)
        user_name: name,        // For template HTML content ({{user_name}})
        to_email: email,        // Alternative format
        to_name: name,          // Alternative format
        reply_to: email,        // Reply-to email
        from_name: 'RYDE Team', // Sender name
        message: this.getWelcomeEmailBody(name), // Email message body (if used in template)
      };

      console.log('📧 Preparing to send welcome email...');
      console.log('📧 Recipient:', email);
      console.log('📧 Name:', name);
      console.log('📧 Service ID:', this.EMAILJS_SERVICE_ID);
      console.log('📧 Template ID:', this.EMAILJS_TEMPLATE_ID);
      console.log('📧 Template params:', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ EmailJS Response:', response);
      console.log('✅ Response Status:', response.status);
      console.log('✅ Response Text:', response.text);
      console.log('📧 Email sent to:', email);
      
      // Verify response indicates success
      if (response && response.status === 200) {
        console.log('✅ Welcome email sent successfully!');
        this.logEmailSent(email, name, true, 'EmailJS - Status: ' + response.status, 'Welcome to RYDE');
        return true;
      } else {
        console.warn('⚠️ Unexpected response:', response);
        this.logEmailSent(email, name, false, 'EmailJS - Unexpected response: ' + JSON.stringify(response), 'Welcome to RYDE');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error);
      console.error('❌ Error Type:', typeof error);
      console.error('❌ Error Status:', error?.status);
      console.error('❌ Error Text:', error?.text);
      console.error('❌ Error Message:', error?.message);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Service ID:', this.EMAILJS_SERVICE_ID);
      console.error('❌ Template ID:', this.EMAILJS_TEMPLATE_ID);
      
      // Log the failure with detailed error
      const errorMessage = error?.text || error?.message || error?.toString() || 'Unknown error';
      this.logEmailSent(email, name, false, 'EmailJS Error: ' + errorMessage, 'Welcome to RYDE');
      
      return false;
    }
  }

  /**
   * Alternative method: Use Web API to send email (requires backend endpoint)
   * Uncomment and configure if you have a backend API
   */
  /*
  async sendWelcomeEmailViaAPI(email: string, name: string): Promise<boolean> {
    try {
      const emailData = {
        to: email,
        subject: 'Welcome to RYDE',
        body: this.getWelcomeEmailBody(name),
        name: name
      };

      const response = await fetch('YOUR_BACKEND_API_ENDPOINT/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('✅ Welcome email sent via API');
        this.logEmailSent(email, name, true, 'API', 'Welcome to RYDE');
        return true;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('❌ Error sending email via API:', error);
      return false;
    }
  }
  */

  private getWelcomeEmailBody(name: string): string {
    return `
Welcome to RYDE!

Dear ${name},

We're thrilled to have you join the RYDE community! 🎉

Thank you for choosing RYDE for your transportation needs. We're here to make your journey smooth, convenient, and eco-friendly.

Get started by:
- Exploring available cycles in your area
- Booking your first ride
- Earning rewards as you ride

If you have any questions or need assistance, our support team is always here to help.

Happy Riding!

Best regards,
The RYDE Team
    `.trim();
  }

  /**
   * Send wallet empty email notification to user
   * This will send an email when wallet balance is 0
   */
  async sendWalletEmptyEmail(email: string, name: string): Promise<boolean> {
    try {
      // Prepare email template parameters
      const templateParams: any = {
        email: email,           // Recipient email
        name: name,             // User name
        user_name: name,        // For template HTML content
        to_email: email,        // Alternative format
        to_name: name,          // Alternative format
        reply_to: email,        // Reply-to email
        from_name: 'RYDE Team', // Sender name
        message: this.getWalletEmptyEmailBody(name), // Email message body
      };

      console.log('📧 Preparing to send wallet empty email...');
      console.log('📧 Recipient:', email);
      console.log('📧 Name:', name);
      console.log('📧 Service ID:', this.EMAILJS_SERVICE_ID);
      console.log('📧 Template ID:', this.EMAILJS_WALLET_EMPTY_TEMPLATE_ID);
      console.log('📧 Template params:', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_WALLET_EMPTY_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ EmailJS Response:', response);
      console.log('✅ Response Status:', response.status);
      console.log('✅ Response Text:', response.text);
      console.log('📧 Wallet empty email sent to:', email);
      
      // Verify response indicates success
      if (response && response.status === 200) {
        console.log('✅ Wallet empty email sent successfully!');
        this.logEmailSent(email, name, true, 'Wallet Empty Email - Status: ' + response.status, 'Wallet Empty Notification');
        return true;
      } else {
        console.warn('⚠️ Unexpected response:', response);
        this.logEmailSent(email, name, false, 'Wallet Empty Email - Unexpected response: ' + JSON.stringify(response), 'Wallet Empty Notification');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error sending wallet empty email:', error);
      console.error('❌ Error Type:', typeof error);
      console.error('❌ Error Status:', error?.status);
      console.error('❌ Error Text:', error?.text);
      console.error('❌ Error Message:', error?.message);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Service ID:', this.EMAILJS_SERVICE_ID);
      console.error('❌ Template ID:', this.EMAILJS_WALLET_EMPTY_TEMPLATE_ID);
      
      // Log the failure with detailed error
      const errorMessage = error?.text || error?.message || error?.toString() || 'Unknown error';
      this.logEmailSent(email, name, false, 'Wallet Empty Email Error: ' + errorMessage, 'Wallet Empty Notification');
      
      return false;
    }
  }

  private getWalletEmptyEmailBody(name: string): string {
    return `
Your Wallet Balance is Empty

Dear ${name},

We noticed that your RYDE wallet balance has reached ₹0.00.

To continue enjoying our services, please add money to your wallet. You can do this by:
- Opening the Wallet section in the app
- Clicking "Add Money"
- Using UPI or other payment methods

If you have any questions or need assistance, our support team is always here to help.

Thank you for using RYDE!

Best regards,
The RYDE Team
    `.trim();
  }

  private logEmailSent(email: string, name: string, success: boolean, method: string = 'Unknown', subject: string = 'Welcome to RYDE'): void {
    const emailLog = {
      to: email,
      name: name,
      subject: subject,
      timestamp: new Date().toISOString(),
      success: success,
      method: method
    };

    const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    emailLogs.push(emailLog);
    
    // Keep only last 50 logs
    if (emailLogs.length > 50) {
      emailLogs.shift();
    }
    
    localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
  }

  /**
   * Get email logs (for debugging/admin purposes)
   */
  getEmailLogs(): any[] {
    return JSON.parse(localStorage.getItem('emailLogs') || '[]');
  }
}

