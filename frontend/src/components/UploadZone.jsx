import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { transcriptAPI } from '../services/api';

const UploadZone = ({ meetingId, onSuccess, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, done

  const handleUpload = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'txt' && ext !== 'vtt') {
      setError('Only .txt and .vtt files are supported');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    setStatus('uploading');
    setError(null);

    try {
      // Simulate progress for UI feel
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const transcript = await transcriptAPI.upload(meetingId, file);
      clearInterval(progressInterval);
      setProgress(100);
      
      setStatus('processing');
      // Poll for status
      pollStatus(transcript.id);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      setStatus('idle');
    }
  };

  const pollStatus = async (id) => {
    const check = async () => {
      try {
        const { status } = await transcriptAPI.status(id);
        if (status === 'done') {
          setStatus('done');
          setTimeout(() => onSuccess(), 1500);
        } else if (status === 'failed') {
          setError('AI analysis failed.');
          setUploading(false);
        } else {
          setTimeout(check, 2000);
        }
      } catch (err) {
        setError('Status check failed.');
      }
    };
    check();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className={`upload-zone-wrapper ${isDragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}>
      <div 
        className="upload-dropzone"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {!uploading ? (
          <div className="zone-content">
            <Upload size={32} className="text-tertiary" />
            <p>Drop .txt or .vtt files here</p>
            <label className="browse-link">
              or browse files
              <input 
                type="file" 
                hidden 
                accept=".txt,.vtt" 
                onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} 
              />
            </label>
          </div>
        ) : (
          <div className="progress-content">
            <div className="progress-info">
              <span className="name">Transcript Analysis</span>
              <span className="status-label">
                {status === 'uploading' && 'Uploading...'}
                {status === 'processing' && 'AI analyzing...'}
                {status === 'done' && 'Complete!'}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div className={`progress-bar-fill ${status === 'done' ? 'success' : ''}`} style={{ width: `${progress}%` }} />
            </div>
            {status === 'processing' && (
              <div className="ai-status animate-fade-in">
                <Loader2 size={14} className="spinner" />
                <span>Extracting decisions & action items...</span>
              </div>
            )}
            {status === 'done' && (
              <div className="done-status animate-fade-in">
                <CheckCircle2 size={16} className="text-sentiment-positive" />
                <span>Success! Update reflected.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error animate-fade-in">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <button className="btn-close-upload" onClick={onClose}><X size={20} /></button>

      <style>{`
        .upload-zone-wrapper {
          position: relative;
          background: var(--bg-surface);
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          transition: all var(--duration-fast) var(--ease-smooth);
        }
        
        .is-dragging {
          border-color: var(--accent);
          background: var(--accent-glow);
          transform: scale(1.01);
        }
        
        .is-dragging .text-tertiary {
          color: var(--accent);
          transform: scale(1.1);
        }
        
        .upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 120px;
          cursor: pointer;
        }
        
        .zone-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        
        .zone-content p {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        
        .browse-link {
          color: var(--accent);
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .progress-content {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        
        .status-label {
          color: var(--accent);
          font-weight: 500;
        }
        
        .progress-bar-bg {
          height: 4px;
          background: var(--bg-card);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-bar-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s ease;
        }
        
        .progress-bar-fill.success {
          background: var(--sentiment-positive);
        }
        
        .ai-status, .done-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .upload-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: var(--sentiment-negative);
          font-size: 0.85rem;
          justify-content: center;
        }
        
        .has-error {
          border-color: var(--sentiment-negative);
          animation: flashRed 0.6s ease;
        }
        
        @keyframes flashRed {
          0%, 100% { border-color: var(--border); }
          50% { border-color: var(--sentiment-negative); }
        }
        
        .btn-close-upload {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
};

export default UploadZone;
