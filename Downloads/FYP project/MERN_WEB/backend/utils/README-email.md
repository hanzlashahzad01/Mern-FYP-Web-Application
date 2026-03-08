# Email Service Documentation

## Overview
The email service provides automated email functionality for the ArtisanMart application, including welcome emails for new users and login greeting emails.

## Features
- **Welcome Email**: Sent automatically when a new user registers
- **Login Greeting Email**: Sent automatically when a user logs in
- **HTML & Text Templates**: Beautiful HTML emails with fallback text versions
- **Gmail SMTP Integration**: Uses Gmail's SMTP service with app passwords

## Configuration

### Environment Variables
Add these to your `config.env` file:
```
EMAIL_USER=taimoordev.op@gmail.com
EMAIL_PASS=hyig xorm attn ukia
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Use the generated app password in `EMAIL_PASS`

## Usage

### Automatic Emails
Emails are sent automatically during:
- User registration (welcome email)
- User login (greeting email)

### Manual Email Sending
```javascript
const { sendLoginGreeting, sendWelcomeEmail } = require('./utils/emailService');

// Send login greeting
await sendLoginGreeting('user@example.com', 'John Doe');

// Send welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');
```

## Email Templates

### Login Greeting Email
- Subject: "Welcome Back to ArtisanMart! 🎉"
- Content: Personalized greeting with app features and call-to-action

### Welcome Email
- Subject: "Welcome to ArtisanMart! 🎨"
- Content: Introduction to the platform with getting started guide

## Error Handling
- Email sending is non-blocking (won't affect user experience)
- Errors are logged to console for debugging
- Failed emails don't prevent login/registration from completing

## Testing
The email service has been tested and verified to work with the provided Gmail credentials.

## Security Notes
- App passwords are more secure than regular passwords
- Email credentials are stored in environment variables
- SMTP connection uses TLS encryption
