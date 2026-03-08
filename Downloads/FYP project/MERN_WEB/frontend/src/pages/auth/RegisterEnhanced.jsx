import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShoppingBag, FiMapPin, FiPhone, FiGlobe, FiFileText, FiUpload, FiX, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { uploadVendorDocuments } from '../../utils/vendorDocumentUpload'

const RegisterEnhanced = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    
    // Vendor Details
    vendorDetails: {
      businessName: '',
      businessType: 'individual',
      businessAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Pakistan'
      },
      businessPhone: '',
      businessEmail: '',
      businessWebsite: '',
      identityType: 'cnic',
      identityNumber: '',
      identityCountry: 'Pakistan',
      businessLicense: '',
      taxId: '',
      categories: [],
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: ''
      }
    }
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showApprovalMessage, setShowApprovalMessage] = useState(false)
  const [approvalMessage, setApprovalMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    exists: false,
    valid: null // null = not checked, true = available, false = exists
  })

  const { register } = useAuth()
  const navigate = useNavigate()

  // Debug: Track step changes
  useEffect(() => {
    console.log('🔄 Current step changed to:', currentStep)
  }, [currentStep])

  const formatCNIC = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as XXXXX-XXXXXX-X
    if (digits.length <= 5) {
      return digits
    } else if (digits.length <= 11) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 11)}-${digits.slice(11, 12)}`
    }
  }

  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailValidation({ checking: false, exists: false, valid: null })
      return
    }

    setEmailValidation({ checking: true, exists: false, valid: null })

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log('Email check response:', data)

      if (response.ok) {
        setEmailValidation({ 
          checking: false, 
          exists: data.exists, 
          valid: !data.exists // true if email doesn't exist (available), false if exists
        })
        console.log('Email validation updated:', { exists: data.exists, valid: !data.exists })
      } else {
        setEmailValidation({ checking: false, exists: false, valid: null })
        console.log('Email check failed:', response.status, data)
      }
    } catch (error) {
      console.error('Email check error:', error)
      setEmailValidation({ checking: false, exists: false, valid: null })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('vendorDetails.')) {
      const vendorField = name.replace('vendorDetails.', '')
      if (vendorField.includes('.')) {
        const [parent, child] = vendorField.split('.')
        setFormData(prev => ({
          ...prev,
          vendorDetails: {
            ...prev.vendorDetails,
            [parent]: {
              ...prev.vendorDetails[parent],
              [child]: value
            }
          }
        }))
      } else {
        // Format CNIC input in real-time
        let formattedValue = value
        if (vendorField === 'identityNumber' && formData.vendorDetails.identityType === 'cnic') {
          formattedValue = formatCNIC(value)
        }
        
        setFormData(prev => ({
          ...prev,
          vendorDetails: {
            ...prev.vendorDetails,
            [vendorField]: formattedValue
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      // Check email availability when email field changes
      if (name === 'email' && value.includes('@')) {
        // Clear any existing timeout
        if (window.emailCheckTimeout) {
          clearTimeout(window.emailCheckTimeout)
        }
        
        // Debounce the email check
        window.emailCheckTimeout = setTimeout(() => {
          checkEmailAvailability(value)
        }, 500)
      }
    }
  }

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      vendorDetails: {
        ...prev.vendorDetails,
        categories: prev.vendorDetails.categories.includes(category)
          ? prev.vendorDetails.categories.filter(c => c !== category)
          : [...prev.vendorDetails.categories, category]
      }
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: 'other',
      preview: URL.createObjectURL(file)
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateFileType = (fileId, type) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, type } : f
    ))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields')
          return false
        }
        if (emailValidation.exists) {
          toast.error('This email is already registered. Please use a different email or sign in instead.')
          return false
        }
        if (emailValidation.checking) {
          toast.error('Please wait while we verify your email address')
          return false
        }
        // Only proceed if email is valid and available (not null, not false)
        if (emailValidation.valid === false && !emailValidation.checking) {
          toast.error('This email is already registered. Please use a different email or sign in instead.')
          return false
        }
        // Don't proceed if email hasn't been validated yet
        if (emailValidation.valid === null && formData.email.includes('@') && !emailValidation.checking) {
          toast.error('Please wait for email validation to complete')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        return true
      
      case 2:
        if (formData.role === 'vendor') {
          const { vendorDetails } = formData
          if (!vendorDetails.businessName || !vendorDetails.businessPhone || !vendorDetails.identityNumber) {
            toast.error('Please fill in all required vendor fields')
            return false
          }
          if (vendorDetails.identityType === 'cnic' && !/^\d{5}-\d{6}-\d{1}$/.test(vendorDetails.identityNumber)) {
            toast.error('Please enter a valid CNIC number (format: 12345-123456-1)')
            return false
          }
        }
        return true
      
      case 3:
        if (formData.role === 'vendor' && uploadedFiles.length === 0) {
          toast.error('Please upload at least one document')
          return false
        }
        console.log('Step 3 validation passed')
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    console.log('🚀 handleNext called, current step:', currentStep)
    if (validateStep(currentStep)) {
      console.log('✅ Step validation passed, moving to step:', currentStep + 1)
      setCurrentStep(prev => {
        console.log('📝 setCurrentStep called, new step will be:', prev + 1)
        return prev + 1
      })
    } else {
      console.log('❌ Step validation failed')
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔴 handleSubmit called! Current step:', currentStep)
    
    // Only allow submission on the final step
    if (currentStep !== 3) {
      console.log('❌ Form submission blocked - not on final step')
      return
    }
    
    // Additional check: only submit if user explicitly clicked submit button
    if (!e.target || !e.target.type || e.target.type !== 'submit') {
      console.log('❌ Form submission blocked - not triggered by submit button')
      return
    }
    
    console.log('✅ Form submission allowed - proceeding with validation')
    
    if (!validateStep(currentStep)) return

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      
      // Upload documents if vendor
      if (formData.role === 'vendor' && uploadedFiles.length > 0) {
        setUploadingDocuments(true)
        toast.loading('Uploading documents...', { id: 'upload-docs' })
        
        const files = uploadedFiles.map(f => f.file)
        const types = uploadedFiles.map(f => f.type)
        
        const uploadResult = await uploadVendorDocuments(files, types)
        
        if (uploadResult.success) {
          toast.success('Documents uploaded successfully!', { id: 'upload-docs' })
          registerData.vendorDetails.documents = uploadResult.documents
        } else {
          toast.error(uploadResult.error || 'Failed to upload documents', { id: 'upload-docs' })
          setUploadingDocuments(false)
          setLoading(false)
          return
        }
        
        setUploadingDocuments(false)
      }

      const result = await register(registerData)
      
      if (result.success) {
        if (result.requiresApproval) {
          setApprovalMessage(result.message)
          setShowApprovalMessage(true)
          toast.success('Vendor registration request submitted!')
        } else {
          toast.success('Registration successful!')
          navigate('/dashboard')
        }
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show approval message instead of form
  if (showApprovalMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Request Submitted!</h2>
            <p className="text-gray-600 mb-6">{approvalMessage}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Our admin team will review your application within 1-3 business days</li>
                      <li>You'll receive an email notification once your application is reviewed</li>
                      <li>If approved, you'll gain access to vendor features and can start selling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="mt-2 text-sm text-gray-600">Step 1 of 3: Basic Information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <div className="mt-1 relative">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your full name"
            />
            <FiUser className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <div className="mt-1 relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`input-field pl-10 ${
                emailValidation.exists ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                emailValidation.valid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                emailValidation.checking ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500' :
                ''
              }`}
              placeholder="Enter your email"
            />
            <FiMail className="absolute left-3 top-2.5 text-gray-400" />
            {emailValidation.checking && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
              </div>
            )}
            {emailValidation.exists && !emailValidation.checking && (
              <FiX className="absolute right-3 top-2.5 text-red-500" />
            )}
            {emailValidation.valid === true && !emailValidation.checking && (
              <FiCheck className="absolute right-3 top-2.5 text-green-500" />
            )}
          </div>
          
          {/* Email validation messages */}
          {emailValidation.exists && !emailValidation.checking && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <FiX className="h-4 w-4 text-red-500 mr-2" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Email already exists</p>
                  <p className="text-sm text-red-600 mt-1">
                    This email is already registered. 
                    <Link to="/login" className="underline hover:text-red-800 ml-1">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {emailValidation.valid === true && !emailValidation.checking && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                <p className="text-sm text-green-800">Email is available</p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Account Type *
          </label>
          <div className="mt-1 relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field pl-10"
            >
              <option value="customer">Customer - I want to buy products</option>
              <option value="vendor">Vendor - I want to sell products</option>
            </select>
            <FiShoppingBag className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Create a password"
            />
            <FiLock className="absolute left-3 top-2.5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password *
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Confirm your password"
            />
            <FiLock className="absolute left-3 top-2.5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Information</h2>
        <p className="mt-2 text-sm text-gray-600">Step 2 of 3: Business Details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <input
            id="businessName"
            name="vendorDetails.businessName"
            type="text"
            required
            value={formData.vendorDetails.businessName}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
            Business Type *
          </label>
          <select
            id="businessType"
            name="vendorDetails.businessType"
            value={formData.vendorDetails.businessType}
            onChange={handleChange}
            className="input-field"
          >
            <option value="individual">Individual/Sole Proprietor</option>
            <option value="small_business">Small Business</option>
            <option value="enterprise">Enterprise</option>
            <option value="non_profit">Non-Profit Organization</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
              Business Phone *
            </label>
            <div className="mt-1 relative">
              <input
                id="businessPhone"
                name="vendorDetails.businessPhone"
                type="tel"
                required
                value={formData.vendorDetails.businessPhone}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="+92 300 1234567"
              />
              <FiPhone className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
              Business Email
            </label>
            <div className="mt-1 relative">
              <input
                id="businessEmail"
                name="vendorDetails.businessEmail"
                type="email"
                value={formData.vendorDetails.businessEmail}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="business@example.com"
              />
              <FiMail className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
            Business Website
          </label>
          <div className="mt-1 relative">
            <input
              id="businessWebsite"
              name="vendorDetails.businessWebsite"
              type="url"
              value={formData.vendorDetails.businessWebsite}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="https://yourwebsite.com"
            />
            <FiGlobe className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="identityType" className="block text-sm font-medium text-gray-700">
              Identity Document Type *
            </label>
            <select
              id="identityType"
              name="vendorDetails.identityType"
              value={formData.vendorDetails.identityType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="cnic">CNIC (Pakistan)</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="identityNumber" className="block text-sm font-medium text-gray-700">
              {formData.vendorDetails.identityType === 'cnic' ? 'CNIC Number *' : 
               formData.vendorDetails.identityType === 'passport' ? 'Passport Number *' : 
               'Identity Number *'}
            </label>
            <input
              id="identityNumber"
              name="vendorDetails.identityNumber"
              type="text"
              required
              value={formData.vendorDetails.identityNumber}
              onChange={handleChange}
              className="input-field"
              placeholder={formData.vendorDetails.identityType === 'cnic' ? '12345-123456-1' : 'Enter identity number'}
              maxLength={formData.vendorDetails.identityType === 'cnic' ? 15 : undefined}
            />
            {formData.vendorDetails.identityType === 'cnic' && (
              <p className="mt-1 text-xs text-gray-500">Format: 12345-123456-1 (13 digits total)</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <div className="space-y-3">
            <input
              name="vendorDetails.businessAddress.street"
              type="text"
              required
              value={formData.vendorDetails.businessAddress.street}
              onChange={handleChange}
              className="input-field"
              placeholder="Street Address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                name="vendorDetails.businessAddress.city"
                type="text"
                required
                value={formData.vendorDetails.businessAddress.city}
                onChange={handleChange}
                className="input-field"
                placeholder="City"
              />
              <input
                name="vendorDetails.businessAddress.state"
                type="text"
                required
                value={formData.vendorDetails.businessAddress.state}
                onChange={handleChange}
                className="input-field"
                placeholder="State/Province"
              />
              <input
                name="vendorDetails.businessAddress.zipCode"
                type="text"
                required
                value={formData.vendorDetails.businessAddress.zipCode}
                onChange={handleChange}
                className="input-field"
                placeholder="ZIP Code"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Categories *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['jewelry', 'clothing', 'home_decor', 'art_crafts', 'beauty_wellness', 'electronics', 'books_media', 'sports_outdoors', 'food_beverage', 'other'].map(category => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.vendorDetails.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">{category.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
        <p className="mt-2 text-sm text-gray-600">Step 3 of 3: Upload Required Documents</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Documents *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload your documents
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  CNIC/Passport, Business License, Shop Photos, etc.
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                      <p className="text-xs text-gray-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={file.type}
                      onChange={(e) => updateFileType(file.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="identity">Identity Document</option>
                      <option value="business_license">Business License</option>
                      <option value="tax_certificate">Tax Certificate</option>
                      <option value="shop_photos">Shop Photos</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Required Documents:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Valid CNIC copy (format: 12345-123456-1)</li>
            <li>• Business registration/license (if applicable)</li>
            <li>• Shop/store photos (at least 2-3 photos)</li>
            <li>• Tax registration certificate (if applicable)</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-artisan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step < currentStep ? <FiCheck className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && formData.role === 'vendor' && renderStep2()}
            {currentStep === 3 && formData.role === 'vendor' && (() => {
              console.log('🎨 Rendering Step 3 - Document Upload')
              return renderStep3()
            })()}
            {currentStep === 2 && formData.role === 'customer' && (
              <div className="text-center">
                <FiCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Register!</h2>
                <p className="text-gray-600">Your customer account is ready to be created.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 1 && (emailValidation.exists || emailValidation.checking || emailValidation.valid === null)}
                  className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    currentStep === 1 && (emailValidation.exists || emailValidation.checking || emailValidation.valid === null)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'text-white bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  Next
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading || uploadingDocuments || currentStep !== 3}
                  onClick={async (e) => {
                    e.preventDefault()
                    console.log('🎯 Submit button clicked, current step:', currentStep)
                    
                    if (currentStep !== 3) {
                      console.log('❌ Submit prevented - not on step 3')
                      return
                    }
                    
                    // Call handleSubmit directly with a synthetic event
                    const syntheticEvent = {
                      preventDefault: () => {},
                      target: { type: 'submit' }
                    }
                    await handleSubmit(syntheticEvent)
                  }}
                  className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading || uploadingDocuments ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FiCheck className="w-4 h-4 mr-2" />
                  )}
                  {uploadingDocuments 
                    ? 'Uploading Documents...' 
                    : formData.role === 'vendor' 
                      ? 'Submit Application' 
                      : 'Create Account'
                  }
                </button>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterEnhanced
