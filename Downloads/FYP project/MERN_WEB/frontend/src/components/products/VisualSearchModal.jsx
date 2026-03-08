import React, { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const VisualSearchModal = ({ isOpen, onClose, onSearchResults }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('/api/products/visual-search', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                if (onSearchResults) {
                    onSearchResults(data.products, data.analysis);
                } else {
                    // If no callback, we could navigate to products page with search results
                    // For now, let's assume we use it on the products page
                    console.log('Visual search results:', data);
                }
                onClose();
                // Clear state
                setSelectedImage(null);
                setPreviewUrl(null);
            } else {
                const errorMessage = data.error ? `${data.message}: ${data.error}` : data.message;
                setError(errorMessage || 'Failed to analyze image');
            }
        } catch (err) {
            console.error('Visual search error:', err);
            setError('Connection error. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FiCamera className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Visual Search</h2>
                            <p className="text-blue-100 text-sm">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    {!previewUrl ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                            />
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Upload Product Image</h3>
                            <p className="text-gray-500 mt-2">Click or drag and drop to identify similar products</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100 aspect-square max-h-64 mx-auto">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={isAnalyzing}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${isAnalyzing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                        }`}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <FiLoader className="w-5 h-5 animate-spin" />
                                            <span>AI Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle className="w-5 h-5" />
                                            <span>Find Matching Products</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isAnalyzing}
                                    className="text-gray-500 font-medium hover:text-gray-700 transition-colors py-2"
                                >
                                    Choose different image
                                </button>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center space-x-2 border border-red-100 animate-shake">
                            <FiX className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mt-8 text-center text-xs text-gray-400">
                        <p>Upload a clear photo of handcrafted jewelry, pottery, textiles, or any artisan product for the best results.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualSearchModal;
