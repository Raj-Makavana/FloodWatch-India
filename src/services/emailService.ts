import nodemailer, { Transporter } from 'nodemailer';

export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
      const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
      const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
      const emailPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;

      if (emailUser && emailPass && process.env.NODE_ENV !== 'test') {
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: emailPort === 465,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });
      } else {
        // Fallback for development/testing without credentials
        console.log('[EmailService] SMTP credentials not fully configured in .env. OTP will be printed to server console.');
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'ethereal_user',
            pass: 'ethereal_pass',
          },
        });
      }
    }
    return this.transporter;
  }

  async sendOtpEmail(to: string, otp: string, name: string = 'User'): Promise<boolean> {
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const fromAddress = process.env.EMAIL_FROM || `"FloodWatch India" <${emailUser || 'noreply@floodwatch.org'}>`;

    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL OTP DISPATCH]`);
    console.log(`To: ${to}`);
    console.log(`Recipient: ${name}`);
    console.log(`🔐 6-Digit OTP Code: [ ${otp} ]`);
    console.log(`Expires in: 10 minutes`);
    console.log(`======================================================\n`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1120; color: #dde6f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #0d1526; border: 1px solid rgba(30, 80, 180, 0.35); border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
          .logo span { color: #d94326; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
          .desc { font-size: 14px; color: #7a8faa; line-height: 1.5; margin-bottom: 24px; }
          .otp-box { background: #060913; border: 1px solid rgba(26, 109, 255, 0.4); border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; }
          .warning { font-size: 12px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 10px; margin-top: 20px; }
          .footer { font-size: 11px; color: #4b5563; text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FloodWatch <span>India</span></div>
          </div>
          <div class="title">Password Reset Verification</div>
          <div class="desc">Hello <strong>${name}</strong>,<br>We received a request to reset the password for your FloodWatch India authority terminal. Use the 6-digit verification code below to proceed:</div>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <div class="warning">
            ⚠️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
          </div>

          <div class="desc" style="margin-top: 20px; font-size: 12.5px;">
            If you did not request a password reset, please ignore this email or contact security administration immediately.
          </div>

          <div class="footer">
            &copy; 2026 FloodWatch India • Automated Incident & Risk Telemetry System
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (emailUser && process.env.EMAIL_PASS && process.env.NODE_ENV !== 'test') {
        const transporter = this.getTransporter();
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject: `FloodWatch India: ${otp} is your verification code`,
          text: `Your FloodWatch India password reset code is: ${otp}. Valid for 10 minutes.`,
          html: htmlContent,
        });
        console.log(`[EmailService] OTP email delivered to ${to}`);
      }
      return true;
    } catch (err) {
      console.warn(`[EmailService] Live email dispatch failed (falling back to console OTP):`, err);
      return true;
    }
  }
}

export const emailService = new EmailService();
