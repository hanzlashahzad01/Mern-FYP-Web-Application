const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'taimoordev.op@gmail.com',
      pass: process.env.EMAIL_PASS || 'hyig xorm attn ukia' // App password for Gmail
    }
  });
};

// Email templates
const emailTemplates = {
  loginGreeting: (userName) => ({
    subject: 'Welcome Back to ArtisanMart! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎨 ArtisanMart</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Your Gateway to Authentic Artisan Products</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #27ae60; margin: 0; font-size: 24px;">Welcome Back, ${userName}! 👋</h2>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0;">
              Thank you for logging into ArtisanMart! We're thrilled to have you back in our community of artisans and art lovers.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">What's New?</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>Discover unique handmade products from talented artisans</li>
              <li>Connect directly with creators through our messaging system</li>
              <li>Support local craftsmanship and sustainable practices</li>
              <li>Enjoy exclusive deals and early access to new collections</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Explore ArtisanMart
            </a>
          </div>
          
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
              This email was sent because you logged into your ArtisanMart account.<br>
              If you didn't log in, please contact our support team immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              © 2024 ArtisanMart. All rights reserved.<br>
              Crafting connections, one artisan at a time.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome Back to ArtisanMart!
      
      Hi ${userName},
      
      Thank you for logging into ArtisanMart! We're thrilled to have you back in our community of artisans and art lovers.
      
      What's New?
      - Discover unique handmade products from talented artisans
      - Connect directly with creators through our messaging system
      - Support local craftsmanship and sustainable practices
      - Enjoy exclusive deals and early access to new collections
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      
      This email was sent because you logged into your ArtisanMart account.
      If you didn't log in, please contact our support team immediately.
      
      © 2024 ArtisanMart. All rights reserved.
      Crafting connections, one artisan at a time.
    `
  }),

  welcomeNewUser: (userName) => ({
    subject: 'Welcome to ArtisanMart! 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎨 ArtisanMart</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Your Gateway to Authentic Artisan Products</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #e74c3c; margin: 0; font-size: 24px;">Welcome to ArtisanMart, ${userName}! 🎉</h2>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0;">
              We're excited to have you join our community! ArtisanMart connects you with talented artisans and their unique handmade products.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>Browse our curated collection of artisan products</li>
              <li>Connect with talented creators and learn their stories</li>
              <li>Support sustainable and ethical craftsmanship</li>
              <li>Join our community of art lovers and collectors</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Exploring
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              © 2024 ArtisanMart. All rights reserved.<br>
              Crafting connections, one artisan at a time.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome to ArtisanMart!
      
      Hi ${userName},
      
      We're excited to have you join our community! ArtisanMart connects you with talented artisans and their unique handmade products.
      
      Get Started:
      - Browse our curated collection of artisan products
      - Connect with talented creators and learn their stories
      - Support sustainable and ethical craftsmanship
      - Join our community of art lovers and collectors
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      
      © 2024 ArtisanMart. All rights reserved.
      Crafting connections, one artisan at a time.
    `
  }),

  vendorApprovalRequest: (userName) => ({
    subject: 'Vendor Registration Request Submitted - ArtisanMart 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎨 ArtisanMart</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Your Gateway to Authentic Artisan Products</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f39c12; margin: 0; font-size: 24px;">Vendor Request Submitted! 📝</h2>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f39c12;">
            <p style="color: #856404; font-size: 16px; line-height: 1.6; margin: 0;">
              Hi ${userName},<br><br>
              Thank you for your interest in becoming a vendor on ArtisanMart! Your vendor registration request has been successfully submitted and is now under review by our admin team.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">What happens next?</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>Our admin team will review your application within 1-3 business days</li>
              <li>You'll receive an email notification once your application is reviewed</li>
              <li>If approved, you'll gain access to vendor features and can start selling</li>
              <li>If additional information is needed, we'll contact you directly</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 16px; margin-bottom: 10px;">While you wait:</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li>Explore our platform and see what other vendors are creating</li>
              <li>Prepare your product catalog and business information</li>
              <li>Review our vendor guidelines and policies</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Explore ArtisanMart
            </a>
          </div>
          
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
              If you have any questions about your application, please contact our support team.<br>
              We appreciate your patience during the review process.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              © 2024 ArtisanMart. All rights reserved.<br>
              Crafting connections, one artisan at a time.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Vendor Registration Request Submitted - ArtisanMart
      
      Hi ${userName},
      
      Thank you for your interest in becoming a vendor on ArtisanMart! Your vendor registration request has been successfully submitted and is now under review by our admin team.
      
      What happens next?
      - Our admin team will review your application within 1-3 business days
      - You'll receive an email notification once your application is reviewed
      - If approved, you'll gain access to vendor features and can start selling
      - If additional information is needed, we'll contact you directly
      
      While you wait:
      - Explore our platform and see what other vendors are creating
      - Prepare your product catalog and business information
      - Review our vendor guidelines and policies
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      
      If you have any questions about your application, please contact our support team.
      We appreciate your patience during the review process.
      
      © 2024 ArtisanMart. All rights reserved.
      Crafting connections, one artisan at a time.
    `
  }),

  vendorApproved: (userName) => ({
    subject: '🎉 Congratulations! Your Vendor Application Has Been Approved - ArtisanMart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎨 ArtisanMart</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Your Gateway to Authentic Artisan Products</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #27ae60; margin: 0; font-size: 24px;">🎉 Congratulations, ${userName}! 🎉</h2>
            <p style="color: #27ae60; font-size: 18px; margin: 10px 0 0 0; font-weight: bold;">Your Vendor Application Has Been Approved!</p>
          </div>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #27ae60;">
            <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0;">
              Welcome to the ArtisanMart vendor community! You can now start selling your amazing products on our platform.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">What you can do now:</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>Access your vendor dashboard to manage your store</li>
              <li>Add and manage your product listings</li>
              <li>Set up your vendor profile and business information</li>
              <li>Start receiving orders from customers</li>
              <li>Track your sales and analytics</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 16px; margin-bottom: 10px;">Your Login Credentials:</h3>
            <p style="color: #34495e; font-size: 14px; line-height: 1.6; margin: 0;">
              You can now log in to your vendor account using the email and password you registered with.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor" 
               style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Vendor Dashboard
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              © 2024 ArtisanMart. All rights reserved.<br>
              Crafting connections, one artisan at a time.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Congratulations! Your Vendor Application Has Been Approved - ArtisanMart
      
      Hi ${userName},
      
      🎉 Congratulations! Your vendor application has been approved!
      
      Welcome to the ArtisanMart vendor community! You can now start selling your amazing products on our platform.
      
      What you can do now:
      - Access your vendor dashboard to manage your store
      - Add and manage your product listings
      - Set up your vendor profile and business information
      - Start receiving orders from customers
      - Track your sales and analytics
      
      Your Login Credentials:
      You can now log in to your vendor account using the email and password you registered with.
      
      Access your vendor dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor
      
      © 2024 ArtisanMart. All rights reserved.
      Crafting connections, one artisan at a time.
    `
  }),

  vendorRejected: (userName, rejectionReason) => ({
    subject: 'Vendor Application Update - ArtisanMart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎨 ArtisanMart</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Your Gateway to Authentic Artisan Products</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #e74c3c; margin: 0; font-size: 24px;">Vendor Application Update</h2>
          </div>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #e74c3c;">
            <p style="color: #721c24; font-size: 16px; line-height: 1.6; margin: 0;">
              Hi ${userName},<br><br>
              Thank you for your interest in becoming a vendor on ArtisanMart. After careful review, we regret to inform you that your vendor application was not approved at this time.
            </p>
          </div>
          
          ${rejectionReason ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Reason for Rejection:</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 3px solid #e74c3c;">
              <p style="color: #34495e; font-size: 14px; line-height: 1.6; margin: 0;">${rejectionReason}</p>
            </div>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">What you can do:</h3>
            <ul style="color: #34495e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>Review our vendor requirements and guidelines</li>
              <li>Address any issues mentioned in the feedback</li>
              <li>Reapply after making necessary improvements</li>
              <li>Continue shopping as a customer on our platform</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Continue Shopping
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              If you have any questions about this decision, please contact our support team.<br>
              We encourage you to reapply in the future when you're ready.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              © 2024 ArtisanMart. All rights reserved.<br>
              Crafting connections, one artisan at a time.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Vendor Application Update - ArtisanMart
      
      Hi ${userName},
      
      Thank you for your interest in becoming a vendor on ArtisanMart. After careful review, we regret to inform you that your vendor application was not approved at this time.
      
      ${rejectionReason ? `Reason for Rejection: ${rejectionReason}` : ''}
      
      What you can do:
      - Review our vendor requirements and guidelines
      - Address any issues mentioned in the feedback
      - Reapply after making necessary improvements
      - Continue shopping as a customer on our platform
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      
      If you have any questions about this decision, please contact our support team.
      We encourage you to reapply in the future when you're ready.
      
      © 2024 ArtisanMart. All rights reserved.
      Crafting connections, one artisan at a time.
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    
    // Get email template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // Generate email content
    const emailContent = typeof emailTemplate === 'function' 
      ? emailTemplate(data.userName || data.name || 'Valued Customer', data.rejectionReason || '')
      : emailTemplate;
    
    // Email options
    const mailOptions = {
      from: {
        name: 'ArtisanMart',
        address: process.env.EMAIL_USER || 'taimoordev.op@gmail.com'
      },
      to: to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendLoginGreeting = async (userEmail, userName) => {
  return await sendEmail(userEmail, 'loginGreeting', { userName });
};

const sendWelcomeEmail = async (userEmail, userName) => {
  return await sendEmail(userEmail, 'welcomeNewUser', { userName });
};

const sendVendorApprovalRequestEmail = async (userEmail, userName) => {
  return await sendEmail(userEmail, 'vendorApprovalRequest', { userName });
};

const sendVendorApprovalNotification = async (userEmail, userName, isApproved, rejectionReason = '') => {
  return await sendEmail(userEmail, isApproved ? 'vendorApproved' : 'vendorRejected', { 
    userName, 
    rejectionReason 
  });
};

module.exports = {
  sendEmail,
  sendLoginGreeting,
  sendWelcomeEmail,
  sendVendorApprovalRequestEmail,
  sendVendorApprovalNotification,
  emailTemplates
};
