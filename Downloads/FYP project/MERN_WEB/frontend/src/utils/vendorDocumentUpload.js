import api from './api'

export const uploadVendorDocuments = async (files, types) => {
  try {
    const formData = new FormData()
    
    // Add files to FormData
    files.forEach((file, index) => {
      formData.append('documents', file)
    })
    
    // Add types as JSON string
    formData.append('types', JSON.stringify(types))
    
    const response = await api.post('/vendor-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return {
      success: true,
      documents: response.data.documents
    }
  } catch (error) {
    console.error('Error uploading vendor documents:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload documents'
    }
  }
}

export const getVendorDocumentUrl = (filePath) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
  return `${baseUrl}/api/vendor-documents/${filePath}`
}
