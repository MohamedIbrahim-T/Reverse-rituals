import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ImageUpload = ({ 
  label = 'Upload Image', 
  folder = 'product',
  value = '',
  onChange,
  multiple = false
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || (multiple ? [] : ''));
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (multiple) {
      setPreview(value ? value.split(',').filter(Boolean) : []);
    } else {
      setPreview(value || '');
    }
  }, [value, multiple]);

  const getUploadEndpoint = () => {
    switch (folder) {
      case 'review': return '/api/upload/review-image';
      case 'whatsapp': return '/api/upload/review-image';
      case 'audio': return '/api/upload/review-audio';
      default: return '/api/upload/product';
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = getUploadEndpoint();
      console.log('Uploading to:', `${API_URL}${endpoint}`);
      const uploadedUrls = [];

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (folder === 'product' && user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append(folder === 'audio' ? 'audio' : 'image', file);

        const response = await axios.post(`${API_URL}${endpoint}`, formData, config);
        uploadedUrls.push(response.data.imageUrl || response.data.audioUrl);
      }

      if (multiple) {
        const newPreview = [...(preview || []), ...uploadedUrls];
        setPreview(newPreview);
        onChange?.(newPreview.join(','));
      } else {
        const imageUrl = uploadedUrls[0];
        setPreview(imageUrl);
        onChange?.(imageUrl);
      }

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    if (multiple) {
      const newPreview = [...(preview || [])];
      newPreview.splice(index, 1);
      setPreview(newPreview);
      onChange?.(newPreview.join(','));
    } else {
      setPreview('');
      onChange?.('');
    }
  };

  const imagesList = multiple ? preview : [];
  const singleImage = !multiple ? preview : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-[#064e3b]">{label}</label>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={folder === 'audio' ? 'audio/*,audio/mpeg,audio/wav,audio/mp3,audio/webm,audio/ogg' : 'image/jpeg,image/png,image/webp'}
        multiple={multiple}
        className="hidden"
      />

      {uploading ? (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#c5a059] rounded-2xl bg-[#c5a059]/5">
          <div className="flex items-center gap-2 text-[#c5a059]">
            <Loader2 className="animate-spin" size={24} />
            <span className="font-bold">Uploading...</span>
          </div>
        </div>
      ) : multiple ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[#c5a059] rounded-2xl text-[#c5a059] hover:bg-[#c5a059]/5 transition-all font-bold"
          >
            <Upload size={20} />
            Add More Images
          </button>
          
          <div className="grid grid-cols-3 gap-3">
            {imagesList.map((url, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square">
                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : singleImage ? (
        <div className="relative group rounded-2xl overflow-hidden">
          <img src={singleImage} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white text-[#064e3b] rounded-full hover:bg-gray-100"
            >
              <Upload size={20} />
            </button>
            <button
              type="button"
              onClick={() => removeImage()}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-[#c5a059] rounded-2xl text-[#c5a059] hover:bg-[#c5a059]/5 transition-all"
        >
          <Image size={24} />
          <span className="font-bold">{label || 'Upload Image'}</span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;