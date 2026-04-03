import React, { useState, useRef } from 'react';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';
import { transcriptAPI } from '../api';
import { useToast } from './Toast';
import './UploadZone.css';

const UploadZone = ({ meetingId, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndUpload = async (file) => {
    if (!file.name.endsWith('.vtt')) {
      addToast('Only .vtt transcript files are supported', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('meeting_id', meetingId);

    setIsUploading(true);
    try {
      const response = await transcriptAPI.upload(formData);
      addToast('Transcript uploaded successfully');
      onUploadComplete(response.data);
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to upload transcript', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".vtt" 
        style={{ display: 'none' }} 
      />
      
      {isUploading ? (
        <div className="upload-state">
          <div className="spinner"></div>
          <p>Uploading and starting AI analysis...</p>
        </div>
      ) : (
        <div className="upload-state">
          <div className="upload-icon-wrapper">
            <Upload size={24} className="upload-icon" />
          </div>
          <p className="upload-title">Drop your .vtt transcript here</p>
          <p className="upload-subtitle">or click to browse from your computer</p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
