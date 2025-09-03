import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Simple email template function
const renderTemplate = (templateName, data) => {
  const templates = {
    WELCOME: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Welcome to Personal Finance Tracker!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello ${data.name}! 👋</h2>
          <p>Thank you for joining Personal Finance Tracker! We're excited to help you take control of your finances.</p>
          <p>With our platform, you can track your income and expenses, set budgets, view financial reports, and get alerts.</p>
          <div style="text-align: center;">
            <a href="${data.loginUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Get Started</a>
          </div>
          <p>Happy tracking!<br>The Finance Tracker Team</p>
        </div>
      </div>
    `,
    VERIFICATION: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Verify Your Email</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello ${data.name}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${data.verificationUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          </div>
          <p>This link will expire in ${data.expiryTime}.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
    PASSWORD_RESET: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Password Reset Request</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello ${data.name}!</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center;">
            <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          </div>
          <p>This link will expire in ${data.expiryTime}.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
    BUDGET_ALERT: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Budget Alert</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello ${data.name}!</h2>
          <p>Your budget for <strong>${data.category}</strong> is ${data.percentageUsed}% used.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Budget:</strong> $${data.budgetAmount}</p>
            <p><strong>Spent:</strong> $${data.amountSpent}</p>
            <p><strong>Remaining:</strong> $${data.remaining}</p>
            <p><strong>Period:</strong> ${data.period}</p>
          </div>
          <div style="text-align: center;">
            <a href="${data.budgetUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">View Budgets</a>
          </div>
        </div>
      </div>
    `
  };

  return templates[templateName] || `<p>${data.message || 'Hello!'}</p>`;
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    const { to, subject, template, data, attachments } = options;

    // Get HTML content from template
    let html;
    if (template) {
      html = renderTemplate(template, data);
    } else if (options.html) {
      html = options.html;
    } else if (options.message) {
      html = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>${options.message}</p>
      </div>`;
    }

    const mailOptions = {
      from: {
        name: 'Personal Finance Tracker',
        address: process.env.EMAIL_USER
      },
      to,
      subject: options.subject || subject,
      html,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

// Specific email functions
const sendWelcomeEmail = async (user) => {
  const data = {
    name: user.name,
    email: user.email,
    loginUrl: `${process.env.FRONTEND_URL}/login`
  };

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Personal Finance Tracker!',
    template: 'WELCOME',
    data
  });
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const data = {
    name: user.name,
    verificationUrl,
    expiryTime: '24 hours'
  };

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    template: 'VERIFICATION',
    data
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const data = {
    name: user.name,
    resetUrl,
    expiryTime: '10 minutes'
  };

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    template: 'PASSWORD_RESET',
    data
  });
};

const sendPasswordChangedEmail = async (user) => {
  const data = {
    name: user.name,
    timestamp: new Date().toLocaleString(),
    supportEmail: process.env.SUPPORT_EMAIL || 'support@finance-tracker.com',
    message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.'
  };

  return sendEmail({
    to: user.email,
    subject: 'Password Changed Successfully',
    data
  });
};

const sendBudgetAlertEmail = async (user, budgetData) => {
  const data = {
    name: user.name,
    category: budgetData.category,
    budgetAmount: budgetData.budgetAmount.toFixed(2),
    amountSpent: budgetData.amountSpent.toFixed(2),
    percentageUsed: Math.round(budgetData.percentageUsed),
    remaining: budgetData.remaining.toFixed(2),
    period: budgetData.period,
    budgetUrl: `${process.env.FRONTEND_URL}/budgets`
  };

  const subject = budgetData.percentageUsed >= 100 ? 
    `Budget Exceeded - ${budgetData.category}` : 
    `Budget Alert - ${budgetData.category}`;

  return sendEmail({
    to: user.email,
    subject,
    template: 'BUDGET_ALERT',
    data
  });
};

const sendSecurityAlertEmail = async (user, loginData) => {
  const data = {
    name: user.name,
    timestamp: loginData.timestamp.toLocaleString(),
    ipAddress: loginData.ipAddress,
    device: loginData.userAgent,
    location: loginData.location || 'Unknown',
    message: `A new login was detected on your account. If this wasn't you, please change your password immediately.`
  };

  return sendEmail({
    to: user.email,
    subject: 'Security Alert - New Login Detected',
    data
  });
};

// Test email functionality
const testEmailService = async () => {
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email - Personal Finance Tracker',
      message: 'This is a test email to verify that the email service is working correctly.'
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify email configuration
const verifyEmailConfig = () => {
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Email configuration warning: Missing environment variables:', missingVars);
    return false;
  }
  
  return true;
};

export {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendBudgetAlertEmail,
  sendSecurityAlertEmail,
  testEmailService,
  verifyEmailConfig
};