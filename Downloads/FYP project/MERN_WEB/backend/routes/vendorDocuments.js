const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/vendor-documents',
    'uploads/vendor-documents/identity',
    'uploads/vendor-documents/business-license',
    'uploads/vendor-documents/tax-certificate',
    'uploads/vendor-documents/shop-photos',
    'uploads/vendor-documents/other'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for vendor documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/vendor-documents/';
    
    // Determine upload path based on document type
    const docType = req.body.type || 'other';
    uploadPath += docType.replace('_', '-') + '/';
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Clean filename (remove special characters)
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload PDF, images, or document files.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/vendor-documents/upload
// @desc    Upload vendor documents during registration
// @access  Public (for registration)
router.post('/upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = req.files.map(file => {
      // Normalize path separators (convert backslashes to forward slashes)
      const normalizedPath = file.path.replace(/\\/g, '/').replace('uploads/', '');
      
      return {
        type: req.body.types ? JSON.parse(req.body.types)[req.files.indexOf(file)] : 'other',
        fileName: file.originalname,
        filePath: normalizedPath, // Store normalized relative path
        uploadedAt: new Date()
      };
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      documents: uploadedDocuments
    });

  } catch (error) {
    console.error('Error uploading vendor documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading documents',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-documents/:filePath
// @desc    Serve vendor document files
// @access  Public
router.get('/:filePath(*)', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', 'vendor-documents', req.params.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Set appropriate headers
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
  } catch (error) {
    console.error('Error serving vendor document:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
});

module.exports = router;
