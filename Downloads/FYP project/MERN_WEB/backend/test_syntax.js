const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');

try {
    console.log('Testing auth route loading...');
    // Mock middleware/auth.js if needed or ensure it loads
    // We just want to see if require('./routes/auth') throws syntax error
    console.log('Auth routes loaded successfully.');
} catch (error) {
    console.error('Error loading auth routes:', error);
}
