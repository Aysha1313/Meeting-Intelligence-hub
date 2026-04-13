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

  const validateAndUploadMany = async (files) => {
    const validFiles = [];
    for (const file of files) {
      if (!file.name.endsWith('.vtt') && !file.name.endsWith('.txt')) {
        addToast(`File ${file.name} is not supported. Only .vtt and .txt files are supported`, 'error');
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    try {
      await Promise.all(validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('meeting_id', meetingId);

        try {
          const response = await transcriptAPI.upload(formData);
          onUploadComplete(response.data);
          successCount++;
        } catch (error) {
          addToast(error.response?.data?.detail || `Failed to upload transcript ${file.name}`, 'error');
        }
      }));

      if (successCount > 0) {
        addToast(`${successCount} transcript(s) uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUploadMany(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUploadMany(Array.from(e.target.files));
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
        accept=".vtt,.txt" 
        multiple
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
          <p className="upload-title">Drop your .vtt or .txt transcript here</p>
          <p className="upload-subtitle">or click to browse from your computer</p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
