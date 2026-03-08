const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  specialties: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  experience: {
    years: String,
    description: String
  },
  education: {
    degree: String,
    institution: String,
    year: String
  },
  certifications: [{
    name: String,
    issuer: String,
    year: String
  }],
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    address: String
  },
  businessHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  policies: {
    shipping: String,
    returns: String,
    privacy: String
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search
vendorProfileSchema.index({ shopName: 'text', bio: 'text', specialties: 'text' });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);